import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  doc,
  updateDoc,
  where,
  deleteDoc
} from "firebase/firestore";

import { db, auth } from "./firebase";
import { detectTopic } from "../utils/topicDetector";

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createPaperFingerprint(
  questions,
  subject,
  year
) {
  const texts = questions
    .map((question) =>
      normalizeText(question.text)
    )
    .filter(Boolean)
    .sort();

  return [
    normalizeText(subject),
    String(year || "").trim(),
    ...texts
  ].join("|");
}

function createQuestionKey(
  question,
  subject,
  year
) {
  return [
    normalizeText(subject),
    String(year || "").trim(),
    normalizeText(question.text)
  ].join("|");
}

export async function saveQuestions(
  questions,
  subject,
  year
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be logged in to save questions."
    );
  }

  if (!questions || questions.length === 0) {
    throw new Error(
      "No questions found in the paper."
    );
  }

  const cleanSubject =
    subject.trim();

  const cleanYear =
    String(year).trim();

  const fingerprint =
    createPaperFingerprint(
      questions,
      cleanSubject,
      cleanYear
    );

  const questionsRef =
    collection(db, "questions");

  const existingQuestionsQuery =
    query(
      questionsRef,
      where(
        "userId",
        "==",
        user.uid
      )
    );

  const existingQuestionsSnapshot =
    await getDocs(
      existingQuestionsQuery
    );

  const existingQuestions =
    existingQuestionsSnapshot.docs.map(
      (questionDoc) => ({
        id: questionDoc.id,
        ...questionDoc.data()
      })
    );

  const existingPaperGroups = {};

  for (const question of existingQuestions) {
    const key = createQuestionKey(
      question,
      question.subject,
      question.year
    );

    if (!existingPaperGroups[key]) {
      existingPaperGroups[key] = [];
    }

    existingPaperGroups[key].push(
      question
    );
  }

  const newQuestionKeys =
    questions.map((question) =>
      createQuestionKey(
        question,
        cleanSubject,
        cleanYear
      )
    );

  const existingMatchingQuestions =
    existingQuestions.filter(
      (question) => {
        const key =
          createQuestionKey(
            question,
            cleanSubject,
            cleanYear
          );

        return newQuestionKeys.includes(
          key
        );
      }
    );

  const matchingRatio =
    existingMatchingQuestions.length /
    questions.length;

  if (
    matchingRatio >= 0.8 &&
    existingQuestions.length > 0
  ) {
    throw new Error(
      `This ${cleanSubject} ${cleanYear} question paper has already been uploaded.`
    );
  }

  const papersRef =
    collection(db, "papers");

  const papersQuery =
    query(
      papersRef,
      where(
        "userId",
        "==",
        user.uid
      )
    );

  const papersSnapshot =
    await getDocs(papersQuery);

  const existingPaper =
    papersSnapshot.docs.find(
      (paperDoc) =>
        paperDoc.data().fingerprint ===
        fingerprint
    );

  if (existingPaper) {
    throw new Error(
      `This ${cleanSubject} ${cleanYear} question paper has already been uploaded.`
    );
  }

  const paperDoc =
    await addDoc(
      papersRef,
      {
        userId: user.uid,
        subject: cleanSubject,
        year: cleanYear,
        questionCount:
          questions.length,
        fingerprint,
        createdAt:
          serverTimestamp()
      }
    );

  for (const question of questions) {
    await addDoc(
      questionsRef,
      {
        userId: user.uid,
        paperId: paperDoc.id,
        subject: cleanSubject,
        year: cleanYear,
        number: question.number,
        text: question.text,
        marks: question.marks || 0,
        topic:
          question.topic ||
          "Unknown",
        confidence:
          question.confidence || 0,
        matchedKeywords:
          question.matchedKeywords ||
          [],
        createdAt:
          serverTimestamp()
      }
    );
  }

  console.log(
    "PAPER SAVED:",
    paperDoc.id
  );

  return {
    success: true,
    paperId: paperDoc.id
  };
}

export async function getQuestions() {
  const user = auth.currentUser;

  if (!user) {
    return [];
  }

  const questionsRef =
    collection(db, "questions");

  const questionsQuery =
    query(
      questionsRef,
      where(
        "userId",
        "==",
        user.uid
      )
    );

  const snapshot =
    await getDocs(
      questionsQuery
    );

  const questions =
    snapshot.docs.map(
      (questionDoc) => ({
        id: questionDoc.id,
        ...questionDoc.data()
      })
    );

  questions.sort((a, b) => {
    const aTime =
      a.createdAt?.toMillis?.() ||
      0;

    const bTime =
      b.createdAt?.toMillis?.() ||
      0;

    return bTime - aTime;
  });

  console.log(
    "QUESTIONS FETCHED:",
    questions.length
  );

  return questions;
}

