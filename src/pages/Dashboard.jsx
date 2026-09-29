import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  FileUp,
  GitBranch,
  GraduationCap,
  Moon,
  Sparkles,
  Sun,
  Trophy,
  UserRound
} from "lucide-react";

import { getDashboardData } from "../services/dashboardService";
import { useAuth } from "../context/AuthContext";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [profileOpen, setProfileOpen] =
    useState(false);
  const [darkMode, setDarkMode] =
    useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const result =
          await getDashboardData();

        setData(result);
      } catch (error) {
        console.error(
          "Dashboard loading failed:",
          error
        );
      }
    }

    loadDashboard();
  }, []);

  const displayName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Student";

  const firstName =
    displayName
      .split(" ")[0]
      .replace(/^./, (letter) =>
        letter.toUpperCase()
      );

  const mastery =
    data?.mastery || 0;

  const totalQuestions =
    data?.totalQuestions || 0;

  const totalTopics =
    data?.totalTopics || 0;

  const totalSubjects =
    data?.totalSubjects || 0;

  const recentQuestions =
    data?.recentQuestions || [];

  const topics =
    data?.topics || [];

  function go(path) {
    setProfileOpen(false);
    navigate(path);
  }

  return (
    <div
      className={
        darkMode
          ? "overview-page overview-dark"
          : "overview-page"
      }
    >
      <header className="overview-nav">
        <button
          className="overview-brand"
          onClick={() =>
            go("/dashboard")
          }
        >
          <span className="brand-mark">
            <Sparkles size={17} />
          </span>

          <strong>
            Qniverse
          </strong>
        </button>

        <nav className="overview-links">
          <button
            className="active"
            onClick={() =>
              go("/dashboard")
            }
          >
            Overview
          </button>

          <button
            onClick={() =>
              go("/subjects")
            }
          >
            Subjects
          </button>

          <button
            onClick={() =>
              go("/upload")
            }
          >
            Upload PYQs
          </button>

          <button
            onClick={() =>
              go("/analysis")
            }
          >
            Analysis
          </button>

          <button
            onClick={() =>
              go("/concept-graph")
            }
          >
            Concept Graph
          </button>

          <button
            onClick={() =>
              go("/questions")
            }
          >
            Questions
          </button>

          <button
            onClick={() =>
              go("/planner")
            }
          >
            Planner
          </button>

          <button
            onClick={() =>
              go("/progress")
            }
          >
            Progress
          </button>
        </nav>

        <div className="overview-profile">
          <button
            className="theme-button"
            onClick={() =>
              setDarkMode(
                (value) => !value
              )
            }
          >
            {darkMode ? (
              <Sun size={17} />
            ) : (
              <Moon size={17} />
            )}
          </button>

          <button
            className="profile-button"
            onClick={() =>
              setProfileOpen(
                (value) => !value
              )
            }
          >
            <span className="profile-avatar">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                />
              ) : (
                <UserRound
                  size={17}
                />
              )}
            </span>

            <span>
              {firstName}
            </span>

            <span className="profile-dot" />
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <div className="profile-menu-user">
                <div className="profile-avatar large">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                    />
                  ) : (
                    <UserRound
                      size={18}
                    />
                  )}
                </div>

                <div>
                  <strong>
                    {displayName}
                  </strong>

                  <span>
                    {user?.email}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  go("/progress")
                }
              >
                <UserRound
                  size={15}
                />
                Profile
              </button>

              <button
                onClick={() =>
                  setDarkMode(
                    (value) => !value
                  )
                }
              >
                {darkMode ? (
                  <Sun size={15} />
                ) : (
                  <Moon size={15} />
                )}
                Appearance
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="overview-main">
        <section className="overview-hero">
          <span className="welcome-script">
            welcome to
          </span>

          <h1>
            Qniverse

            <Sparkles
              className="hero-spark"
              size={27}
            />
          </h1>

          <p>
            Your question papers are about to
            become exam intelligence.
          </p>
        </section>

        <section className="overview-canvas">

          <button
            className="overview-card upload-card"
            onClick={() =>
              go("/upload")
            }
          >
            <span className="card-arrow">
              <ArrowUpRight size={17} />
            </span>

            <div className="card-icon">
              <FileUp size={23} />
            </div>

            <span className="card-kicker">
              START HERE
            </span>

            <h2>
              Upload PYQs
            </h2>

            <p>
              Feed your question papers into
              the intelligence engine.
            </p>

            <div className="upload-preview">
              <span>PDF</span>
              <span>JPG</span>
              <span>PNG</span>
            </div>

            <strong className="card-link">
              Upload paper
              <ArrowUpRight size={13} />
            </strong>
          </button>

          <button
            className="overview-card analysis-card"
            onClick={() =>
              go("/analysis")
            }
          >
            <div className="analysis-top">
              <div>
                <span className="card-kicker">
                  INTELLIGENCE HUB
                </span>

                <h2>
                  <Sparkles size={19} />
                  Analysis
                </h2>

                <p>
                  Patterns hiding inside your
                  PYQs.
                </p>
              </div>

              <span className="live-pill">
                <i />
                LIVE
              </span>
            </div>

            <div className="analysis-chart">
              <div className="chart-grid" />

              <svg
                viewBox="0 0 700 210"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="chartArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#8d82ff"
                      stopOpacity="0.5"
                    />

                    <stop
                      offset="100%"
                      stopColor="#8d82ff"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  d="M0 160 C50 120 75 145 115 100 C160 45 185 145 230 125 C275 105 290 45 340 92 C390 140 410 65 455 88 C505 112 530 60 565 72 C610 87 650 38 700 45 L700 210 L0 210 Z"
                  fill="url(#chartArea)"
                />

                <path
                  d="M0 160 C50 120 75 145 115 100 C160 45 185 145 230 125 C275 105 290 45 340 92 C390 140 410 65 455 88 C505 112 530 60 565 72 C610 87 650 38 700 45"
                  fill="none"
                  stroke="#958bff"
                  strokeWidth="4"
                />

                <circle
                  cx="565"
                  cy="72"
                  r="6"
                  fill="#ffffff"
                />
              </svg>
            </div>

            <div className="analysis-footer">
              <div>
                <span>
                  PYQs ANALYZED
                </span>

                <strong>
                  {totalQuestions}
                </strong>
              </div>

              <div>
                <span>
                  MASTERY
                </span>

                <strong>
                  {mastery}%
                </strong>
              </div>

              <div>
                <span>
                  TOPICS
                </span>

                <strong>
                  {totalTopics}
                </strong>
              </div>
            </div>
          </button>

          <button
            className="overview-card questions-card"
            onClick={() =>
              go("/questions")
            }
          >
            <span className="card-arrow">
              <ArrowUpRight size={17} />
            </span>

            <div className="card-icon purple">
              <BookOpen size={23} />
            </div>

            <span className="card-kicker">
              EXPLORE
            </span>

            <h2>
              Questions
            </h2>

            <p>
              Every detected question,
              organized in one place.
            </p>

            <div className="question-stack">
              {recentQuestions
                .slice(0, 3)
                .map(
                  (
                    question,
                    index
                  ) => (
                    <div
                      key={
                        question.id ||
                        index
                      }
                    >
                      <b>
                        Q
                        {question.number ||
                          index +
                            1}
                      </b>

                      <span>
                        {question.text?.slice(
                          0,
                          42
                        ) ||
                          "Detected question"}
                      </span>

                      <small>
                        {question.year ||
                          "—"}
                      </small>
                    </div>
                  )
                )}

              {recentQuestions.length ===
                0 && (
                <>
                  <div>
                    <b>Q1</b>
                    <span>
                      Your questions will
                      appear here
                    </span>
                    <small>
                      —
                    </small>
                  </div>

                  <div>
                    <b>Q2</b>
                    <span>
                      Upload a paper to begin
                    </span>
                    <small>
                      —
                    </small>
                  </div>
                </>
              )}
            </div>
          </button>

          <button
            className="overview-card graph-card"
            onClick={() =>
              go("/concept-graph")
            }
          >
            <span className="card-arrow">
              <ArrowUpRight size={17} />
            </span>

            <div className="card-icon blue">
              <GitBranch size={23} />
            </div>

            <span className="card-kicker">
              CONNECT THE DOTS
            </span>

            <h2>
              Concept Graph
            </h2>

            <p>
              See how your exam concepts
              connect.
            </p>

            <div className="mini-graph">
              <span className="graph-node center">
                TCP
              </span>

              <span className="graph-node top">
                IP
              </span>

              <span className="graph-node left">
                DNS
              </span>

              <span className="graph-node right">
                UDP
              </span>

              <span className="graph-node bottom">
                HTTP
              </span>

              <i className="graph-connection one" />
              <i className="graph-connection two" />
              <i className="graph-connection three" />
              <i className="graph-connection four" />
            </div>
          </button>

          <button
            className="overview-card planner-card"
            onClick={() =>
              go("/planner")
            }
          >
            <span className="card-arrow">
              <ArrowUpRight size={17} />
            </span>

            <div className="card-icon green">
              <CalendarDays size={23} />
            </div>

            <span className="card-kicker">
              NEXT MOVE
            </span>

            <h2>
              Study Planner
            </h2>

            <p>
              Turn patterns into a study
              strategy.
            </p>

            <div className="planner-list">
              {topics
                .slice(0, 4)
                .map(
                  (
                    topic,
                    index
                  ) => {
                    const width =
                      Math.min(
                        100,
                        topic.score ||
                          70 -
                            index *
                              13
                      );

                    return (
                      <div
                        key={
                          topic.topic
                        }
                      >
                        <span>
                          {topic.topic}
                        </span>

                        <div>
                          <i
                            style={{
                              width: `${width}%`
                            }}
                          />
                        </div>

                        <small>
                          {width}%
                        </small>
                      </div>
                    );
                  }
                )}

              {topics.length ===
                0 && (
                <>
                  <div>
                    <span>
                      TCP
                    </span>

                    <div>
                      <i
                        style={{
                          width: "76%"
                        }}
                      />
                    </div>

                    <small>
                      76%
                    </small>
                  </div>

                  <div>
                    <span>
                      DNS
                    </span>

                    <div>
                      <i
                        style={{
                          width: "54%"
                        }}
                      />
                    </div>

                    <small>
                      54%
                    </small>
                  </div>

                  <div>
                    <span>
                      HTTP
                    </span>

                    <div>
                      <i
                        style={{
                          width: "38%"
                        }}
                      />
                    </div>

                    <small>
                      38%
                    </small>
                  </div>
                </>
              )}
            </div>
          </button>

          <button
            className="overview-card progress-card"
            onClick={() =>
              go("/progress")
            }
          >
            <span className="card-arrow">
              <ArrowUpRight size={17} />
            </span>

            <div className="card-icon light">
              <Trophy size={23} />
            </div>

            <span className="card-kicker">
              KEEP GOING
            </span>

            <h2>
              Your Progress
            </h2>

            <p>
              See how far your preparation
              has come.
            </p>

            <div className="progress-main">
              <div
                className="progress-ring"
                style={{
                  "--progress":
                    `${mastery}%`
                }}
              >
                <strong>
                  {mastery}%
                </strong>
              </div>

              <div className="progress-detail">
                <strong>
                  Overall Mastery
                </strong>

                <div className="progress-track">
                  <i
                    style={{
                      width: `${mastery}%`
                    }}
                  />
                </div>

                <span>
                  {totalQuestions} PYQs
                  analyzed
                </span>
              </div>
            </div>

            <div className="progress-bottom">
              <span>
                <b>
                  {totalTopics}
                </b>
                Topics
              </span>

              <span>
                <b>
                  {totalSubjects}
                </b>
                Subjects
              </span>

              <span>
                <b>
                  {data?.totalYears ||
                    0}
                </b>
                Years
              </span>
            </div>
          </button>

          
        </section>

        <footer className="overview-footer">
          <div>
            <GraduationCap size={16} />
            <span>
              Better questions. Smarter
              preparation.
            </span>
          </div>

          <span>
            {totalQuestions > 0
              ? `${totalQuestions} PYQs analyzed`
              : "Upload your first paper to begin"}
          </span>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;