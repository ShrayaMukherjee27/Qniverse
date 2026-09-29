import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

import { db, auth } from "./firebase";
import { getQuestions } from "./questionService";

function buildPlannerTopics(questions) {
  const topicMap = {};

  questions.forEach((question) => {
    const topic =
      question.topic &&
      question.topic !== "Unknown"
        ? question.topic
        : "Unclassified";

    if (!topicMap[topic]) {
      topicMap[topic] = {
        topic,
        questions: 0,
        marks: 0,
        years: new Set(),
        latestYear: 0,
        repetitions: 0
      };
    }

    topicMap[topic].questions += 1;

    topicMap[topic].marks +=
      Number(question.marks) || 0;

    if (question.year) {
      const year =
        Number(question.year);

      topicMap[topic].years.add(
        String(question.year)
      );

      if (year > topicMap[topic].latestYear) {
        topicMap[topic].latestYear =
          year;
      }
    }
  });

  const topics =
    Object.values(topicMap);

  const maxQuestions = Math.max(
    ...topics.map(
      (item) => item.questions
    ),
    1
  );

  const maxMarks = Math.max(
    ...topics.map(
      (item) => item.marks
    ),
    1
  );

  const maxYears = Math.max(
    ...topics.map(
      (item) => item.years.size
    ),
    1
  );

  topics.forEach((item) => {
    item.frequencyScore =
      (item.questions /
        maxQuestions) *
      45;

    item.marksScore =
      item.marks > 0
        ? (item.marks / maxMarks) * 25
        : 0;

    item.coverageScore =
      (item.years.size /
        maxYears) *
      20;

    item.recencyScore =
      item.latestYear > 0
        ? 10
        : 0;

    item.priorityScore = Math.round(
      item.frequencyScore +
        item.marksScore +
        item.coverageScore +
        item.recencyScore
    );

    if (
      item.priorityScore >= 70
    ) {
      item.priority = "HIGH";
    } else if (
      item.priorityScore >= 45
    ) {
      item.priority = "MEDIUM";
    } else {
      item.priority = "LOW";
    }

    item.years = [
      ...item.years
    ].sort(
      (a, b) =>
        Number(b) - Number(a)
    );
  });

  return topics.sort(
    (a, b) =>
      b.priorityScore -
      a.priorityScore
  );
}

async function getPlannerRecords() {
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

export async function getPlannerData() {
  const questions =
    await getQuestions();

  const records =
    await getPlannerRecords();

  const topics =
    buildPlannerTopics(
      questions
    );

  const progressMap = {};

  records.forEach((record) => {
    progressMap[
      record.topic
    ] = {
      id: record.id,
      completed:
        Boolean(record.completed)
    };
  });

  const finalTopics =
    topics.map((topic) => ({
      ...topic,
      completed:
        progressMap[
          topic.topic
        ]?.completed || false,
      plannerId:
        progressMap[
          topic.topic
        ]?.id || null
    }));

  const totalTopics =
    finalTopics.length;

  const completedTopics =
    finalTopics.filter(
      (topic) =>
        topic.completed
    ).length;

  const totalQuestions =
    questions.length;

  const totalMarks =
    questions.reduce(
      (sum, question) =>
        sum +
        (Number(question.marks) ||
          0),
      0
    );

  const completedMarks =
    finalTopics
      .filter(
        (topic) =>
          topic.completed
      )
      .reduce(
        (sum, topic) =>
          sum + topic.marks,
        0
      );

  const progress =
    totalTopics > 0
      ? Math.round(
          (completedTopics /
            totalTopics) *
            100
        )
      : 0;

  return {
    topics: finalTopics,
    totalTopics,
    completedTopics,
    totalQuestions,
    totalMarks,
    completedMarks,
    progress
  };
}

export async function togglePlannerTopic(
  topic,
  completed,
  existingId = null
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be logged in."
    );
  }

  if (existingId) {
    await updateDoc(
      doc(
        db,
        "planner",
        existingId
      ),
      {
        completed,
        updatedAt:
          serverTimestamp()
      }
    );

    return existingId;
  }

  const plannerRef =
    collection(db, "planner");

  const plannerDoc =
    await addDoc(
      plannerRef,
      {
        userId: user.uid,
        topic,
        completed,
        createdAt:
          serverTimestamp(),
        updatedAt:
          serverTimestamp()
      }
    );

  return plannerDoc.id;
}