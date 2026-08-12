import { useCallback, useEffect, useRef, useState } from "react";

export default function SignaturePad({
    onSave,
    onClear,
    width = 500,
    height = 200,
    showPreview = true
}) {

    const canvasRef = useRef(null);
    const drawingRef = useRef(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [preview, setPreview] = useState(null);

    const resizeCanvas = useCallback(() => {

        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const ratio = window.devicePixelRatio || 1;

        canvas.width = width * ratio;
        canvas.height = height * ratio;

        canvas.style.width = "100%";
        canvas.style.height = "auto";

        const ctx = canvas.getContext("2d");

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(ratio, ratio);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#000000";

    }, [width, height]);

    useEffect(() => {

        resizeCanvas();

    }, [resizeCanvas]);

    const getPosition = (event) => {

        const rect = canvasRef.current.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };

    };

    const handleStart = (event) => {

        event.preventDefault();

        const ctx = canvasRef.current.getContext("2d");
        const position = getPosition(event);

        drawingRef.current = true;
        setHasDrawn(true);

        ctx.beginPath();
        ctx.moveTo(position.x, position.y);

    };

    const handleMove = (event) => {

        if (!drawingRef.current) {
            return;
        }

        event.preventDefault();

        const ctx = canvasRef.current.getContext("2d");
        const position = getPosition(event);

        ctx.lineTo(position.x, position.y);
        ctx.stroke();

    };

    const handleEnd = (event) => {

        event.preventDefault();
        drawingRef.current = false;

    };

    const clearSignature = () => {

        resizeCanvas();
        setHasDrawn(false);
        setPreview(null);

        if (onClear) {
            onClear();
        }

    };

    const saveSignature = () => {

        const dataUrl = canvasRef.current.toDataURL("image/png");

        setPreview(dataUrl);

        if (onSave) {
            onSave(dataUrl);
        }

    };

    return (

        <div className="signature-pad">

            <canvas
                ref={canvasRef}
                className="border rounded"
                style={{
                    touchAction: "none",
                    cursor: "crosshair"
                }}
                onPointerDown={handleStart}
                onPointerMove={handleMove}
                onPointerUp={handleEnd}
                onPointerLeave={handleEnd}
            />

            <div className="d-flex gap-2 mt-2">

                <button
                    type="button"
                    className="btn btn-success btn-sm"
                    disabled={!hasDrawn}
                    onClick={saveSignature}
                >
                    Save Signature
                </button>

                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={clearSignature}
                >
                    Clear Signature
                </button>

            </div>

            {showPreview && preview && (

                <div className="mt-3">

                    <h6 className="text-muted mb-2">
                        Preview Signature
                    </h6>

                    <img
                        src={preview}
                        alt="Captured signature preview"
                        className="border rounded"
                        style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                            backgroundColor: "#ffffff"
                        }}
                    />

                </div>

            )}

        </div>

    );

}
