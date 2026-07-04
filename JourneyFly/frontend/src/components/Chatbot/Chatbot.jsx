import { useState, useRef, useEffect } from "react";
import { FaRobot, FaPaperPlane, FaTimes, FaCommentDots } from "react-icons/fa";
import { sendMessage } from "../../services/chatbotService";
import styles from "./Chatbot.module.css";

const SUGGESTIONS = [
    "Suggest places to visit in Bali",
    "Budget tips for solo travel",
    "What should I pack for a beach trip?",
    "Best time to visit Europe",
    "How to find cheap flights?",
    "Recommend hotel booking tips",
];

const Chatbot = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: "welcome",
            role: "bot",
            text: "Hi! I'm **JourneyBot** 🤖✈️\n\nI'm your AI travel assistant. Ask me anything about destinations, hotels, packing, budgets, or travel tips!",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 300);
    }, [open]);

    const handleSend = async (text) => {
        const msg = typeof text === "string" ? text : input.trim();
        if (!msg || loading) return;

        setInput("");
        
        // Exclude the welcome message from history
        const conversationHistory = messages
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, text: m.text }));

        setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: msg }]);
        setLoading(true);

        try {
            const res = await sendMessage(msg, conversationHistory);
            setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: res.reply }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, role: "bot", text: "Sorry, I couldn't connect right now. Please try again in a moment! 🙏" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const formatText = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n/g, "<br/>")
            .replace(/^• /gm, "• ");
    };

    return (
        <>
            {/* Floating button */}
            <button
                className={`${styles.fab} ${open ? styles.fabHide : ""}`}
                onClick={() => setOpen(true)}
                aria-label="Open Travel Assistant"
            >
                <FaCommentDots />
                <span className={styles.fabLabel}>Travel AI</span>
            </button>

            {/* Chat window */}
            {open && (
                <div className={styles.window}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <div className={styles.avatar}>
                                <FaRobot />
                            </div>
                            <div>
                                <h4>JourneyBot</h4>
                                <span className={styles.status}>● Online</span>
                            </div>
                        </div>
                        <button className={styles.closeBtn} onClick={() => setOpen(false)}>
                            <FaTimes />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className={styles.messages}>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`${styles.bubble} ${msg.role === "user" ? styles.userBubble : styles.botBubble}`}
                            >
                                {msg.role === "bot" && (
                                    <div className={styles.botAvatar}>
                                        <FaRobot />
                                    </div>
                                )}
                                <div
                                    className={styles.bubbleText}
                                    dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                                />
                            </div>
                        ))}

                        {loading && (
                            <div className={`${styles.bubble} ${styles.botBubble}`}>
                                <div className={styles.botAvatar}><FaRobot /></div>
                                <div className={styles.typing}>
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Suggestions */}
                    {messages.length === 1 && (
                        <div className={styles.suggestions}>
                            {SUGGESTIONS.map((s) => (
                                <button key={s} className={styles.suggestion} onClick={() => handleSend(s)}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className={styles.inputRow}>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Ask me anything about travel..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            className={styles.input}
                            disabled={loading}
                        />
                        <button
                            className={styles.sendBtn}
                            onClick={() => handleSend()}
                            disabled={loading || !input.trim()}
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
