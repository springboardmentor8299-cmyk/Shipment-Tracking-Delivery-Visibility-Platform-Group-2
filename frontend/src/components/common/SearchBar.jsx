import { useState } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { Search } from "lucide-react";

function SearchBar() {
	const [q, setQ] = useState("");
	const navigate = useNavigate();

	const submit = (e) => {
		e?.preventDefault();
		const trimmed = String(q || "").trim();
		if (!trimmed) return;
		navigate({ pathname: "/admin/shipments", search: "?" + createSearchParams({ q: trimmed }) });
	};

	return (
		<form onSubmit={submit} className="search-bar-form" style={{ display: "flex", alignItems: "center", width: "100%" }}>
			<div style={{
				display: "flex",
				alignItems: "center",
				gap: 8,
				width: "100%",
				background: "#f1f5f9",
				borderRadius: 12,
				padding: "8px 14px",
				border: "1px solid #e2e8f0",
				transition: "all 0.2s"
			}}>
				<Search size={16} style={{ color: "#94a3b8", flexShrink: 0 }} />
				<input
					value={q}
					onChange={(e) => setQ(e.target.value)}
					placeholder="Search shipments..."
					style={{
						width: '100%',
						border: "none",
						outline: "none",
						height: 32,
						fontSize: 13,
						background: 'transparent',
						color: '#0f172a',
						fontFamily: "'Inter', system-ui, sans-serif"
					}}
				/>
			</div>
		</form>
	);
}

export default SearchBar;
