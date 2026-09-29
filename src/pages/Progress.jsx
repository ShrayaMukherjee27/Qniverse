import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Brain,
  Check,
  Clock3,
  Flame,
  Gauge,
  RefreshCw,
  Target,
  Trophy,
  Zap
} from "lucide-react";

import { getProgressData } from "../services/progressService";

function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProgress() {
    try {
      setLoading(true);

      const result =
        await getProgressData();

      setData(result);
    } catch (error) {
      console.error(
        "Progress loading failed:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProgress();
  }, []);

  if (loading) {
    return (
      <div className="dashboard progress-page">
        <div className="progress-loading">
          <RefreshCw
            size={24}
            className="spin"
          />

          <span>
            Synchronizing progress matrix...
          </span>
        </div>
      </div>
    );
  }

  if (
    !data ||
    data.totalQuestions === 0
  ) {
    return (
      <div className="dashboard progress-page">
        <div className="page-header">
          <div>
            <span className="eyebrow">
              PROGRESS / STANDBY
            </span>

            <h1>
              Preparation Progress
            </h1>

            <p>
              Upload and analyze question
              papers to activate your
              progress intelligence.
            </p>
          </div>
        </div>

        <section className="panel progress-empty">
          <div className="progress-empty-icon">
            <Brain size={32} />
          </div>

          <h2>
            No learning data detected
          </h2>

          <p>
            Qniverse will calculate your
            preparation progress from your
            uploaded PYQs and completed
            study topics.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard progress-page">
      <div className="page-header progress-header">
        <div>
          <span className="eyebrow">
            PROGRESS / LIVE TELEMETRY
          </span>

          <h1>
            Preparation Progress
          </h1>

          <p>
            Track how much of your detected
            exam syllabus you have cleared.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={loadProgress}
        >
          <RefreshCw size={16} />
          Sync Progress
        </button>
      </div>

      <section className="progress-hero">
        <div className="progress-grid" />

        <div className="progress-hero-top">
          <div>
            <span>
              QNIVERSE / READINESS CORE
            </span>

            <div className="live-status">
              <i />
              LIVE
            </div>
          </div>

          <Gauge size={22} />
        </div>

        <div className="progress-hero-body">
          <div className="mastery-ring">
            <svg
              viewBox="0 0 120 120"
            >
              <circle
                cx="60"
                cy="60"
                r="50"
                className="ring-background"
              />

              <circle
                cx="60"
                cy="60"
                r="50"
                className="ring-progress"
                style={{
                  strokeDasharray: `${data.mastery * 3.14} 314`
                }}
              />
            </svg>

            <div className="mastery-value">
              <strong>
                {data.mastery}%
              </strong>

              <span>
                MASTERY
              </span>
            </div>
          </div>

          <div className="progress-hero-copy">
            <span>
              CURRENT PREPARATION LEVEL
            </span>

            <h2>
              {data.mastery >= 80
                ? "SYSTEM READY"
                : data.mastery >= 50
                ? "BUILDING MOMENTUM"
                : "CALIBRATION PHASE"}
            </h2>

            <p>
              {data.completedTopics} of{" "}
              {data.totalTopics} detected
              topics have been marked as
              completed in your study matrix.
            </p>

            <div className="hero-progress-track">
              <span
                style={{
                  width: `${data.mastery}%`
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="progress-stat-grid">
        <div className="progress-stat-card">
          <div className="progress-stat-icon">
            <Target size={18} />
          </div>

          <span>
            TOPICS CLEARED
          </span>

          <strong>
            {data.completedTopics}
            <small>
              /{data.totalTopics}
            </small>
          </strong>

          <p>
            study nodes completed
          </p>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon">
            <Brain size={18} />
          </div>

          <span>
            QUESTIONS ANALYZED
          </span>

          <strong>
            {data.totalQuestions}
          </strong>

          <p>
            across your PYQ archive
          </p>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon">
            <Zap size={18} />
          </div>

          <span>
            MARKS COVERAGE
          </span>

          <strong>
            {data.marksCoverage}%
          </strong>

          <p>
            estimated from cleared topics
          </p>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-icon">
            <Flame size={18} />
          </div>

          <span>
            REMAINING
          </span>

          <strong>
            {data.remainingTopics}
          </strong>

          <p>
            topics still in queue
          </p>
        </div>
      </div>

      <div className="progress-main-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                SUBJECT MATRIX
              </span>

              <h2>
                Preparation by Subject
              </h2>

              <p>
                Completion calculated from
                your uploaded topic data.
              </p>
            </div>

            <Activity size={20} />
          </div>

          <div className="subject-progress-list">
            {data.subjectProgress.map(
              (subject) => (
                <div
                  className="subject-progress"
                  key={subject.subject}
                >
                  <div className="subject-progress-top">
                    <div>
                      <strong>
                        {subject.subject}
                      </strong>

                      <span>
                        {subject.questions}{" "}
                        questions ·{" "}
                        {subject.topics} topics
                      </span>
                    </div>

                    <strong>
                      {subject.progress}%
                    </strong>
                  </div>

                  <div className="subject-progress-track">
                    <span
                      style={{
                        width: `${subject.progress}%`
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        <section className="panel next-focus-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                NEXT TARGET
              </span>

              <h2>
                Focus Protocol
              </h2>
            </div>

            <ArrowUpRight size={20} />
          </div>

          {data.nextFocus ? (
            <div className="next-focus">
              <div className="next-focus-scan">
                <div className="scan-line-progress" />
                <Brain size={32} />
              </div>

              <span>
                RECOMMENDED TOPIC
              </span>

              <h3>
                {data.nextFocus.topic}
              </h3>

              <p>
                This topic currently has{" "}
                <strong>
                  {data.nextFocus.questions}
                </strong>{" "}
                detected questions covering{" "}
                <strong>
                  {data.nextFocus.marks}
                </strong>{" "}
                marks.
              </p>

              <div className="focus-meta">
                <div>
                  <Target size={15} />
                  <span>
                    NOT CLEARED
                  </span>
                </div>

                <div>
                  <Zap size={15} />
                  <span>
                    HIGH ATTENTION
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="all-clear">
              <Trophy size={38} />

              <h3>
                Matrix Cleared
              </h3>

              <p>
                All detected topics are marked
                as completed.
              </p>
            </div>
          )}
        </section>
      </div>

      <section className="panel topic-mastery-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">
              TOPIC TELEMETRY
            </span>

            <h2>
              Topic Mastery
            </h2>

            <p>
              Every detected topic from your
              PYQs appears here.
            </p>
          </div>

          <Trophy size={20} />
        </div>

        <div className="topic-mastery-grid">
          {data.topicProgress.map(
            (topic, index) => (
              <div
                className={
                  topic.completed
                    ? "topic-mastery-card completed"
                    : "topic-mastery-card"
                }
                key={topic.topic}
              >
                <div className="topic-mastery-number">
                  {String(
                    index + 1
                  ).padStart(2, "0")}
                </div>

                <div className="topic-mastery-content">
                  <div>
                    <strong>
                      {topic.topic}
                    </strong>

                    <span>
                      {topic.questions} questions
                      {" · "}
                      {topic.marks} marks
                    </span>
                  </div>

                  <div
                    className={
                      topic.completed
                        ? "topic-state cleared"
                        : "topic-state"
                    }
                  >
                    {topic.completed ? (
                      <>
                        <Check size={13} />
                        CLEARED
                      </>
                    ) : (
                      <>
                        <Clock3 size={13} />
                        PENDING
                      </>
                    )}
                  </div>
                </div>

                <div className="topic-mini-track">
                  <span
                    style={{
                      width: `${
                        topic.progress
                      }%`
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </section>

      <div className="progress-bottom-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                ARCHIVE DISTRIBUTION
              </span>

              <h2>
                Questions by Year
              </h2>
            </div>

            <Clock3 size={20} />
          </div>

          <div className="year-bars">
            {data.yearProgress.map(
              (item) => {
                const max =
                  Math.max(
                    ...data.yearProgress.map(
                      (year) =>
                        year.count
                    ),
                    1
                  );

                const width =
                  (item.count / max) *
                  100;

                return (
                  <div
                    className="year-row"
                    key={item.year}
                  >
                    <span>
                      {item.year}
                    </span>

                    <div>
                      <i
                        style={{
                          width: `${width}%`
                        }}
                      />
                    </div>

                    <strong>
                      {item.count}
                    </strong>
                  </div>
                );
              }
            )}
          </div>
        </section>

        <section className="panel progress-system-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                SYSTEM TELEMETRY
              </span>

              <h2>
                Progress Engine
              </h2>
            </div>

            <Activity size={20} />
          </div>

          <div className="system-lines">
            <div>
              <span>
                PYQ ANALYSIS
              </span>

              <strong>
                ACTIVE
              </strong>
            </div>

            <div>
              <span>
                TOPIC DETECTION
              </span>

              <strong>
                ACTIVE
              </strong>
            </div>

            <div>
              <span>
                STUDY MATRIX
              </span>

              <strong>
                SYNCED
              </strong>
            </div>

            <div>
              <span>
                PROGRESS CORE
              </span>

              <strong>
                ONLINE
              </strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Progress;