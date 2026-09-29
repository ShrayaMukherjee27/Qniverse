import { getQuestions } from "./questionService";
import { getPlannerProgress } from "./questionService";

export async function getDashboardData() {
  const questions = await getQuestions();
  const planner = await getPlannerProgress();

  if (!questions.length) {
    return {
      totalQuestions: 0,
      totalTopics: 0,
      totalSubjects: 0,
      totalYears: 0,
      totalMarks: 0,
      completedTopics: 0,
      mastery: 0,
      subjects: [],
      topics: [],
      years: [],
      recentQuestions: [],
      nextFocus: null
    };
  }

  const topicMap = {};
  const subjectMap = {};
  const yearMap = {};

  questions.forEach((question) => {
    const topic =
      question.topic &&
      question.topic !== "Unknown"
        ? question.topic
        : "Unclassified";

    const subject =
      question.subject || "Unknown";

    const year =
      String(question.year || "Unknown");

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
    topicMap[topic].years.add(year);

    if (!subjectMap[subject]) {
      subjectMap[subject] = {
        subject,
        questions: 0,
        marks: 0,
        topics: new Set()
      };
    }

    subjectMap[subject].questions += 1;
    subjectMap[subject].marks +=
      Number(question.marks) || 0;
    subjectMap[subject].topics.add(topic);

    if (!yearMap[year]) {
      yearMap[year] = 0;
    }

    yearMap[year] += 1;
  });

  planner.forEach((item) => {
    if (topicMap[item.topic]) {
      topicMap[item.topic].completed =
        item.completed === true;
    }
  });

  const topics = Object.values(topicMap)
    .map((topic) => ({
      ...topic,
      years: topic.years.size,
      score: Math.min(
        100,
        topic.questions * 12 +
          topic.marks * 3 +
          topic.years.size * 8
      )
    }))
    .sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      return b.score - a.score;
    });

  const subjects = Object.values(subjectMap)
    .map((subject) => ({
      subject: subject.subject,
      questions: subject.questions,
      marks: subject.marks,
      topics: subject.topics.size
    }))
    .sort(
      (a, b) =>
        b.questions - a.questions
    );

  const years = Object.entries(yearMap)
    .map(([year, count]) => ({
      year,
      count
    }))
    .sort((a, b) =>
      String(b.year).localeCompare(
        String(a.year)
      )
    );

  const completedTopics =
    topics.filter(
      (topic) => topic.completed
    ).length;

  const totalTopics = topics.length;

  const mastery =
    totalTopics > 0
      ? Math.round(
          (completedTopics /
            totalTopics) *
            100
        )
      : 0;

  const totalMarks = questions.reduce(
    (sum, question) =>
      sum +
      (Number(question.marks) || 0),
    0
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
      .slice(0, 5);

  const nextFocus =
    topics.find(
      (topic) => !topic.completed
    ) || null;

  return {
    totalQuestions: questions.length,
    totalTopics,
    totalSubjects: subjects.length,
    totalYears: years.length,
    totalMarks,
    completedTopics,
    mastery,
    subjects,
    topics,
    years,
    recentQuestions,
    nextFocus
  };
}