import { useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow
} from "reactflow";
import "reactflow/dist/style.css";
import {
  ArrowRight,
  Brain,
  ChevronDown,
  Flame,
  Gamepad2,
  Search,
  Target,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getQuestions } from "../services/questionService";

function TopicNode({ data }) {
  return (
    <div className={`knowledge-node ${data.completed ? "completed" : ""}`}>
      <Handle type="target" position={Position.Top} />

      <div className="knowledge-node-signal">
        {data.completed ? "✓" : "●"}
      </div>

      <div className="knowledge-node-title">
        {data.topic}
      </div>

      <div className="knowledge-node-meta">
        {data.questions} Q · {data.marks} M
      </div>

      <div className="knowledge-node-score">
        PRIORITY {data.score}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function YearNode({ data }) {
  return (
    <div className="knowledge-year-node">
      <Handle type="target" position={Position.Top} />

      <span>{data.year}</span>
      <strong>{data.count}</strong>
      <small>QUESTIONS</small>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = {
  topic: TopicNode,
  year: YearNode
};

function ConceptGraph() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [subject, setSubject] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getQuestions();
        setQuestions(data);

        const subjects = [
          ...new Set(
            data
              .map((item) => item.subject)
              .filter(Boolean)
          )
        ];

        if (subjects.length > 0) {
          setSubject(subjects[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const subjects = useMemo(() => {
    return [
      ...new Set(
        questions
          .map((item) => item.subject)
          .filter(Boolean)
      )
    ];
  }, [questions]);

  const subjectQuestions = useMemo(() => {
    return questions.filter(
      (question) =>
        question.subject === subject
    );
  }, [questions, subject]);

  const topicData = useMemo(() => {
    const map = {};

    subjectQuestions.forEach((question) => {
      const topic =
        question.topic &&
        question.topic !== "Unknown"
          ? question.topic
          : "Unclassified";

      if (!map[topic]) {
        map[topic] = {
          topic,
          questions: 0,
          marks: 0,
          years: new Set(),
          completed: false
        };
      }

      map[topic].questions += 1;
      map[topic].marks +=
        Number(question.marks) || 0;

      if (question.year) {
        map[topic].years.add(
          String(question.year)
        );
      }
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        years: item.years.size,
        score: Math.min(
          100,
          item.questions * 12 +
            item.marks * 3 +
            item.years.size * 8
        )
      }))
      .sort(
        (a, b) =>
          b.score - a.score
      );
  }, [subjectQuestions]);

  const filteredTopics = useMemo(() => {
    if (!search.trim()) {
      return topicData;
    }

    const value =
      search.toLowerCase();

    return topicData.filter((topic) =>
      topic.topic
        .toLowerCase()
        .includes(value)
    );
  }, [topicData, search]);

  const graph = useMemo(() => {
    const nodes = [];
    const edges = [];

    const centerX = 420;
    const centerY = 280;

    nodes.push({
      id: "subject",
      position: {
        x: centerX,
        y: centerY
      },
      data: {
        label: subject
      },
      type: "default",
      className: "knowledge-subject-node"
    });

    const radius = 270;

    filteredTopics.forEach(
      (topic, index) => {
        const angle =
          (index /
            Math.max(
              filteredTopics.length,
              1
            )) *
            Math.PI *
            2 -
          Math.PI / 2;

        const x =
          centerX +
          Math.cos(angle) *
            radius;

        const y =
          centerY +
          Math.sin(angle) *
            radius;

        const topicId =
          `topic-${index}`;

        nodes.push({
          id: topicId,
          position: {
            x,
            y
          },
          data: topic,
          type: "topic"
        });

        edges.push({
          id: `edge-subject-${index}`,
          source: "subject",
          target: topicId,
          animated: true,
          className: "knowledge-edge"
        });

        const topicQuestions =
          subjectQuestions.filter(
            (question) =>
              (question.topic ||
                "Unclassified") ===
              topic.topic
          );

        const yearMap = {};

        topicQuestions.forEach(
          (question) => {
            const year =
              String(
                question.year ||
                  "Unknown"
              );

            yearMap[year] =
              (yearMap[year] || 0) +
              1;
          }
        );

        Object.entries(
          yearMap
        ).forEach(
          ([year, count], yearIndex) => {
            const yearId =
              `${topicId}-${year}`;

            nodes.push({
              id: yearId,
              position: {
                x:
                  x +
                  (yearIndex % 2) * 110 -
                  55,
                y:
                  y +
                  145 +
                  Math.floor(
                    yearIndex / 2
                  ) *
                    90
              },
              data: {
                year,
                count
              },
              type: "year"
            });

            edges.push({
              id: `edge-${topicId}-${year}`,
              source: topicId,
              target: yearId,
              animated: false
            });
          }
        );
      }
    );

    return {
      nodes,
      edges
    };
  }, [
    subject,
    filteredTopics,
    subjectQuestions
  ]);

  const selectedQuestions = useMemo(() => {
    if (selectedTopic) {
      return subjectQuestions.filter(
        (question) =>
          (question.topic ||
            "Unclassified") ===
          selectedTopic
      );
    }

    if (selectedYear) {
      return subjectQuestions.filter(
        (question) =>
          String(
            question.year
          ) ===
          String(selectedYear)
      );
    }

    return [];
  }, [
    selectedTopic,
    selectedYear,
    subjectQuestions
  ]);

  function handleNodeClick(_, node) {
    if (node.type === "topic") {
      setSelectedTopic(
        node.data.topic
      );
      setSelectedYear(null);
    }

    if (node.type === "year") {
      setSelectedYear(
        node.data.year
      );
      setSelectedTopic(null);
    }
  }

  if (loading) {
    return (
      <div className="dashboard concept-page">
        <div className="graph-loading">
          <Brain size={26} />
          <span>
            Building knowledge map...
          </span>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="dashboard concept-page">
        <div className="page-header">
          <div>
            <span className="eyebrow">
              KNOWLEDGE SYSTEM / OFFLINE
            </span>
            <h1>
              Concept Graph
            </h1>
            <p>
              Upload PYQs to generate your
              knowledge map.
            </p>
          </div>
        </div>

        <div className="graph-empty">
          <Brain size={42} />
          <h2>
            No knowledge nodes yet
          </h2>
          <p>
            Your uploaded question papers
            will automatically become the
            graph.
          </p>
          <button
            className="primary-button"
            onClick={() =>
              navigate("/upload")
            }
          >
            Upload PYQs
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard concept-page">
      <div className="concept-header">
        <div>
          <span className="eyebrow">
            KNOWLEDGE SYSTEM / LIVE
          </span>

          <h1>
            Concept Graph
          </h1>

          <p>
            Navigate your exam knowledge
            through topics, years and
            question clusters.
          </p>
        </div>

        <button
          className="game-launch-button"
          onClick={() =>
            navigate("/game")
          }
        >
          <Gamepad2 size={17} />
          Enter Game Lab
        </button>
      </div>

      <section className="graph-command">
        <div className="graph-grid" />

        <div className="graph-command-top">
          <span>
            QNIVERSE / KNOWLEDGE ENGINE
          </span>

          <div>
            <i />
            GRAPH ONLINE
          </div>
        </div>

        <div className="graph-controls">
          <div className="graph-select">
            <Brain size={16} />

            <select
              value={subject}
              onChange={(event) => {
                setSubject(
                  event.target.value
                );
                setSelectedTopic(null);
                setSelectedYear(null);
              }}
            >
              {subjects.map(
                (item) => (
                  <option
                    value={item}
                    key={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            <ChevronDown size={15} />
          </div>

          <div className="graph-search">
            <Search size={16} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search concepts..."
            />
          </div>
        </div>

        <div className="graph-metrics">
          <div>
            <span>
              QUESTIONS
            </span>
            <strong>
              {subjectQuestions.length}
            </strong>
          </div>

          <div>
            <span>
              TOPICS
            </span>
            <strong>
              {topicData.length}
            </strong>
          </div>

          <div>
            <span>
              MARKS
            </span>
            <strong>
              {subjectQuestions.reduce(
                (sum, question) =>
                  sum +
                  (Number(
                    question.marks
                  ) || 0),
                0
              )}
            </strong>
          </div>

          <div>
            <span>
              YEARS
            </span>
            <strong>
              {
                new Set(
                  subjectQuestions.map(
                    (question) =>
                      String(
                        question.year ||
                          "Unknown"
                      )
                  )
                ).size
              }
            </strong>
          </div>
        </div>
      </section>

      <section className="concept-layout">
        <div className="graph-panel">
          <div className="graph-panel-header">
            <div>
              <span>
                KNOWLEDGE MAP
              </span>
              <strong>
                {subject}
              </strong>
            </div>

            <div className="graph-live">
              <Zap size={14} />
              LIVE
            </div>
          </div>

          <div className="graph-canvas">
            <ReactFlow
              nodes={graph.nodes}
              edges={graph.edges}
              nodeTypes={nodeTypes}
              onNodeClick={
                handleNodeClick
              }
              fitView
              fitViewOptions={{
                padding: 0.2
              }}
              nodesDraggable
              nodesConnectable={false}
              elementsSelectable
            >
              <Background
                gap={28}
                size={1}
              />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </div>

        <aside className="concept-inspector">
          {!selectedTopic &&
          !selectedYear ? (
            <div className="inspector-idle">
              <Target size={30} />

              <span>
                SELECT A NODE
              </span>

              <p>
                Click a topic or year node
                to inspect its questions.
              </p>
            </div>
          ) : (
            <>
              <div className="inspector-top">
                <span>
                  {selectedTopic
                    ? "TOPIC NODE"
                    : "YEAR NODE"}
                </span>

                <div>
                  {selectedTopic ? (
                    <Flame size={18} />
                  ) : (
                    <Brain size={18} />
                  )}
                </div>
              </div>

              <h2>
                {selectedTopic ||
                  selectedYear}
              </h2>

              <div className="inspector-stat">
                <span>
                  QUESTIONS
                </span>
                <strong>
                  {selectedQuestions.length}
                </strong>
              </div>

              <div className="inspector-stat">
                <span>
                  TOTAL MARKS
                </span>
                <strong>
                  {selectedQuestions.reduce(
                    (sum, question) =>
                      sum +
                      (Number(
                        question.marks
                      ) || 0),
                    0
                  )}
                </strong>
              </div>

              <div className="inspector-questions">
                {selectedQuestions
                  .slice(0, 6)
                  .map(
                    (question) => (
                      <div
                        className="inspector-question"
                        key={
                          question.id
                        }
                      >
                        <span>
                          Q
                          {
                            question.number
                          }
                        </span>

                        <p>
                          {
                            question.text
                          }
                        </p>
                      </div>
                    )
                  )}
              </div>

              {selectedTopic && (
                <button
                  className="boss-button"
                  onClick={() =>
                    navigate(
                      `/game?topic=${encodeURIComponent(
                        selectedTopic
                      )}&subject=${encodeURIComponent(
                        subject
                      )}`
                    )
                  }
                >
                  <Gamepad2 size={17} />
                  START TOPIC BATTLE
                </button>
              )}
            </>
          )}
        </aside>
      </section>
    </div>
  );
}

export default ConceptGraph;