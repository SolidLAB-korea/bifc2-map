import type { RoutePoint } from "../utils/indoorRoute";

type RouteOverlayProps = {
  points: RoutePoint[];
  startLabel?: string;
};

export default function RouteOverlay({ points, startLabel }: RouteOverlayProps) {
  if (points.length < 2) return null;

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const start = points[0];
  const end = points[points.length - 1];

  return (
    <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="rgba(255,255,255,0.92)"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="#1E88E5"
          strokeWidth="2"
          strokeDasharray="3 2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={start.x} cy={start.y} r="2.2" fill="#0B2D5C" stroke="white" strokeWidth="0.9" />
        <circle cx={end.x} cy={end.y} r="1.8" fill="#1E88E5" stroke="white" strokeWidth="0.8" />
      </svg>
      {startLabel && (
        <span
          className="absolute max-w-28 -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-md bg-primary px-2 py-1 text-center text-[10px] font-black leading-tight text-white shadow-panel ring-1 ring-white/80 sm:max-w-36 sm:text-xs"
          style={{ left: `${start.x}%`, top: `${start.y}%` }}
        >
          {startLabel}
        </span>
      )}
    </div>
  );
}
