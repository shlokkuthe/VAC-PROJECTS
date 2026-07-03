import { useState } from "react";
import "./FeedbackModal.css";

const FEEDBACK_TYPES = [
  "🐛 Bug Report",
  "🎬 Movie Request",
  "📺 Series Request",
  "💡 Feature Suggestion",
  "🎨 UI / Design Feedback",
  "❓ Other",
];

export default function FeedbackModal({ closeModal }) {
  const [form, setForm] = useState({
    name:    "",
    email:   "",
    type:    FEEDBACK_TYPES[0],
    subject: "",
    message: "",
    movieName: "",  // extra field for movie/series requests
  });
  const [error,     setError]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const isMovieRequest =
    form.type === "🎬 Movie Request" || form.type === "📺 Series Request";

  const handleSubmit = () => {
    setError("");
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("Please fill in all required fields (*).");
      return;
    }
    // Save to localStorage (no backend)
    const all = JSON.parse(localStorage.getItem("movieshub_feedback") || "[]");
    all.push({ ...form, submittedAt: new Date().toISOString() });
    localStorage.setItem("movieshub_feedback", JSON.stringify(all));
    setSubmitted(true);
  };

  return (
    <div
      className="feedbackOverlay"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="feedbackModal">
        <button className="fbCloseBtn" onClick={closeModal} aria-label="Close">✕</button>

        {submitted ? (
          /* ── Success Screen ── */
          <div className="fbSuccess">
            <div className="fbSuccessIcon">🎉</div>
            <h2>Thank You!</h2>
            <p>
              Your feedback has been received. We review every submission and
              will consider your suggestion for future updates!
            </p>
            <button className="fbSubmitBtn" onClick={closeModal}>
              Close
            </button>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div className="fbHeader">
              <h2>💬 Share Your Feedback</h2>
              <p>
                Report bugs, suggest movies / series, or share ideas. We read
                everything!
              </p>
            </div>

            {error && <div className="fbError">⚠️ {error}</div>}

            <div className="fbForm">
              {/* Row 1 — Name + Email */}
              <div className="fbRow">
                <div className="fbField">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={update("name")}
                  />
                </div>
                <div className="fbField">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={update("email")}
                  />
                </div>
              </div>

              {/* Feedback Type */}
              <div className="fbField">
                <label>Type of Feedback</label>
                <select value={form.type} onChange={update("type")}>
                  {FEEDBACK_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Movie Name — only shown for movie/series requests */}
              {isMovieRequest && (
                <div className="fbField">
                  <label>Movie / Series Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Oppenheimer, Peaky Blinders..."
                    value={form.movieName}
                    onChange={update("movieName")}
                  />
                </div>
              )}

              {/* Subject */}
              <div className="fbField">
                <label>Subject *</label>
                <input
                  type="text"
                  placeholder="Brief summary of your feedback"
                  value={form.subject}
                  onChange={update("subject")}
                />
              </div>

              {/* Message */}
              <div className="fbField">
                <label>Your Message *</label>
                <textarea
                  placeholder="Describe your issue, request, or idea in detail..."
                  value={form.message}
                  onChange={update("message")}
                  rows={5}
                />
              </div>

              <button className="fbSubmitBtn" onClick={handleSubmit}>
                📤 Submit Feedback
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
