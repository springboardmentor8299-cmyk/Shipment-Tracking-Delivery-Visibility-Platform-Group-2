import React, { useRef } from 'react';

const SignatureCapture: React.FC<{ onSave: (signature: string) => void }> = ({ onSave }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawing = useRef(false);
    const lastX = useRef(0);
    const lastY = useRef(0);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        isDrawing.current = true;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            lastX.current = e.clientX - rect.left;
            lastY.current = e.clientY - rect.top;
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing.current || !canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(lastX.current, lastY.current);
            const rect = canvasRef.current.getBoundingClientRect();
            lastX.current = e.clientX - rect.left;
            lastY.current = e.clientY - rect.top;
            ctx.lineTo(lastX.current, lastY.current);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        isDrawing.current = false;
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL();
            onSave(dataUrl);
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={400}
                height={200}
                style={{ border: '1px solid black' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            />
            <button onClick={clearCanvas}>Clear</button>
        </div>
    );
};

export default SignatureCapture;