import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import {
  BarChart3,
  BookOpen,
  FileText,
  Layers3,
  Repeat2,
  Target
} from "lucide-react";

import { getQuestions } from "../services/questionService";
import { findSimilarQuestions } from "../utils/similarity";

function Analysis() {
  const [searchParams] = useSearchParams();
  const selectedSubject =
    searchParams.get("subject") || "";

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] =
    useState(selectedSubject);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const data = await getQuestions();
        setQuestions(data);
      } catch (error) {
        console.error(
          "Failed to load questions:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  useEffect(() => {
    setSubject(selectedSubject);
  }, [selectedSubject]);

  const subjects = useMemo(() => {
    return [
      ...new Set(
        questions
          .map((question) => question.subject)
          .filter(Boolean)
      )
    ].sort();
  }, [questions]);

  const subjectQuestions = useMemo(() => {
    if (!subject) {
      return questions;
    }

    return questions.filter(
      (question) =>
        question.subject === subject
    );
  }, [questions, subject]);

  const years = useMemo(() => {
    return [
      ...new Set(
        subjectQuestions
          .map((question) =>
            String(question.year)
          )
          .filter(
            (year) =>
              year &&
              year !== "undefined"
          )
      )
    ].sort(
      (a, b) => Number(a) - Number(b)
    );
  }, [subjectQuestions]);

  const topics = useMemo(() => {
    return [
      ...new Set(
        subjectQuestions
          .map((question) => question.topic)
          .filter(
            (topic) =>
              topic &&
              topic !== "Unknown"
          )
      )
    ].sort();
  }, [subjectQuestions]);

  const similarQuestions = useMemo(() => {
    return findSimilarQuestions(
      subjectQuestions,
      0.45
    );
  }, [subjectQuestions]);

  const yearData = useMemo(() => {
    return years.map((year) => ({
      year,
      questions:
        subjectQuestions.filter(
          (question) =>
            String(question.year) === year
        ).length
    }));
  }, [years, subjectQuestions]);

  const totalMarks = subjectQuestions.reduce(
    (sum, question) =>
      sum +
      (Number(question.marks) || 0),
    0
  );

  const averageMarks =
    subjectQuestions.length > 0
      ? (
          totalMarks /
          subjectQuestions.length
        ).toFixed(1)
      : "0";

  const topicPriority = useMemo(() => {
    if (!subjectQuestions.length) {
      return [];
    }

    const maxYear = Math.max(
      ...subjectQuestions.map(
        (question) =>
          Number(question.year) || 0
      )
    );

    const topicData = topics.map((topic) => {
      const topicQuestions =
        subjectQuestions.filter(
          (question) =>
            question.topic === topic
        );

      const frequency =
        topicQuestions.length /
        subjectQuestions.length;

      const topicYears = new Set(
        topicQuestions.map(
          (question) =>
            String(question.year)
        )
      );

      const yearCoverage =
        years.length > 0
          ? topicYears.size /
            years.length
          : 0;

      const topicMarks =
        topicQuestions.reduce(
          (sum, question) =>
            sum +
            (Number(question.marks) || 0),
          0
        );

      const maxMarks =
        subjectQuestions.reduce(
          (sum, question) =>
            sum +
            (Number(question.marks) || 0),
          0
        );

      const marksWeight =
        maxMarks > 0
          ? topicMarks / maxMarks
          : frequency;

      const latestYear = Math.max(
        ...topicQuestions.map(
          (question) =>
            Number(question.year) || 0
        )
      );

      const recency =
        maxYear > 0 &&
        latestYear > 0
          ? latestYear / maxYear
          : 0;

      const priority = Math.round(
        frequency * 45 +
          yearCoverage * 30 +
          marksWeight * 15 +
          recency * 10
      );

      return {
        topic,
        questions:
          topicQuestions.length,
        years: topicYears.size,
        marks: topicMarks,
        priority: Math.min(
          priority,
          100
        )
      };
    });

    return topicData.sort(
      (a, b) =>
        b.priority - a.priority
    );
  }, [
    subjectQuestions,
    topics,
    years
  ]);

  const examSignal = useMemo(() => {
    return topicPriority
      .slice(0, 6)
      .map((item) => {
        const frequencyScore =
          subjectQuestions.length > 0
            ? item.questions /
              subjectQuestions.length
            : 0;

        const yearScore =
          years.length > 0
            ? item.years /
              years.length
            : 0;

        const marksScore =
          totalMarks > 0
            ? item.marks /
              totalMarks
            : 0;

        const signal = Math.round(
          frequencyScore * 45 +
            yearScore * 30 +
            marksScore * 25
        );

        return {
          ...item,
          signal: Math.min(
            signal,
            100
          )
        };
      })
      .sort(
        (a, b) =>
          b.signal - a.signal
      );
  }, [
    topicPriority,
    subjectQuestions,
    years,
    totalMarks
  ]);

  const topicYearData = useMemo(() => {
    return topics.map((topic) => {
      const row = {
        topic
      };

      years.forEach((year) => {
        row[year] =
          subjectQuestions.filter(
            (question) =>
              question.topic === topic &&
              String(question.year) ===
                year
          ).length;
      });

      return row;
    });
  }, [
    topics,
    years,
    subjectQuestions
  ]);

  const repeatedCount =
    similarQuestions.length;

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-header">
          <div>
            <span className="eyebrow">
              EXAM INTELLIGENCE
            </span>

            <h1>Analysis</h1>

            <p>
              Loading your question
              analysis...
            </p>
          </div>
        </div>

        <div className="panel">
          Loading questions...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            EXAM INTELLIGENCE
          </span>

          <h1>Analysis</h1>

          <p>
            Identify recurring topics,
            question patterns and
            high-priority areas.
          </p>
        </div>

        <div className="analysis-filter">
          <select
            value={subject}
            onChange={(event) =>
              setSubject(
                event.target.value
              )
            }
          >
            <option value="">
              All Subjects
            </option>

            {subjects.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={19} />
          </div>

          <div>
            <span>
              Total Questions
            </span>

            <strong>
              {subjectQuestions.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Layers3 size={19} />
          </div>

          <div>
            <span>
              Topics Detected
            </span>

            <strong>
              {topics.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Repeat2 size={19} />
          </div>

          <div>
            <span>
              Similar Pairs
            </span>

            <strong>
              {repeatedCount}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Target size={19} />
          </div>

          <div>
            <span>
              Average Marks
            </span>

            <strong>
              {averageMarks}
            </strong>
          </div>
        </div>
      </div>

      <section className="panel exam-signal-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">
              EXAM SIGNAL
            </span>

            <h2>
              What deserves your attention
            </h2>

            <p className="panel-description">
              Signal strength is calculated
              from topic frequency, year
              coverage and marks across
              your uploaded PYQs.
            </p>
          </div>

          <Target size={20} />
        </div>

        {examSignal.length > 0 ? (
          <div className="exam-signal-list">
            {examSignal.map(
              (item, index) => (
                <div
                  className="exam-signal-item"
                  key={item.topic}
                >
                  <div className="exam-signal-rank">
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </div>

                  <div className="exam-signal-content">
                    <div className="exam-signal-top">
                      <div>
                        <strong>
                          {item.topic}
                        </strong>

                        <span>
                          {item.questions}{" "}
                          questions ·{" "}
                          {item.years}{" "}
                          years ·{" "}
                          {item.marks}{" "}
                          marks
                        </span>
                      </div>

                      <div className="exam-signal-score">
                        <strong>
                          {item.signal}%
                        </strong>

                        <span>
                          signal
                        </span>
                      </div>
                    </div>

                    <div className="exam-signal-track">
                      <div
                        className="exam-signal-fill"
                        style={{
                          width: `${item.signal}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="empty-state">
            Upload more PYQs to
            generate exam signals.
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">
              PATTERN SCAN
            </span>

            <h2>
              What your PYQs are showing
            </h2>
          </div>

          <Repeat2 size={20} />
        </div>

        {examSignal.length > 0 ? (
          <div className="pattern-grid">
            <div className="pattern-card">
              <div className="pattern-icon">
                <Repeat2 size={18} />
              </div>

              <div>
                <span>
                  MOST REPEATED TOPIC
                </span>

                <strong>
                  {examSignal[0].topic}
                </strong>

                <p>
                  Appeared in{" "}
                  {examSignal[0].questions}{" "}
                  questions across{" "}
                  {examSignal[0].years}{" "}
                  years.
                </p>
              </div>
            </div>

            <div className="pattern-card">
              <div className="pattern-icon">
                <Target size={18} />
              </div>

              <div>
                <span>
                  STRONGEST SIGNAL
                </span>

                <strong>
                  {examSignal[0].signal}%
                </strong>

                <p>
                  {examSignal[0].topic}{" "}
                  currently has the
                  highest combined
                  signal.
                </p>
              </div>
            </div>

            <div className="pattern-card">
              <div className="pattern-icon">
                <BookOpen size={18} />
              </div>

              <div>
                <span>
                  TOPIC COVERAGE
                </span>

                <strong>
                  {topics.length}
                </strong>

                <p>
                  Topics have been
                  detected from your
                  uploaded question
                  papers.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            No patterns available yet.
          </div>
        )}
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                YEAR DISTRIBUTION
              </span>

              <h2>
                Questions by Year
              </h2>
            </div>

            <BarChart3 size={20} />
          </div>

          {yearData.length > 0 ? (
            <div
              style={{
                width: "100%",
                height: 300
              }}
            >
              <ResponsiveContainer>
                <BarChart
                  data={yearData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="questions"
                    radius={[
                      6,
                      6,
                      0,
                      0
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              No year data available.
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                PRIORITY SIGNAL
              </span>

              <h2>
                Topics to Focus On
              </h2>
            </div>

            <Target size={20} />
          </div>

          {topicPriority.length > 0 ? (
            <div className="priority-list">
              {topicPriority
                .slice(0, 6)
                .map((item) => (
                  <div
                    className="priority-item"
                    key={item.topic}
                  >
                    <div className="priority-main">
                      <div>
                        <strong>
                          {item.topic}
                        </strong>

                        <span>
                          {item.questions}{" "}
                          questions{" "}
                          {" · "}{" "}
                          {item.years}{" "}
                          years
                        </span>
                      </div>

                      <strong>
                        {item.priority}%
                      </strong>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${item.priority}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="empty-state">
              No topic data available.
            </div>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">
              TOPIC COVERAGE
            </span>

            <h2>
              Topic by Year
            </h2>
          </div>

          <BookOpen size={20} />
        </div>

        {topicYearData.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    Topic
                  </th>

                  {years.map((year) => (
                    <th key={year}>
                      {year}
                    </th>
                  ))}

                  <th>
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {topicYearData.map(
                  (row) => (
                    <tr key={row.topic}>
                      <td>
                        <strong>
                          {row.topic}
                        </strong>
                      </td>

                      {years.map(
                        (year) => (
                          <td key={year}>
                            {row[year] ||
                              0}
                          </td>
                        )
                      )}

                      <td>
                        <strong>
                          {years.reduce(
                            (
                              sum,
                              year
                            ) =>
                              sum +
                              (row[
                                year
                              ] ||
                                0),
                            0
                          )}
                        </strong>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            No topic coverage
            available.
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">
              TOPIC DETAILS
            </span>

            <h2>
              Topic Breakdown
            </h2>
          </div>
        </div>

        {topicPriority.length > 0 ? (
          <div className="topic-grid">
            {topicPriority.map(
              (item) => (
                <div
                  className="topic-card"
                  key={item.topic}
                >
                  <div className="topic-card-top">
                    <span>
                      {item.topic}
                    </span>

                    <strong>
                      {item.priority}
                    </strong>
                  </div>

                  <div className="topic-meta">
                    <span>
                      {item.questions}{" "}
                      questions
                    </span>

                    <span>
                      {item.years} years
                    </span>

                    <span>
                      {item.marks} marks
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="empty-state">
            No topics detected yet.
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">
              REPETITION DETECTION
            </span>

            <h2>
              Repeated & Similar
              Questions
            </h2>
          </div>

          <Repeat2 size={20} />
        </div>

        {similarQuestions.length > 0 ? (
          <div className="similar-list">
            {similarQuestions
              .slice(0, 10)
              .map(
                (
                  pair,
                  index
                ) => (
                  <div
                    className="similar-card"
                    key={`${pair.first.id}-${pair.second.id}-${index}`}
                  >
                    <div className="similar-score">
                      {pair.similarity}%
                    </div>

                    <div className="similar-content">
                      <div className="similar-question">
                        <span>
                          Q
                          {
                            pair
                              .first
                              .number
                          }{" "}
                          ·{" "}
                          {
                            pair
                              .first
                              .year
                          }
                        </span>

                        <p>
                          {
                            pair
                              .first
                              .text
                          }
                        </p>
                      </div>

                      <div className="similar-divider">
                        <Repeat2
                          size={16}
                        />
                      </div>

                      <div className="similar-question">
                        <span>
                          Q
                          {
                            pair
                              .second
                              .number
                          }{" "}
                          ·{" "}
                          {
                            pair
                              .second
                              .year
                          }
                        </span>

                        <p>
                          {
                            pair
                              .second
                              .text
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
          </div>
        ) : (
          <div className="empty-state">
            No strongly similar
            questions found.
          </div>
        )}
      </section>
    </div>
  );
}

export default Analysis;