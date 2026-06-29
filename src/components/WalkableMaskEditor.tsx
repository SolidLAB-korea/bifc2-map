import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Floor } from "../types/store";
import type { RoutePoint } from "../utils/indoorRoute";
import { clearWalkableMask, getWalkableMask, paintWalkableMask, saveWalkableMask, type WalkableMask } from "../utils/walkableMask";

type WalkableMaskEditorProps = {
  floor: Floor;
};

type PaintMode = "draw" | "erase";

export default function WalkableMaskEditor({ floor }: WalkableMaskEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mask, setMask] = useState<WalkableMask>(() => getWalkableMask(floor));
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState<PaintMode>("draw");
  const [isPainting, setIsPainting] = useState(false);

  useEffect(() => {
    setMask(getWalkableMask(floor));
  }, [floor]);

  useEffect(() => {
    drawMask(canvasRef.current, mask);
  }, [mask]);

  const paintAtEvent = (event: React.PointerEvent<HTMLDivElement>) => {
    const point = getPointFromPointer(event);
    const nextMask = paintWalkableMask(mask, point, brushSize, mode);
    setMask(nextMask);
    saveWalkableMask(floor, nextMask);
  };

  const handleClear = () => {
    clearWalkableMask(floor);
    setMask(getWalkableMask(floor));
  };

  return (
    <div
      className="absolute inset-0 z-[25] touch-none"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setIsPainting(true);
        paintAtEvent(event);
      }}
      onPointerMove={(event) => {
        if (!isPainting) return;
        paintAtEvent(event);
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        setIsPainting(false);
      }}
      onPointerCancel={() => setIsPainting(false)}
      onClick={(event) => event.stopPropagation()}
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" width={100} height={100} />

      <div className="absolute left-2 top-2 grid max-w-[calc(100%-1rem)] grid-cols-[auto_auto_auto_auto] gap-1 rounded-lg border border-blue-100 bg-white/95 p-1.5 shadow-panel">
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setMode("draw")}
          className={`rounded-md px-2 py-1 text-xs font-black ${mode === "draw" ? "bg-accent text-white" : "bg-slate-100 text-primary"}`}
        >
          칠하기
        </button>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setMode("erase")}
          className={`rounded-md px-2 py-1 text-xs font-black ${mode === "erase" ? "bg-rose-600 text-white" : "bg-slate-100 text-primary"}`}
        >
          지우기
        </button>
        <label className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-primary">
          굵기
          <input
            type="range"
            min={2}
            max={12}
            value={brushSize}
            onPointerDown={(event) => event.stopPropagation()}
            onChange={(event) => setBrushSize(Number(event.target.value))}
            className="w-16"
          />
        </label>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={handleClear}
          className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-600"
        >
          초기화
        </button>
      </div>
    </div>
  );
}

function getPointFromPointer(event: PointerEvent<HTMLDivElement>): RoutePoint {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: Math.round(((event.clientX - rect.left) / rect.width) * 1000) / 10,
    y: Math.round(((event.clientY - rect.top) / rect.height) * 1000) / 10
  };
}

function drawMask(canvas: HTMLCanvasElement | null, mask: WalkableMask) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(30, 136, 229, 0.26)";

  mask.cells.forEach((value, index) => {
    if (!value) return;
    const x = index % mask.size;
    const y = Math.floor(index / mask.size);
    context.fillRect(x, y, 1, 1);
  });
}
