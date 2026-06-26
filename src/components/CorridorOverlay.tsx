import type { Floor } from "../types/store";
import { getRouteNodeOptions } from "../utils/indoorRoute";

type CorridorOverlayProps = {
  floor: Floor;
};

export default function CorridorOverlay({ floor }: CorridorOverlayProps) {
  const nodes = getRouteNodeOptions(floor);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const edges = nodes.flatMap((node) =>
    node.neighbors
      .filter((neighborId) => node.id < neighborId)
      .map((neighborId) => {
        const neighbor = nodeMap.get(neighborId);
        return neighbor ? { from: node, to: neighbor } : null;
      })
      .filter(Boolean)
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-[6]" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {edges.map((edge) => (
          <line
            key={`${edge!.from.id}-${edge!.to.id}`}
            x1={edge!.from.point.x}
            y1={edge!.from.point.y}
            x2={edge!.to.point.x}
            y2={edge!.to.point.y}
            stroke="rgba(11,45,92,0.85)"
            strokeWidth="0.75"
            strokeDasharray="1.6 1.2"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {nodes.map((node) => (
        <span
          key={node.id}
          className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-amber-400 text-[9px] font-black text-primary shadow"
          style={{ left: `${node.point.x}%`, top: `${node.point.y}%` }}
          title={node.labelKo}
        >
          +
        </span>
      ))}
    </div>
  );
}
