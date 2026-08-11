import { useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaPaperPlane, FaChevronDown, FaChevronUp } from "react-icons/fa";
import {
    getNotificationRecipientOptions,
    broadcastNotification,
} from "../services/adminNotificationService";
import { NOTIFICATION_TYPES } from "../utils/notificationTypes";
import "./SendNotification.css";

// Admin-only: manually push a notification either to every user in a role,
// or to specific people picked from that role once it's checked (a
// customer identified by tracking ID, or named business clients /
// operators / support agents). Admins aren't a selectable target.
const RECIPIENT_GROUPS = [
    { role: "CUSTOMER", label: "Customers", optionsKey: "customers" },
    { role: "BUSINESS_CLIENT", label: "Business Clients", optionsKey: "businessClients" },
    { role: "LOGISTICS_OPERATOR", label: "Logistics Operators", optionsKey: "logisticsOperators" },
    { role: "SUPPORT_AGENT", label: "Support Agents", optionsKey: "supportAgents" },
];

const TYPE_OPTIONS = Object.entries(NOTIFICATION_TYPES).map(([key, meta]) => ({
    value: key,
    label: meta.label,
}));

export default function SendNotification() {
    const [checkedRoles, setCheckedRoles] = useState([]);
    // role -> array of selected ids (customerId for CUSTOMER, userId otherwise)
    const [selectedIds, setSelectedIds] = useState({});
    // role -> search text filtering that role's picker
    const [pickerSearch, setPickerSearch] = useState({});
    const [expandedRole, setExpandedRole] = useState(null);

    const [options, setOptions] = useState(null);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [optionsError, setOptionsError] = useState("");

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("SYSTEM");
    const [trackingId, setTrackingId] = useState("");

    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    useEffect(() => {
        loadOptions();
    }, []);

    const loadOptions = async () => {
        setOptionsLoading(true);
        setOptionsError("");
        try {
            const data = await getNotificationRecipientOptions();
            setOptions(data);
        } catch (err) {
            console.error("Failed to load recipient options:", err);
            setOptionsError(
                err?.response?.data?.message ||
                    "Could not load the recipient lists. This needs a matching backend at GET /api/admin/notifications/recipients.",
            );
        } finally {
            setOptionsLoading(false);
        }
    };

    const allSelected = checkedRoles.length === RECIPIENT_GROUPS.length;

    const toggleRole = (role) => {
        setResult(null);
        setCheckedRoles((prev) => {
            if (prev.includes(role)) {
                // Unchecking clears whatever specific picks were made, so a
                // later re-check starts fresh instead of silently keeping
                // stale hidden selections.
                setSelectedIds((ids) => ({ ...ids, [role]: [] }));
                if (expandedRole === role) setExpandedRole(null);
                return prev.filter((r) => r !== role);
            }
            setExpandedRole(role);
            return [...prev, role];
        });
    };

    const toggleAll = () => {
        setResult(null);
        if (allSelected) {
            setCheckedRoles([]);
            setSelectedIds({});
            setExpandedRole(null);
        } else {
            setCheckedRoles(RECIPIENT_GROUPS.map((g) => g.role));
        }
    };

    const toggleId = (role, id) => {
        setResult(null);
        setSelectedIds((prev) => {
            const current = prev[role] || [];
            const next = current.includes(id)
                ? current.filter((x) => x !== id)
                : [...current, id];
            return { ...prev, [role]: next };
        });
    };

    const optionsForRole = (role) => {
        const group = RECIPIENT_GROUPS.find((g) => g.role === role);
        const list = options?.[group.optionsKey] || [];
        const q = (pickerSearch[role] || "").trim().toLowerCase();
        if (!q) return list;
        if (role === "CUSTOMER") {
            return list.filter(
                (o) =>
                    o.trackingId?.toLowerCase().includes(q) ||
                    o.customerName?.toLowerCase().includes(q),
            );
        }
        return list.filter(
            (o) =>
                o.name?.toLowerCase().includes(q) || o.username?.toLowerCase().includes(q),
        );
    };

    const idFor = (role, option) => (role === "CUSTOMER" ? option.customerId : option.userId);

    const summaryForRole = (role) => {
        const group = RECIPIENT_GROUPS.find((g) => g.role === role);
        const total = options?.[group.optionsKey]?.length ?? 0;
        const picked = (selectedIds[role] || []).length;
        if (picked === 0) return `All ${total} ${group.label.toLowerCase()}`;
        return `${picked} of ${total} selected`;
    };

    const canSend = useMemo(
        () => checkedRoles.length > 0 && title.trim() && message.trim() && !sending,
        [checkedRoles, title, message, sending],
    );

    const handleSend = async (e) => {
        e.preventDefault();
        setError("");
        setResult(null);

        if (checkedRoles.length === 0) {
            setError("Select at least one recipient group.");
            return;
        }
        if (!title.trim() || !message.trim()) {
            setError("Title and message are both required.");
            return;
        }

        // A role with no specific picks broadcasts to the whole role;
        // a role with specific picks only targets those ids.
        const wholeRoles = [];
        const specificIds = [];
        checkedRoles.forEach((role) => {
            const picks = selectedIds[role] || [];
            if (picks.length === 0) {
                wholeRoles.push(role);
            } else {
                specificIds.push(...picks);
            }
        });

        setSending(true);
        try {
            const response = await broadcastNotification({
                roles: wholeRoles,
                userIds: specificIds,
                title: title.trim(),
                message: message.trim(),
                type,
                trackingId: trackingId.trim() || null,
            });
            setResult(response);
            setTitle("");
            setMessage("");
            setTrackingId("");
        } catch (err) {
            console.error("Failed to send broadcast notification:", err);
            setError(
                err?.response?.data?.message ||
                    "Could not send this notification. This needs a matching backend at POST /api/admin/notifications/broadcast.",
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <form className="sendnotif-card" onSubmit={handleSend}>
            <p className="sendnotif-intro">
                Push a notification straight to a group's feed (and their email/SMS,
                if they have those channels enabled) — or tick a group open to pick
                specific people instead of everyone in it.
            </p>

            <div className="sendnotif-section">
                <label className="sendnotif-label">Recipients</label>

                {optionsError && <p className="sendnotif-error">{optionsError}</p>}

                <div className="sendnotif-roles">
                    <label className="sendnotif-role-chip">
                        <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                        All
                    </label>
                    {RECIPIENT_GROUPS.map((g) => {
                        const checked = checkedRoles.includes(g.role);
                        return (
                            <div key={g.role} className="sendnotif-role-chip-wrap">
                                <label
                                    className={
                                        checked ? "sendnotif-role-chip active" : "sendnotif-role-chip"
                                    }
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleRole(g.role)}
                                    />
                                    {g.label}
                                </label>
                                {checked && (
                                    <button
                                        type="button"
                                        className="sendnotif-expand-btn"
                                        onClick={() =>
                                            setExpandedRole(expandedRole === g.role ? null : g.role)
                                        }
                                        title={
                                            expandedRole === g.role
                                                ? "Collapse"
                                                : "Pick specific recipients"
                                        }
                                    >
                                        {expandedRole === g.role ? (
                                            <FaChevronUp size={10} />
                                        ) : (
                                            <FaChevronDown size={10} />
                                        )}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {checkedRoles.length > 0 && (
                    <div className="sendnotif-role-summaries">
                        {checkedRoles.map((role) => {
                            const group = RECIPIENT_GROUPS.find((g) => g.role === role);
                            return (
                                <span key={role} className="sendnotif-role-summary">
                                    {group.label}: {summaryForRole(role)}
                                </span>
                            );
                        })}
                    </div>
                )}

                {optionsLoading && checkedRoles.length > 0 && (
                    <p className="sendnotif-muted">Loading recipients…</p>
                )}

                {!optionsLoading && expandedRole && (
                    <div className="sendnotif-picker">
                        <input
                            type="text"
                            className="sendnotif-picker-search"
                            placeholder={
                                expandedRole === "CUSTOMER"
                                    ? "Search by tracking ID or customer name"
                                    : "Search by name or username"
                            }
                            value={pickerSearch[expandedRole] || ""}
                            onChange={(e) =>
                                setPickerSearch((prev) => ({ ...prev, [expandedRole]: e.target.value }))
                            }
                        />

                        <div className="sendnotif-picker-list">
                            {optionsForRole(expandedRole).length === 0 ? (
                                <p className="sendnotif-muted sendnotif-picker-empty">
                                    No matches.
                                </p>
                            ) : (
                                optionsForRole(expandedRole).map((option) => {
                                    const id = idFor(expandedRole, option);
                                    const checked = (selectedIds[expandedRole] || []).includes(id);
                                    return (
                                        <label key={id} className="sendnotif-picker-row">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleId(expandedRole, id)}
                                            />
                                            {expandedRole === "CUSTOMER" ? (
                                                <span>
                                                    <strong>{option.trackingId}</strong> —{" "}
                                                    {option.customerName}
                                                </span>
                                            ) : (
                                                <span>
                                                    {option.name || option.username}
                                                    {option.name && option.username && (
                                                        <span className="sendnotif-picker-username">
                                                            {" "}
                                                            ({option.username})
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </label>
                                    );
                                })
                            )}
                        </div>

                        {(selectedIds[expandedRole] || []).length > 0 && (
                            <button
                                type="button"
                                className="sendnotif-link-btn"
                                onClick={() =>
                                    setSelectedIds((prev) => ({ ...prev, [expandedRole]: [] }))
                                }
                            >
                                Clear picks — send to everyone in this group instead
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="sendnotif-section sendnotif-grid-2">
                <div>
                    <label className="sendnotif-label">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Scheduled maintenance tonight"
                        maxLength={120}
                    />
                </div>
                <div>
                    <label className="sendnotif-label">Category</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        {TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="sendnotif-section">
                <label className="sendnotif-label">Message</label>
                <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What do you want to tell them?"
                    maxLength={1000}
                />
            </div>

            <div className="sendnotif-section">
                <label className="sendnotif-label">Related tracking ID (optional)</label>
                <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="e.g. TRK-BFA3C386"
                />
            </div>

            {type !== "SYSTEM" && (
                <p className="sendnotif-hint">
                    Recipients who've turned this category off in their notification
                    preferences won't receive it. Choose "System" to reach everyone
                    regardless of preferences.
                </p>
            )}

            {error && <p className="sendnotif-error">{error}</p>}

            {result && (
                <p className="sendnotif-success">
                    <FaCheckCircle /> Sent to {result.notifiedUserCount} of{" "}
                    {result.matchedUserCount} matching user(s).
                </p>
            )}

            <button type="submit" className="sendnotif-btn" disabled={!canSend}>
                <FaPaperPlane /> {sending ? "Sending…" : "Send Notification"}
            </button>
        </form>
    );
}
