import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, ChevronDown, UserCircle, LogOut } from "lucide-react";
import { clearAuthData, getStoredUser } from "../../utils/auth";

function ProfileMenu() {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const user = getStoredUser();
	const menuRef = useRef(null);

	useEffect(() => {
		function handleClick(e) {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	const logout = () => {
		clearAuthData();
		navigate("/login", { replace: true });
	};

	const goToNotifications = () => {
		const roleUpper = (user?.role || "").toUpperCase();
		if (roleUpper.includes("ADMIN")) {
			navigate("/admin/notifications");
		} else if (roleUpper.includes("BUSINESS")) {
			navigate("/business/notifications");
		} else if (roleUpper.includes("OPERATOR")) {
			navigate("/operator/notifications");
		} else if (roleUpper.includes("SUPPORT")) {
			navigate("/support/notifications");
		} else {
			navigate("/customer/notifications");
		}
		setOpen(false);
	};

	return (
		<div ref={menuRef} style={{ position: "relative", display: 'flex', alignItems: 'center' }}>
			<button
				onClick={() => setOpen((s) => !s)}
				style={{
					display: "flex",
					alignItems: "center",
					gap: 8,
					padding: "6px 12px 6px 6px",
					borderRadius: 12,
					border: "1px solid #e2e8f0",
					background: "#f8fafc",
					cursor: "pointer",
					transition: "all 0.2s"
				}}
				aria-label="Open profile menu"
			>
				<div style={{
					width: 34,
					height: 34,
					borderRadius: 10,
					background: "linear-gradient(135deg, #2563eb, #7c3aed)",
					color: "#fff",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontWeight: 700,
					fontSize: 14,
					fontFamily: "'Inter', sans-serif",
					boxShadow: "0 2px 6px rgba(37,99,235,0.3)"
				}}>
					{user?.username ? user.username.charAt(0).toUpperCase() : <User size={16} />}
				</div>
				<div style={{ textAlign: 'left' }}>
					<div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
						{user?.username || "User"}
					</div>
					<div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' }}>
						{user?.role?.toLowerCase() || 'Customer'}
					</div>
				</div>
				<ChevronDown
					size={14}
					color="#94a3b8"
					style={{
						transition: "transform 0.2s",
						transform: open ? "rotate(180deg)" : "rotate(0deg)"
					}}
				/>
			</button>

			{open && (
				<div style={{
					position: "absolute",
					right: 0,
					top: 52,
					width: 200,
					background: "#fff",
					boxShadow: "0 8px 30px rgba(15,23,42,0.12)",
					borderRadius: 14,
					border: "1px solid #e2e8f0",
					zIndex: 100,
					overflow: "hidden",
					animation: "dropIn 0.2s ease-out"
				}}>
					<div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
						<div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{user?.username || "User"}</div>
						<div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{user?.email}</div>
					</div>
					<button
						onClick={goToProfile}
						style={{
							width: "100%",
							padding: "12px 16px",
							textAlign: "left",
							border: "none",
							background: "transparent",
							cursor: "pointer",
							fontSize: 13,
							fontWeight: 500,
							color: "#334155",
							display: "flex",
							alignItems: "center",
							gap: 10,
							transition: "background 0.15s"
						}}
						onMouseEnter={(e) => e.target.style.background = "#f8fafc"}
						onMouseLeave={(e) => e.target.style.background = "transparent"}
					>
						<UserCircle size={16} />
						My Profile
					</button>
					<button
						onClick={goToNotifications}
						style={{
							width: "100%",
							padding: "12px 16px",
							textAlign: "left",
							border: "none",
							background: "transparent",
							cursor: "pointer",
							fontSize: 13,
							fontWeight: 500,
							color: "#334155",
							display: "flex",
							alignItems: "center",
							gap: 10,
							transition: "background 0.15s"
						}}
						onMouseEnter={(e) => e.target.style.background = "#f8fafc"}
						onMouseLeave={(e) => e.target.style.background = "transparent"}
					>
						<Bell size={16} />
						Notifications
					</button>
					<button
						onClick={logout}
						style={{
							width: "100%",
							padding: "12px 16px",
							textAlign: "left",
							border: "none",
							background: "transparent",
							cursor: "pointer",
							fontSize: 13,
							fontWeight: 500,
							color: "#ef4444",
							display: "flex",
							alignItems: "center",
							gap: 10,
							transition: "background 0.15s"
						}}
						onMouseEnter={(e) => e.target.style.background = "#fef2f2"}
						onMouseLeave={(e) => e.target.style.background = "transparent"}
					>
						<LogOut size={16} />
						Sign Out
					</button>
				</div>
			)}
		</div>
	);
}

export default ProfileMenu;
