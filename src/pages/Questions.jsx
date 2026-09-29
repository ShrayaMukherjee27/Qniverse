import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  FileText,
  Filter,
  Hash,
  Layers,
  Trash2,
  ScanSearch
} from "lucide-react";

import {
  getQuestions,
  reAnalyzeQuestions,
  findDuplicatePapers,
  removeDuplicateQuestions
} from "../services/questionService";

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [topic, setTopic] = useState("All");
  const [year, setYear] = useState("All");
  const [marks, setMarks] = useState("All");
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function loadQuestions() {
    try {
      setLoading(true);

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

  useEffect(() => {
    loadQuestions();
  }, []);

  async function handleReAnalyze() {
    try {
      setReanalyzing(true);

      await reAnalyzeQuestions();

      await loadQuestions();
    } catch (error) {
      console.error(
        "Re-analysis failed:",
        error
      );

      alert(
        error.message ||
          "Re-analysis failed."
      );
    } finally {
      setReanalyzing(false);
    }
  }

  async function handleDuplicateScan() {
    try {
      setScanning(true);

      const result =
        await findDuplicatePapers();

      const groups =
        result.duplicateQuestions || [];

      if (groups.length === 0) {
        alert(
          "No duplicate questions found."
        );
      } else {
        alert(
          `${groups.length} duplicate question groups found.`
        );
      }
    } catch (error) {
      console.error(
        "Duplicate scan failed:",
        error
      );

      alert(
        error.message ||
          "Duplicate scan failed."
      );
    } finally {
      setScanning(false);
    }
  }

  async function handleRemoveDuplicates() {
    const confirmed =
      window.confirm(
        "Remove duplicate questions? One copy of each question will be kept."
      );

    if (!confirmed) {
      return;
    }

    try {
      setRemoving(true);

      const deleted =
        await removeDuplicateQuestions();

      alert(
        `${deleted} duplicate questions removed.`
      );

      await loadQuestions();
    } catch (error) {
      console.error(
        "Duplicate removal failed:",
        error
      );

      alert(
        error.message ||
          "Failed to remove duplicates."
      );
    } finally {
      setRemoving(false);
    }
  }

  const subjects = useMemo(() => {
    return [
      ...new Set(
        questions
          .map(
            (question) =>
              question.subject
          )
          .filter(Boolean)
      )
    ].sort();
  }, [questions]);

  const topics = useMemo(() => {
    return [
      ...new Set(
        questions
          .map(
            (question) =>
              question.topic
          )
          .filter(
            (item) =>
              item &&
              item !== "Unknown"
          )
      )
    ].sort();
  }, [questions]);

  const years = useMemo(() => {
    return [
      ...new Set(
        questions
          .map((question) =>
            String(question.year)
          )
          .filter(
            (item) =>
              item &&
              item !== "undefined"
          )
      )
    ].sort(
      (a, b) =>
        Number(b) - Number(a)
    );
  }, [questions]);

  const markOptions = useMemo(() => {
    return [
      ...new Set(
        questions
          .map((question) =>
            Number(question.marks)
          )
          .filter(
            (mark) =>
              mark > 0
          )
      )
    ].sort((a, b) => a - b);
  }, [questions]);

  const filteredQuestions =
    useMemo(() => {
      const query =
        search
          .toLowerCase()
          .trim();

      return questions.filter(
        (question) => {
          const matchesSearch =
            !query ||
            question.text
              ?.toLowerCase()
              .includes(query) ||
            question.topic
              ?.toLowerCase()
              .includes(query) ||
            question.subject
              ?.toLowerCase()
              .includes(query);

          const matchesSubject =
            subject === "All" ||
            question.subject ===
              subject;

          const matchesTopic =
            topic === "All" ||
            question.topic === topic;

          const matchesYear =
            year === "All" ||
            String(question.year) ===
              year;

          const matchesMarks =
            marks === "All" ||
            Number(question.marks) ===
              Number(marks);

          return (
            matchesSearch &&
            matchesSubject &&
            matchesTopic &&
            matchesYear &&
            matchesMarks
          );
        }
      );
    }, [
      questions,
      search,
      subject,
      topic,
      year,
      marks
    ]);

  const totalMarks =
    filteredQuestions.reduce(
      (sum, question) =>
        sum +
        (Number(question.marks) ||
          0),
      0
    );

  const analyzedCount =
    questions.filter(
      (question) =>
        question.topic &&
        question.topic !==
          "Unknown"
    ).length;

  const subjectCount =
    new Set(
      questions
        .map(
          (question) =>
            question.subject
        )
        .filter(Boolean)
    ).size;

  const repeatedQuestionCount =
    useMemo(() => {
      const seen = new Set();
      let count = 0;

      questions.forEach(
        (question) => {
          const key =
            `${question.subject || ""}|${question.year || ""}|${question.text || ""}`
              .toLowerCase()
              .replace(
                /[^a-z0-9]/g,
                ""
              );

          if (seen.has(key)) {
            count++;
          } else {
            seen.add(key);
          }
        }
      );

      return count;
    }, [questions]);

  function clearFilters() {
    setSearch("");
    setSubject("All");
    setTopic("All");
    setYear("All");
    setMarks("All");
  }

  const hasFilters =
    search ||
    subject !== "All" ||
    topic !== "All" ||
    year !== "All" ||
    marks !== "All";

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            QUESTION BANK
          </span>

          <h1>Questions</h1>

          <p>
            Browse, search and inspect
            every question extracted
            from your uploaded papers.
          </p>
        </div>

        <div className="question-header-actions">
          <button
            className="secondary-button"
            onClick={
              handleDuplicateScan
            }
            disabled={scanning}
          >
            <ScanSearch
              size={16}
            />

            {scanning
              ? "Scanning..."
              : "Scan Duplicates"}
          </button>

          <button
            className="primary-button"
            onClick={
              handleReAnalyze
            }
            disabled={reanalyzing}
          >
            <RefreshCw
              size={17}
              className={
                reanalyzing
                  ? "spin"
                  : ""
              }
            />

            {reanalyzing
              ? "Analyzing..."
              : "Re-analyze"}
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FileText
              size={19}
            />
          </div>

          <div>
            <span>
              Total Questions
            </span>

            <strong>
              {questions.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Filter size={19} />
          </div>

          <div>
            <span>Showing</span>

            <strong>
              {filteredQuestions.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Layers size={19} />
          </div>

          <div>
            <span>Subjects</span>

            <strong>
              {subjectCount}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Hash size={19} />
          </div>

          <div>
            <span>
              Visible Marks
            </span>

            <strong>
              {totalMarks}
            </strong>
          </div>
        </div>
      </div>

      <section className="panel question-filter-panel">
        <div className="question-filter-heading">
          <div>
            <span className="panel-label">
              QUESTION EXPLORER
            </span>

            <h2>
              Find exactly what
              you need
            </h2>
          </div>

          {hasFilters && (
            <button
              className="clear-filter-button"
              onClick={
                clearFilters
              }
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="question-toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search questions, subjects or topics..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>

          <div className="filter-group">
            <select
              value={subject}
              onChange={(event) =>
                setSubject(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Subjects
              </option>

              {subjects.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            <select
              value={topic}
              onChange={(event) =>
                setTopic(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Topics
              </option>

              {topics.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            <select
              value={year}
              onChange={(event) =>
                setYear(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Years
              </option>

              {years.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            <select
              value={marks}
              onChange={(event) =>
                setMarks(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Marks
              </option>

              {markOptions.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item} marks
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="question-filter-summary">
          <span>
            Showing{" "}
            <strong>
              {filteredQuestions.length}
            </strong>{" "}
            of{" "}
            <strong>
              {questions.length}
            </strong>{" "}
            questions
          </span>

          {repeatedQuestionCount >
            0 && (
            <span className="duplicate-warning">
              {repeatedQuestionCount} repeated
              question
              {repeatedQuestionCount >
              1
                ? "s"
                : ""}{" "}
              detected
            </span>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">
              EXTRACTED QUESTIONS
            </span>

            <h2>
              {filteredQuestions.length}{" "}
              questions
            </h2>
          </div>

          {repeatedQuestionCount >
            0 && (
            <button
              className="danger-button"
              onClick={
                handleRemoveDuplicates
              }
              disabled={removing}
            >
              <Trash2 size={15} />

              {removing
                ? "Removing..."
                : "Remove Duplicates"}
            </button>
          )}
        </div>

        {loading ? (
          <div className="empty-state">
            Loading questions...
          </div>
        ) : filteredQuestions.length ===
          0 ? (
          <div className="empty-state">
            <FileText size={30} />

            <strong>
              No questions found
            </strong>

            <span>
              Try changing your
              search or filters.
            </span>
          </div>
        ) : (
          <div className="question-list">
            {filteredQuestions.map(
              (
                question,
                index
              ) => (
                <div
                  className="question-card"
                  key={
                    question.id ||
                    `${question.year}-${question.number}-${index}`
                  }
                >
                  <div className="question-number">
                    <span>
                      Q
                      {
                        question.number
                      }
                    </span>

                    <small>
                      {
                        question.year
                      }
                    </small>
                  </div>

                  <div className="question-content">
                    <div className="question-topline">
                      <span className="question-subject">
                        {
                          question.subject ||
                          "Unknown Subject"
                        }
                      </span>

                      {question.marks >
                        0 && (
                        <span className="marks-badge">
                          {
                            question.marks
                          }{" "}
                          marks
                        </span>
                      )}
                    </div>

                    <p>
                      {
                        question.text
                      }
                    </p>

                    <div className="question-meta">
                      <span className="topic-badge">
                        {question.topic ||
                          "Unknown"}
                      </span>

                      {question.confidence >
                        0 && (
                        <span>
                          {Math.round(
                            question.confidence *
                              100
                          )}
                          % confidence
                        </span>
                      )}

                      {question.paperId && (
                        <span>
                          Uploaded paper
                        </span>
                      )}
                    </div>

                    {question
                      .matchedKeywords
                      ?.length >
                      0 && (
                      <div className="keyword-row">
                        {question.matchedKeywords.map(
                          (
                            keyword
                          ) => (
                            <span
                              key={
                                keyword
                              }
                            >
                              {
                                keyword
                              }
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Questions;