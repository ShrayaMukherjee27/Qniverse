import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  Check,
  Clock3,
  Flame,
  Gamepad2,
  Heart,
  RotateCcw,
  Target,
  Trophy,
  X,
  Zap
} from "lucide-react";

import { getQuestions } from "../services/questionService";
import { saveGameResult } from "../services/gameService";

function shuffle(items) {
  return [...items].sort(
    () => Math.random() - 0.5
  );
}

function GameLab() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const requestedTopic =
    searchParams.get("topic") || "";

  const requestedSubject =
    searchParams.get("subject") || "";

  const [questions, setQuestions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [subject, setSubject] =
    useState(requestedSubject);

  const [topic, setTopic] =
    useState(requestedTopic);

  const [started, setStarted] =
    useState(false);

  const [finished, setFinished] =
    useState(false);

  const [battleQuestions, setBattleQuestions] =
    useState([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answered, setAnswered] =
    useState(false);

  const [known, setKnown] =
    useState(0);

  const [unknown, setUnknown] =
    useState(0);

  const [score, setScore] =
    useState(0);

  const [streak, setStreak] =
    useState(0);

  const [lives, setLives] =
    useState(3);

  const [timeLeft, setTimeLeft] =
    useState(20);

  const [weakQuestions, setWeakQuestions] =
    useState([]);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);

        const data =
          await getQuestions();

        setQuestions(data);
      } catch (error) {
        console.error(
          "Game Lab loading failed:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

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

  const subjectQuestions =
    useMemo(() => {
      if (!subject) {
        return questions;
      }

      return questions.filter(
        (question) =>
          question.subject ===
          subject
      );
    }, [questions, subject]);

  const topics = useMemo(() => {
    return [
      ...new Set(
        subjectQuestions
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
  }, [subjectQuestions]);

  const filteredQuestions =
    useMemo(() => {
      return subjectQuestions.filter(
        (question) => {
          if (!topic) {
            return true;
          }

          return (
            question.topic ===
            topic
          );
        }
      );
    }, [subjectQuestions, topic]);

  const currentQuestion =
    battleQuestions[
      currentIndex
    ];

  const totalAnswered =
    known + unknown;

  const accuracy =
    totalAnswered > 0
      ? Math.round(
          (known /
            totalAnswered) *
            100
        )
      : 0;

  const weakTopics = useMemo(() => {
    return [
      ...new Set(
        weakQuestions
          .map(
            (question) =>
              question.topic
          )
          .filter(Boolean)
      )
    ];
  }, [weakQuestions]);

  useEffect(() => {
    if (
      !started ||
      finished ||
      answered
    ) {
      return;
    }

    if (timeLeft <= 0) {
      handleRecall(false);
      return;
    }

    const timer =
      setInterval(() => {
        setTimeLeft(
          (value) =>
            value - 1
        );
      }, 1000);

    return () =>
      clearInterval(timer);
  }, [
    started,
    finished,
    answered,
    timeLeft
  ]);

  function startBattle() {
    if (
      filteredQuestions.length ===
      0
    ) {
      return;
    }

    const selected =
      shuffle(
        filteredQuestions
      ).slice(0, 10);

    setBattleQuestions(
      selected
    );

    setCurrentIndex(0);
    setAnswered(false);
    setKnown(0);
    setUnknown(0);
    setScore(0);
    setStreak(0);
    setLives(3);
    setWeakQuestions([]);
    setTimeLeft(20);
    setFinished(false);
    setStarted(true);
  }

  function handleRecall(didKnow) {
    if (
      answered ||
      !currentQuestion
    ) {
      return;
    }

    setAnswered(true);

    if (didKnow) {
      const nextStreak =
        streak + 1;

      const streakBonus =
        nextStreak >= 3
          ? 50
          : 0;

      const timeBonus =
        Math.max(
          0,
          timeLeft * 2
        );

      setKnown(
        (value) =>
          value + 1
      );

      setScore(
        (value) =>
          value +
          100 +
          streakBonus +
          timeBonus
      );

      setStreak(
        nextStreak
      );

      return;
    }

    setUnknown(
      (value) =>
        value + 1
    );

    setStreak(0);

    setLives(
      (value) =>
        Math.max(
          0,
          value - 1
        )
    );

    setWeakQuestions(
      (items) => [
        ...items,
        currentQuestion
      ]
    );
  }

  async function nextQuestion() {
    const nextIndex =
      currentIndex + 1;

    if (
      nextIndex >=
        battleQuestions.length ||
      lives <= 0
    ) {
      await finishBattle();
      return;
    }

    setCurrentIndex(
      nextIndex
    );

    setAnswered(false);
    setTimeLeft(20);
  }

  async function finishBattle() {
    const finalKnown =
      known;

    const finalUnknown =
      unknown;

    const finalTotal =
      finalKnown +
      finalUnknown;

    const finalAccuracy =
      finalTotal > 0
        ? Math.round(
            (finalKnown /
              finalTotal) *
              100
          )
        : 0;

    try {
      setSaving(true);

      await saveGameResult({
        subject,
        topic,
        total:
          battleQuestions.length,
        known:
          finalKnown,
        unknown:
          finalUnknown,
        score,
        accuracy:
          finalAccuracy,
        weakTopics
      });
    } catch (error) {
      console.error(
        "Game result saving failed:",
        error
      );
    } finally {
      setSaving(false);
      setStarted(false);
      setFinished(true);
    }
  }

  function restartBattle() {
    startBattle();
  }

  if (loading) {
    return (
      <div className="dashboard game-page">
        <div className="game-loading">
          <Gamepad2 size={28} />

          <span>
            Loading battle arena...
          </span>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="dashboard game-page">
        <section className="game-result">
          <div className="game-result-icon">
            <Trophy size={42} />
          </div>

          <span className="eyebrow">
            RECALL BATTLE COMPLETE
          </span>

          <h1>
            {accuracy >= 80
              ? "Memory Locked"
              : accuracy >= 50
              ? "Good Run"
              : "Needs Revision"}
          </h1>

          <p>
            Your recall performance has
            been saved to your study data.
          </p>

          <div className="game-result-stats">
            <div>
              <strong>
                {score}
              </strong>

              <span>
                SCORE
              </span>
            </div>

            <div>
              <strong>
                {accuracy}%
              </strong>

              <span>
                ACCURACY
              </span>
            </div>

            <div>
              <strong>
                {unknown}
              </strong>

              <span>
                NEEDS REVISION
              </span>
            </div>
          </div>

          {weakTopics.length > 0 && (
            <div className="game-weak-panel">
              <div>
                <Target size={18} />

                <strong>
                  Weak Signals
                </strong>
              </div>

              {weakTopics.map(
                (item) => (
                  <div
                    key={item}
                  >
                    <span>
                      {item}
                    </span>

                    <small>
                      Appeared in your
                      missed recall
                      questions.
                    </small>
                  </div>
                )
              )}
            </div>
          )}

          <div className="game-result-actions">
            <button
              className="primary-button"
              onClick={
                restartBattle
              }
            >
              <RotateCcw
                size={17}
              />

              Rematch
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                navigate(
                  "/progress"
                )
              }
            >
              View Progress
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="dashboard game-page">
        <div className="page-header">
          <div>
            <span className="eyebrow">
              GAME LAB / RECALL ENGINE
            </span>

            <h1>
              PYQ Recall Battle
            </h1>

            <p>
              Test whether you can recall
              the answer from your own
              question papers.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() =>
              navigate(-1)
            }
          >
            <ArrowLeft size={16} />

            Back
          </button>
        </div>

        <section className="game-launch-panel">
          <div className="game-grid" />

          <div className="game-launch-icon">
            <Brain size={34} />
          </div>

          <span>
            PREYQ / RECALL ENGINE
          </span>

          <h2>
            How much of your PYQs
            can you actually recall?
          </h2>

          <p>
            A question appears from your
            uploaded papers. Think fast,
            then tell the system whether
            you knew it.
          </p>

          <div className="game-select-grid">
            <div>
              <label>
                SUBJECT
              </label>

              <select
                value={subject}
                onChange={(event) => {
                  setSubject(
                    event.target.value
                  );

                  setTopic("");
                }}
              >
                <option value="">
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
            </div>

            <div>
              <label>
                TOPIC
              </label>

              <select
                value={topic}
                onChange={(event) =>
                  setTopic(
                    event.target.value
                  )
                }
              >
                <option value="">
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
            </div>
          </div>

          <div className="game-launch-info">
            <div>
              <Zap size={17} />

              <span>
                {filteredQuestions.length}
              </span>

              <small>
                available PYQs
              </small>
            </div>

            <div>
              <Clock3 size={17} />

              <span>
                20s
              </span>

              <small>
                recall window
              </small>
            </div>

            <div>
              <Heart size={17} />

              <span>
                3
              </span>

              <small>
                lives
              </small>
            </div>
          </div>

          <button
            className="game-start-button"
            onClick={
              startBattle
            }
            disabled={
              filteredQuestions.length ===
              0
            }
          >
            <Gamepad2 size={20} />

            Start Recall Battle
          </button>

          {filteredQuestions.length ===
            0 && (
            <p className="game-empty">
              Upload and analyze
              question papers first.
            </p>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard game-page">
      <div className="game-topbar">
        <div>
          <span>
            {subject ||
              "ALL SUBJECTS"}
          </span>

          <strong>
            {topic ||
              "MIXED TOPICS"}
          </strong>
        </div>

        <div className="game-hud">
          <div>
            <Flame size={17} />

            {streak}
          </div>

          <div>
            <Heart size={17} />

            {lives}
          </div>

          <div>
            <Zap size={17} />

            {score}
          </div>
        </div>
      </div>

      <section className="game-battle">
        <div className="game-battle-header">
          <div>
            <span>
              QUESTION{" "}
              {currentIndex + 1}
              {" / "}
              {battleQuestions.length}
            </span>

            <div className="game-progress">
              <span
                style={{
                  width: `${
                    ((currentIndex + 1) /
                      battleQuestions.length) *
                    100
                  }%`
                }}
              />
            </div>
          </div>

          <div className="game-timer">
            <Clock3 size={18} />

            {timeLeft}s
          </div>
        </div>

        <div className="game-question">
          <div className="game-question-tag">
            <Brain size={16} />

            RECALL CHALLENGE
          </div>

          <h2>
            {currentQuestion?.text}
          </h2>

          <p>
            Think of the answer before
            choosing your recall result.
          </p>
        </div>

        {!answered ? (
          <div className="game-recall-actions">
            <button
              className="game-recall-known"
              onClick={() =>
                handleRecall(true)
              }
            >
              <Check size={22} />

              <strong>
                I KNEW IT
              </strong>

              <small>
                I could answer this
              </small>
            </button>

            <button
              className="game-recall-unknown"
              onClick={() =>
                handleRecall(false)
              }
            >
              <X size={22} />

              <strong>
                I DIDN'T KNOW
              </strong>

              <small>
                Add this to revision
              </small>
            </button>
          </div>
        ) : (
          <div className="game-feedback">
            <div>
              {weakQuestions.includes(
                currentQuestion
              ) ? (
                <>
                  <X size={20} />

                  <strong>
                    Added to weak signals.
                  </strong>
                </>
              ) : (
                <>
                  <Check size={20} />

                  <strong>
                    Recall successful!
                    {streak >= 3
                      ? " Streak bonus!"
                      : ""}
                  </strong>
                </>
              )}
            </div>

            <button
              className="primary-button"
              onClick={
                nextQuestion
              }
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : currentIndex + 1 >=
                    battleQuestions.length ||
                  lives <= 0
                ? "Finish Battle"
                : "Next Question"}

              <Zap size={16} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default GameLab;