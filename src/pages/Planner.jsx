import { useEffect, useState } from "react";
import {
  Activity,
  Brain,
  Check,
  Flame,
  Gauge,
  RefreshCw,
  Target,
  Zap
} from "lucide-react";

import {
  getPlannerData,
  togglePlannerTopic
} from "../services/plannerService";

function Planner() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");

  async function loadPlanner() {
    try {
      setLoading(true);
      const result = await getPlannerData();
      setData(result);
    } catch (error) {
      console.error(
        "Planner loading failed:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlanner();
  }, []);

  async function handleToggle(topic) {
    const current =
      data?.topics?.find(
        (item) =>
          item.topic === topic.topic
      );

    if (!current) {
      return;
    }

    try {
      setUpdating(topic.topic);

      await togglePlannerTopic(
        topic.topic,
        !current.completed,
        current.id
      );

      await loadPlanner();
    } catch (error) {
      console.error(
        "Planner update failed:",
        error
      );
    } finally {
      setUpdating("");
    }
  }

  if (loading) {
    return (
      <div className="dashboard planner-page">
        <div className="planner-loading">
          <RefreshCw
            size={25}
            className="spin"
          />

          <span>
            Building study matrix...
          </span>
        </div>
      </div>
    );
  }

  if (!data || data.topics.length === 0) {
    return (
      <div className="dashboard planner-page">
        <div className="page-header">
          <div>
            <span className="eyebrow">
              STUDY MATRIX / WAITING
            </span>

            <h1>
              Smart Study Planner
            </h1>

            <p>
              Upload question papers to
              generate your personalized
              study matrix.
            </p>
          </div>
        </div>

        <section className="panel planner-empty-panel">
          <Brain size={35} />

          <h2>
            No study intelligence yet
          </h2>

          <p>
            Qniverse needs analyzed PYQs
            before it can calculate topic
            priorities.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard planner-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            STUDY MATRIX / LIVE
          </span>

          <h1>
            Smart Study Planner
          </h1>

          <p>
            Your study priorities are generated
            from the question papers you uploaded.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={loadPlanner}
        >
          <RefreshCw size={16} />
          Refresh Matrix
        </button>
      </div>

      <section className="planner-command">
        <div className="planner-command-grid" />

        <div className="planner-command-top">
          <span>
            QNIVERSE / PRIORITY ENGINE
          </span>

          <div>
            <i />
            SYSTEM ONLINE
          </div>
        </div>

        <div className="planner-command-content">
          <div>
            <span>
              CURRENT STUDY LOAD
            </span>

            <strong>
              {data.totalQuestions}
            </strong>

            <p>
              analyzed questions across{" "}
              {data.totalTopics} topics
            </p>
          </div>

          <div className="planner-command-stats">
            <div>
              <Target size={16} />
              <span>
                {data.completedTopics}
              </span>
              <small>
                completed
              </small>
            </div>

            <div>
              <Gauge size={16} />
              <span>
                {data.progress}%
              </span>
              <small>
                progress
              </small>
            </div>

            <div>
              <Zap size={16} />
              <span>
                {data.highPriority}
              </span>
              <small>
                high priority
              </small>
            </div>
          </div>
        </div>

        <div className="planner-main-progress">
          <div>
            <span>
              STUDY MATRIX COMPLETION
            </span>

            <strong>
              {data.progress}%
            </strong>
          </div>

          <div className="progress-track large">
            <div
              className="progress-fill"
              style={{
                width: `${data.progress}%`
              }}
            />
          </div>
        </div>
      </section>

      <div className="planner-status-grid">
        <div className="planner-status-card">
          <div>
            <Flame size={18} />
          </div>

          <span>
            HIGH PRIORITY
          </span>

          <strong>
            {data.highPriority}
          </strong>

          <small>
            topics demanding attention
          </small>
        </div>

        <div className="planner-status-card">
          <div>
            <Activity size={18} />
          </div>

          <span>
            TOTAL TOPICS
          </span>

          <strong>
            {data.totalTopics}
          </strong>

          <small>
            detected from your PYQs
          </small>
        </div>

        <div className="planner-status-card">
          <div>
            <Check size={18} />
          </div>

          <span>
            COMPLETED
          </span>

          <strong>
            {data.completedTopics}
          </strong>

          <small>
            study nodes cleared
          </small>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">
              PRIORITY QUEUE
            </span>

            <h2>
              Topics to Attack
            </h2>

            <p>
              Higher priority topics are based
              on frequency, marks, year coverage
              and recent appearance.
            </p>
          </div>

          <Brain size={20} />
        </div>

        <div className="planner-topic-list">
          {data.topics.map(
            (topic, index) => (
              <div
                className={
                  topic.completed
                    ? "planner-topic completed"
                    : "planner-topic"
                }
                key={topic.topic}
              >
                <div className="planner-topic-rank">
                  {String(
                    index + 1
                  ).padStart(2, "0")}
                </div>

                <div className="planner-topic-main">
                  <div className="planner-topic-top">
                    <div>
                      <strong>
                        {topic.topic}
                      </strong>

                      <span>
                        {topic.questions} questions
                        {" · "}
                        {topic.marks} marks
                        {" · "}
                        {topic.years} years
                      </span>
                    </div>

                    <div
                      className={`priority-badge ${topic.priority.toLowerCase()}`}
                    >
                      {topic.priority}
                    </div>
                  </div>

                  <div className="planner-topic-bar">
                    <span
                      style={{
                        width: `${topic.score}%`
                      }}
                    />
                  </div>

                  <div className="planner-topic-bottom">
                    <span>
                      PRIORITY SCORE{" "}
                      {topic.score}
                    </span>

                    <span>
                      {topic.completed
                        ? "MASTERED"
                        : "NOT CLEARED"}
                    </span>
                  </div>
                </div>

                <button
                  className={
                    topic.completed
                      ? "planner-check completed"
                      : "planner-check"
                  }
                  onClick={() =>
                    handleToggle(topic)
                  }
                  disabled={
                    updating ===
                    topic.topic
                  }
                >
                  {topic.completed ? (
                    <Check size={16} />
                  ) : (
                    <Target size={16} />
                  )}
                </button>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}

export default Planner;