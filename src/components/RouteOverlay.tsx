import type { RoutePoint } from "../utils/indoorRoute";

type RouteOverlayProps = {
  points: RoutePoint[];
};

export default function RouteOverlay({ points }: RouteOverlayProps) {
  if (points.length < 2) return null;

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const start = points[0];
  const end = points[points.length - 1];

  return (
    <svg className="pointer-events-none absolute inset-0 z-[5] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
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
      <circle cx={start.x} cy={start.y} r="1.8" fill="#0B2D5C" stroke="white" strokeWidth="0.8" />
      <circle cx={end.x} cy={end.y} r="1.8" fill="#1E88E5" stroke="white" strokeWidth="0.8" />
    </svg>
  );
}
