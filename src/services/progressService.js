import { getQuestions, getPlannerProgress } from "./questionService";

function calculateTopicProgress(questions, planner) {
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
        completed: false
      };
    }

    topicMap[topic].questions += 1;
    topicMap[topic].marks +=
      Number(question.marks) || 0;

    if (question.year) {
      topicMap[topic].years.add(
        String(question.year)
      );
    }
  });

  planner.forEach((item) => {
    if (topicMap[item.topic]) {
      topicMap[item.topic].completed =
        item.completed === true;
    }
  });

  return Object.values(topicMap).map((item) => ({
    topic: item.topic,
    questions: item.questions,
    marks: item.marks,
    years: item.years.size,
    completed: item.completed,
    progress: item.completed ? 100 : 0
  }));
}

function calculateSubjectProgress(questions, topicProgress) {
  const subjects = {};

  questions.forEach((question) => {
    const subject =
      question.subject || "Unknown";

    if (!subjects[subject]) {
      subjects[subject] = {
        subject,
        questions: 0,
        marks: 0,
        topics: new Set(),
        completedTopics: 0
      };
    }

    subjects[subject].questions += 1;
    subjects[subject].marks +=
      Number(question.marks) || 0;

    const topic =
      question.topic &&
      question.topic !== "Unknown"
        ? question.topic
        : "Unclassified";

    subjects[subject].topics.add(topic);
  });

  topicProgress.forEach((topic) => {
    const matchingQuestions =
      questions.filter((question) => {
        const questionTopic =
          question.topic &&
          question.topic !== "Unknown"
            ? question.topic
            : "Unclassified";

        return questionTopic === topic.topic;
      });

    const subjectNames = [
      ...new Set(
        matchingQuestions.map(
          (question) =>
            question.subject || "Unknown"
        )
      )
    ];

    subjectNames.forEach((subject) => {
      if (
        subjects[subject] &&
        topic.completed
      ) {
        subjects[subject].completedTopics += 1;
      }
    });
  });

  return Object.values(subjects).map((subject) => {
    const totalTopics =
      subject.topics.size;

    const progress =
      totalTopics > 0
        ? Math.round(
            (subject.completedTopics /
              totalTopics) *
              100
          )
        : 0;

    return {
      ...subject,
      topics: totalTopics,
      progress
    };
  });
}

function calculateYearProgress(questions) {
  const years = {};

  questions.forEach((question) => {
    const year =
      String(question.year || "Unknown");

    if (!years[year]) {
      years[year] = 0;
    }

    years[year] += 1;
  });

  return Object.entries(years)
    .map(([year, count]) => ({
      year,
      count
    }))
    .sort((a, b) =>
      String(b.year).localeCompare(
        String(a.year)
      )
    );
}

function getNextFocus(topicProgress) {
  const incomplete = topicProgress
    .filter((topic) => !topic.completed)
    .sort((a, b) => {
      if (b.questions !== a.questions) {
        return b.questions - a.questions;
      }

      return b.marks - a.marks;
    });

  return incomplete[0] || null;
}

function calculateMastery(topicProgress) {
  if (topicProgress.length === 0) {
    return 0;
  }

  const completed =
    topicProgress.filter(
      (topic) => topic.completed
    ).length;

  return Math.round(
    (completed /
      topicProgress.length) *
      100
  );
}

export async function getProgressData() {
  const questions =
    await getQuestions();

  const planner =
    await getPlannerProgress();

  const topicProgress =
    calculateTopicProgress(
      questions,
      planner
    );

  const subjectProgress =
    calculateSubjectProgress(
      questions,
      topicProgress
    );

  const yearProgress =
    calculateYearProgress(
      questions
    );

  const totalQuestions =
    questions.length;

  const totalTopics =
    topicProgress.length;

  const completedTopics =
    topicProgress.filter(
      (topic) => topic.completed
    ).length;

  const remainingTopics =
    totalTopics - completedTopics;

  const totalMarks =
    questions.reduce(
      (sum, question) =>
        sum +
        (Number(question.marks) || 0),
      0
    );

  const masteredMarks =
    topicProgress
      .filter((topic) => topic.completed)
      .reduce(
        (sum, topic) =>
          sum + topic.marks,
        0
      );

  const mastery =
    calculateMastery(
      topicProgress
    );

  const marksCoverage =
    totalMarks > 0
      ? Math.round(
          (masteredMarks /
            totalMarks) *
            100
        )
      : 0;

  const nextFocus =
    getNextFocus(
      topicProgress
    );

  const recentQuestions =
    [...questions]
      .sort((a, b) => {
        const aTime =
          a.createdAt?.toMillis?.() || 0;

        const bTime =
          b.createdAt?.toMillis?.() || 0;

        return bTime - aTime;
      })
      .slice(0, 8);

  return {
    totalQuestions,
    totalTopics,
    completedTopics,
    remainingTopics,
    totalMarks,
    masteredMarks,
    mastery,
    marksCoverage,
    topicProgress,
    subjectProgress,
    yearProgress,
    nextFocus,
    recentQuestions
  };
}