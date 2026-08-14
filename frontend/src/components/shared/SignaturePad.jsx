import { useEffect, useRef } from "react";

function SignaturePad({ onChange, height = 220 }) {
    const canvasRef = useRef(null);
    const drawingRef = useRef(false);
    const hasInkRef = useRef(false);
    const lastPointRef = useRef(null);
    const snapshotRef = useRef(null);

    const applyBrush = (ctx) => {
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#0F4C81";
    };

    const redrawFromSnapshot = () => {
        const canvas = canvasRef.current;
        if (!canvas || !snapshotRef.current) return;
        const img = new Image();
        img.onload = () => {
            const ctx = canvas.getContext("2d");
            const dpr = window.devicePixelRatio || 1;
            ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
        };
        img.src = snapshotRef.current;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = Math.round(rect.width * dpr);
            canvas.height = Math.round(rect.height * dpr);
            const ctx = canvas.getContext("2d");
            ctx.scale(dpr, dpr);
            applyBrush(ctx);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, rect.width, rect.height);
            redrawFromSnapshot();
        };

        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        const clientY = e.clientY ?? e.touches?.[0]?.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const drawTo = (pos) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const last = lastPointRef.current;
        if (last) {
            ctx.beginPath();
            ctx.moveTo(last.x, last.y);
            const midX = (last.x + pos.x) / 2;
            const midY = (last.y + pos.y) / 2;
            ctx.quadraticCurveTo(last.x, last.y, midX, midY);
            ctx.stroke();
        }
        lastPointRef.current = pos;
        hasInkRef.current = true;
    };

    const start = (e) => {
        e.preventDefault();
        drawingRef.current = true;
        lastPointRef.current = null;
        drawTo(getPos(e));
    };

    const move = (e) => {
        if (!drawingRef.current) return;
        e.preventDefault();
        drawTo(getPos(e));
    };

    const end = () => {
        if (!drawingRef.current) return;
        drawingRef.current = false;
        if (hasInkRef.current && onChange) {
            const dataUrl = canvasRef.current.toDataURL("image/png");
            snapshotRef.current = dataUrl;
            onChange(dataUrl);
        }
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
        hasInkRef.current = false;
        lastPointRef.current = null;
        snapshotRef.current = null;
        if (onChange) onChange(null);
    };

    return (
        <div>
            <div
                className="border rounded-3 overflow-hidden"
                style={{ background: "#fff", touchAction: "none" }}
            >
                <canvas
                    ref={canvasRef}
                    style={{ width: "100%", height, cursor: "crosshair", display: "block" }}
                    onPointerDown={start}
                    onPointerMove={move}
                    onPointerUp={end}
                    onPointerLeave={end}
                    onTouchStart={start}
                    onTouchMove={move}
                    onTouchEnd={end}
                />
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2">
                <small className="text-muted">Sign using mouse or touch</small>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clear}>
                    <i className="bi bi-eraser me-1"></i>Clear
                </button>
            </div>
        </div>
    );
}

export default SignaturePad;
