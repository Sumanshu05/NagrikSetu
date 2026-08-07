import React, { useState, useRef, useEffect } from "react";
import { IoSparkles, IoClose, IoSend, IoPersonCircleOutline } from "react-icons/io5";
import { askAiAssistant } from "../../services/operations/aiAPI";
import toast from "react-hot-toast";

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "Hello! I am **NagrikSetu AI Assistant** powered by Google Gemini. How can I help you with civic issues or platform guidance today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (textToSend) => {
        const queryText = textToSend || input;
        if (!queryText.trim() || loading) return;

        const userMsg = { role: "user", text: queryText };
        setMessages((prev) => [...prev, userMsg]);
        if (!textToSend) setInput("");
        setLoading(true);

        try {
            const aiReply = await askAiAssistant(queryText);
            setMessages((prev) => [...prev, { role: "assistant", text: aiReply }]);
        } catch (error) {
            toast.error("Failed to fetch response from AI Assistant.");
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: "Sorry, I encountered an issue reaching the server. Please check if `GEMINI_API_KEY` is configured in your server `.env` file.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const suggestionChips = [
        "How do I file a water leakage complaint?",
        "What is the average resolution time for streetlights?",
        "How to track my submitted grievance status?",
    ];

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-medium px-4 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                    title="Ask NagrikSetu AI Assistant"
                >
                    <IoSparkles className="text-xl animate-pulse text-yellow-300" />
                    <span>AI Assistant</span>
                </button>
            )}

            {/* AI Chat Modal Widget */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-slate-900 p-4 flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-yellow-300">
                                <IoSparkles className="text-lg" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-base leading-tight">NagrikSetu AI</h3>
                                <p className="text-xs text-indigo-200">Powered by Google Gemini</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                        >
                            <IoClose className="text-2xl" />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/60">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-2.5 ${
                                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                }`}
                            >
                                <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 ${
                                        msg.role === "user"
                                            ? "bg-purple-600 text-white"
                                            : "bg-indigo-600/30 text-yellow-300 border border-indigo-500/40"
                                    }`}
                                >
                                    {msg.role === "user" ? (
                                        <IoPersonCircleOutline className="text-lg" />
                                    ) : (
                                        <IoSparkles className="text-xs" />
                                    )}
                                </div>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                                        msg.role === "user"
                                            ? "bg-purple-600 text-white rounded-tr-none"
                                            : "bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none leading-relaxed"
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Loading Typing Indicator */}
                        {loading && (
                            <div className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-yellow-300 border border-indigo-500/40 flex items-center justify-center shrink-0">
                                    <IoSparkles className="text-xs animate-spin" />
                                </div>
                                <div className="bg-slate-800/90 border border-slate-700/60 text-slate-400 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
                                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestion Chips */}
                    {messages.length <= 2 && !loading && (
                        <div className="px-3 py-2 bg-slate-900 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                            {suggestionChips.map((chip, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(chip)}
                                    className="text-xs bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full text-left transition cursor-pointer"
                                >
                                    💡 {chip}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                        <textarea
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Gemini AI assistant..."
                            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none max-h-24"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || loading}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white p-2.5 rounded-xl transition cursor-pointer shrink-0"
                        >
                            <IoSend className="text-lg" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