export async function reAnalyzeQuestions() {
  console.log(
    "RE-ANALYSIS STARTED"
  );

  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be logged in."
    );
  }

  const questionsRef =
    collection(db, "questions");

  const questionsQuery =
    query(
      questionsRef,
      where(
        "userId",
        "==",
        user.uid
      )
    );

  const snapshot =
    await getDocs(
      questionsQuery
    );

  let updated = 0;

  for (
    const questionDoc of
    snapshot.docs
  ) {
    const question =
      questionDoc.data();

    const subject =
      question.subject || "";

    const text =
      question.text || "";

    if (!subject || !text) {
      continue;
    }

    const analysis =
      detectTopic(
        text,
        subject
      );

    await updateDoc(
      doc(
        db,
        "questions",
        questionDoc.id
      ),
      {
        topic:
          analysis.topic,
        confidence:
          analysis.confidence,
        matchedKeywords:
          analysis.matchedKeywords
      }
    );

    updated++;

    console.log(
      `Updated Q${question.number}:`,
      analysis.topic,
      analysis.confidence
    );
  }

  console.log(
    `RE-ANALYSIS COMPLETED: ${updated} questions updated`
  );

  return updated;
}

export async function getPlannerProgress() {
  const user = auth.currentUser;

  if (!user) {
    return [];
  }

  const plannerRef =
    collection(db, "planner");

  const plannerQuery =
    query(
      plannerRef,
      where(
        "userId",
        "==",
        user.uid
      )
    );

  const snapshot =
    await getDocs(
      plannerQuery
    );

  return snapshot.docs.map(
    (plannerDoc) => ({
      id: plannerDoc.id,
      ...plannerDoc.data()
    })
  );
}

export async function savePlannerProgress(
  topic,
  completed
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be logged in."
    );
  }

  const plannerRef =
    collection(db, "planner");

  const plannerQuery =
    query(
      plannerRef,
      where(
        "userId",
        "==",
        user.uid
      )
    );

  const snapshot =
    await getDocs(
      plannerQuery
    );

  const existing =
    snapshot.docs.find(
      (plannerDoc) =>
        plannerDoc.data().topic ===
        topic
    );

  if (existing) {
    await updateDoc(
      doc(
        db,
        "planner",
        existing.id
      ),
      {
        completed,
        updatedAt:
          serverTimestamp()
      }
    );

    return;
  }

  await addDoc(
    plannerRef,
    {
      userId: user.uid,
      topic,
      completed,
      updatedAt:
        serverTimestamp()
    }
  );
}

export async function findDuplicatePapers() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be logged in."
    );
  }

  const questionsRef =
    collection(db, "questions");

  const questionsQuery =
    query(
      questionsRef,
      where(
        "userId",
        "==",
        user.uid
      )
    );

  const snapshot =
    await getDocs(
      questionsQuery
    );

  const groups = {};

  snapshot.docs.forEach(
    (questionDoc) => {
      const question =
        questionDoc.data();

      const key =
        createQuestionKey(
          question,
          question.subject,
          question.year
        );

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push({
        id: questionDoc.id,
        ...question
      });
    }
  );

  const duplicateQuestions =
    Object.values(groups).filter(
      (group) =>
        group.length > 1
    );

  console.log(
    "DUPLICATE QUESTION GROUPS:",
    duplicateQuestions
  );

  return {
    duplicateQuestions
  };
}

export async function removeDuplicateQuestions() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be logged in."
    );
  }

  const questionsRef =
    collection(db, "questions");

  const questionsQuery =
    query(
      questionsRef,
      where(
        "userId",
        "==",
        user.uid
      )
    );

  const snapshot =
    await getDocs(
      questionsQuery
    );

  const groups = {};

  snapshot.docs.forEach(
    (questionDoc) => {
      const question =
        questionDoc.data();

      const key =
        createQuestionKey(
          question,
          question.subject,
          question.year
        );

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push({
        id: questionDoc.id,
        ...question
      });
    }
  );

  let deleted = 0;

  for (
    const group of
    Object.values(groups)
  ) {
    if (group.length <= 1) {
      continue;
    }

    group.sort((a, b) => {
      const aTime =
        a.createdAt?.toMillis?.() ||
        0;

      const bTime =
        b.createdAt?.toMillis?.() ||
        0;

      return aTime - bTime;
    });

    for (
      const question of
      group.slice(1)
    ) {
      await deleteDoc(
        doc(
          db,
          "questions",
          question.id
        )
      );

      deleted++;
    }
  }

  console.log(
    "DUPLICATE QUESTIONS DELETED:",
    deleted
  );

  return deleted;
}