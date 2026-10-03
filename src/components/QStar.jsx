import { useState } from "react";
import { X, Send, Sparkles, Flame, RotateCcw, Brain, Shuffle } from "lucide-react";
import qstarImage from "../assets/qstar.png";
import "./QStar.css";

function QStar() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Heyyy! I'm Q-Star ✦ Your PYQ study buddy. What are we doing today?"
    }
  ]);
  const [input, setInput] = useState("");

  const suggestions = [
    {
      icon: Flame,
      text: "Find important topics"
    },
    {
      icon: RotateCcw,
      text: "Find repeated PYQs"
    },
    {
      icon: Brain,
      text: "Explain a topic"
    },
    {
      icon: Sparkles,
      text: "Test me"
    }
  ];

  const handleSuggestion = (text) => {
    setMessages((prev) => [
      ...prev,
      { type: "user", text },
      {
        type: "bot",
        text:
          text === "Find important topics"
            ? "Give me a second... I'll scan your Qniverse patterns and find the topics that deserve your attention. 🔎"
            : text === "Find repeated PYQs"
            ? "Ooooh, repetition hunting! 🔁 I'll look for questions and concepts that keep coming back."
            : text === "Explain a topic"
            ? "Sure! Tell me the topic and I'll break it down into simple exam-ready points. 🧠"
            : "Challenge accepted. ⚔️ Pick a subject and I'll test your PYQ knowledge."
      }
    ]);
  };

  const handleSend = () => {
    const value = input.trim();

    if (!value) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      { type: "user", text: value },
      {
        type: "bot",
        text: "I'm on it ✦ I'm still learning your Qniverse data. Soon I'll be able to answer this using your uploaded PYQs."
      }
    ]);

    setInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <>
      {!open && (
        <button
          className="qstar-floating"
          onClick={() => setOpen(true)}
          type="button"
          aria-label="Open Q-Star"
        >
          <span className="qstar-sparkle sparkle-one">✦</span>
          <span className="qstar-sparkle sparkle-two">✦</span>
          <img src={qstarImage} alt="Q-Star" />
          <span className="qstar-floating-label">Q-Star</span>
        </button>
      )}

      {open && (
        <div className="qstar-panel">
          <div className="qstar-header">
            <div className="qstar-header-character">
              <img src={qstarImage} alt="Q-Star" />
            </div>

            <div className="qstar-header-info">
              <div className="qstar-name">
                Q-Star <span>✦</span>
              </div>
              <div className="qstar-status">
                <span></span>
                Your Qniverse study buddy
              </div>
            </div>

            <button
              className="qstar-close"
              onClick={() => setOpen(false)}
              type="button"
              aria-label="Close Q-Star"
            >
              <X size={18} />
            </button>
          </div>

          <div className="qstar-body">
            <div className="qstar-welcome">
              <img src={qstarImage} alt="" />

              <div>
                <strong>Hey, explorer! 👋</strong>
                <p>
                  Your PYQs have secrets. Let's find them.
                </p>
              </div>
            </div>

            <div className="qstar-messages">
              {messages.map((message, index) => (
                <div
                  key={`${message.type}-${index}`}
                  className={`qstar-message-row ${message.type}`}
                >
                  {message.type === "bot" && (
                    <img src={qstarImage} alt="" />
                  )}

                  <div className="qstar-message">
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="qstar-section-title">
              What are we doing today?
            </div>

            <div className="qstar-suggestions">
              {suggestions.map((suggestion) => {
                const Icon = suggestion.icon;

                return (
                  <button
                    key={suggestion.text}
                    type="button"
                    onClick={() => handleSuggestion(suggestion.text)}
                  >
                    <Icon size={16} />
                    {suggestion.text}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handleSuggestion("Surprise Me")}
                className="qstar-surprise"
              >
                <Shuffle size={16} />
                Surprise Me ✦
              </button>
            </div>
          </div>

          <div className="qstar-input-area">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Q-Star..."
            />

            <button
              type="button"
              onClick={handleSend}
              aria-label="Send message"
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default QStar;