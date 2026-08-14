import { useState, useEffect, useRef, useCallback } from "react";
import { fetchMessages, postMessage, resolveChat } from "../../services/supportService";
import { connectToSupportChat, disconnectSupportChat } from "../../services/socketService";

function ChatThread({ query, currentUser, onChanged, onError }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [resolving, setResolving] = useState(false);
    const endRef = useRef(null);
    const onChangedRef = useRef(onChanged);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onChangedRef.current = onChanged;
        onErrorRef.current = onError;
    });

    const resolved = query?.status === "RESOLVED";

    const loadMessages = useCallback(async () => {
        try {
            setMessages(await fetchMessages(query.id));
        } catch {
            onErrorRef.current?.("Failed to load chat messages.");
        } finally {
            setLoading(false);
        }
    }, [query.id]);

    useEffect(() => {
        setLoading(true);
        setMessages([]);
        loadMessages();
        connectToSupportChat(query.id, () => {
            loadMessages();
            onChangedRef.current?.();
        });
        return () => disconnectSupportChat();
    }, [query?.id, loadMessages]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim() || resolved) return;
        setSending(true);
        try {
            await postMessage(query.id, text);
            setText("");
            await loadMessages();
            onChangedRef.current?.();
        } catch {
            onErrorRef.current?.("Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    const handleResolve = async () => {
        if (resolved) return;
        setResolving(true);
        try {
            await resolveChat(query.id);
            await loadMessages();
            onChangedRef.current?.();
        } catch {
            onErrorRef.current?.("Failed to resolve the conversation.");
        } finally {
            setResolving(false);
        }
    };

    if (!query) return null;

    return (
        <div className="d-flex flex-column" style={{ height: "480px" }}>
            <div className="flex-grow-1 overflow-auto p-3 bg-light rounded-3 mb-3" style={{ minHeight: 0 }}>
                {loading ? (
                    <p className="text-muted text-center mb-0">Loading messages...</p>
                ) : messages.length === 0 ? (
                    <p className="text-muted text-center mb-0">No messages yet.</p>
                ) : (
                    messages.map((m) => {
                        const mine = m.senderEmail === currentUser?.email || (currentUser?.id != null && m.senderId === currentUser.id);
                        return (
                            <div key={m.id} className={`d-flex ${mine ? "justify-content-end" : "justify-content-start"} mb-2`}>
                                <div
                                    className={`rounded-3 px-3 py-2 ${mine ? "bg-primary text-white" : "bg-white border"}`}
                                    style={{ maxWidth: "75%" }}
                                >
                                    {!mine && (
                                        <small className={`d-block fw-semibold ${mine ? "" : "text-primary"}`}>
                                            {m.senderName}
                                            <span className="text-muted fw-normal"> ({m.senderRole})</span>
                                        </small>
                                    )}
                                    <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.content}</div>
                                    <small className={mine ? "text-white-50" : "text-muted"}>
                                        {m.sentAt ? new Date(m.sentAt).toLocaleString() : ""}
                                    </small>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={endRef} />
            </div>

            {resolved ? (
                <div className="alert alert-success mb-0 py-2">
                    <i className="bi bi-check-circle me-2"></i>
                    This conversation has been resolved{query.resolvedByName ? ` by ${query.resolvedByName}` : ""}. It is now read-only.
                </div>
            ) : (
                <>
                    <form onSubmit={handleSend} className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button className="btn btn-primary" type="submit" disabled={sending || !text.trim()}>
                            {sending ? "Sending..." : "Send"}
                        </button>
                    </form>
                    <div className="d-flex justify-content-end mt-2">
                        <button className="btn btn-sm btn-success" onClick={handleResolve} disabled={resolving}>
                            {resolving ? "Resolving..." : <><i className="bi bi-check2-circle me-1"></i>Resolve</>}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ChatThread;
