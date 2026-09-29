import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ArrowUpRight,
  Upload,
  Network,
  FileText,
  Layers3
} from "lucide-react";

import { getQuestions } from "../services/questionService";

function Subjects() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const data = await getQuestions();
        setQuestions(data);
      } catch (error) {
        console.error(
          "Failed to load subjects:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  const subjects = useMemo(() => {
    const subjectMap = {};

    questions.forEach((question) => {
      const subject =
        question.subject?.trim();

      if (!subject) {
        return;
      }

      if (!subjectMap[subject]) {
        subjectMap[subject] = {
          name: subject,
          questions: 0,
          years: new Set()
        };
      }

      subjectMap[subject].questions++;

      if (question.year) {
        subjectMap[subject].years.add(
          String(question.year)
        );
      }
    });

    return Object.values(subjectMap)
      .map((subject) => ({
        ...subject,
        years: [...subject.years].sort(
          (a, b) =>
            Number(b) - Number(a)
        )
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }, [questions]);

  const totalQuestions =
    questions.length;

  const totalPapers = useMemo(() => {
    return new Set(
      questions.map(
        (question) =>
          `${question.subject}-${question.year}`
      )
    ).size;
  }, [questions]);

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            QNIVERSE LIBRARY
          </span>

          <h1>Your Subjects</h1>

          <p>
            Your subjects are created automatically
            from the PYQ papers you upload.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            navigate("/upload")
          }
        >
          <Upload size={17} />
          Upload PYQs
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <BookOpen size={19} />
          </div>

          <div>
            <span>Subjects</span>
            <strong>
              {subjects.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={19} />
          </div>

          <div>
            <span>Question Papers</span>
            <strong>
              {totalPapers}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Layers3 size={19} />
          </div>

          <div>
            <span>Total Questions</span>
            <strong>
              {totalQuestions}
            </strong>
          </div>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">
              YOUR SUBJECTS
            </span>

            <h2>
              Your PYQ Workspace
            </h2>

            <p className="panel-description">
              Every subject appears here automatically
              when you upload its question paper.
            </p>
          </div>

          <Network size={20} />
        </div>

        {loading ? (
          <div className="empty-state">
            Loading your subjects...
          </div>
        ) : subjects.length === 0 ? (
          <div className="subjects-empty">
            <div className="subject-empty-icon">
              <BookOpen size={26} />
            </div>

            <h3>
              No subjects yet
            </h3>

            <p>
              Upload your first PYQ paper and
              Qniverse will create the subject
              automatically.
            </p>

            <button
              className="primary-button"
              onClick={() =>
                navigate("/upload")
              }
            >
              <Upload size={17} />
              Upload Your First PYQ
            </button>
          </div>
        ) : (
          <div className="subject-grid">
            {subjects.map((subject) => (
              <div
                className="subject-card"
                key={subject.name}
              >
                <div className="subject-card-top">
                  <div className="subject-icon">
                    <BookOpen size={20} />
                  </div>

                  <span className="subject-code">
                    {subject.years.length}{" "}
                    {subject.years.length === 1
                      ? "YEAR"
                      : "YEARS"}
                  </span>
                </div>

                <h3>
                  {subject.name}
                </h3>

                <p>
                  {subject.questions}{" "}
                  {subject.questions === 1
                    ? "question"
                    : "questions"}{" "}
                  across{" "}
                  {subject.years.length}{" "}
                  {subject.years.length === 1
                    ? "year"
                    : "years"}.
                </p>

                <div className="subject-years">
                  {subject.years
                    .slice(0, 5)
                    .map((year) => (
                      <span key={year}>
                        {year}
                      </span>
                    ))}
                </div>

                <button
                  className="text-button"
                  onClick={() =>
                    navigate(
                      `/analysis?subject=${encodeURIComponent(
                        subject.name
                      )}`
                    )
                  }
                >
                  View Analysis
                  <ArrowUpRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel subject-upload-panel">
        <div className="subject-upload-content">
          <div className="subject-icon large">
            <Upload size={22} />
          </div>

          <div>
            <span className="panel-label">
              ADD QUESTION PAPERS
            </span>

            <h2>
              Have another PYQ paper?
            </h2>

            <p>
              Upload a paper from any subject.
              Qniverse will automatically add it
              to your workspace.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              navigate("/upload")
            }
          >
            Upload Paper
            <ArrowUpRight size={17} />
          </button>
        </div>
      </section>
    </div>
  );
}

export default Subjects;