import { useEffect, useMemo, useState } from "react";
import type { Floor } from "../types/store";
import type { RouteGraph, RouteNode, RoutePoint, RouteStartNodeMap } from "../utils/indoorRoute";
import { getRouteGraph, getRouteStartNodeMap, resetRouteGraph, saveRouteGraph, saveRouteStartNodeMap } from "../utils/indoorRoute";

type CorridorManagerProps = {
  floor: Floor;
  pickedPoint: RoutePoint | null;
  onSaved: () => void;
};

type NodeForm = {
  id: string;
  labelKo: string;
  labelEn: string;
  x: number;
  y: number;
  neighborsText: string;
};

const emptyNodeForm: NodeForm = {
  id: "",
  labelKo: "",
  labelEn: "",
  x: 50,
  y: 50,
  neighborsText: ""
};

export default function CorridorManager({ floor, pickedPoint, onSaved }: CorridorManagerProps) {
  const [graph, setGraph] = useState<RouteGraph>(() => getRouteGraph());
  const [startNodeMap, setStartNodeMap] = useState<RouteStartNodeMap>(() => getRouteStartNodeMap());
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [form, setForm] = useState<NodeForm>(emptyNodeForm);
  const floorNodes = graph[floor] ?? [];
  const selectedStartNodeId = startNodeMap[floor] ?? "";

  const selectedNode = useMemo(
    () => floorNodes.find((routeNode) => routeNode.id === selectedNodeId),
    [floorNodes, selectedNodeId]
  );

  useEffect(() => {
    setGraph(getRouteGraph());
    setStartNodeMap(getRouteStartNodeMap());
    setSelectedNodeId("");
    setForm(emptyNodeForm);
  }, [floor]);

  useEffect(() => {
    if (!selectedNode) {
      setForm((previous) => ({
        ...emptyNodeForm,
        x: previous.x,
        y: previous.y
      }));
      return;
    }

    setForm({
      id: selectedNode.id,
      labelKo: selectedNode.labelKo,
      labelEn: selectedNode.labelEn,
      x: selectedNode.point.x,
      y: selectedNode.point.y,
      neighborsText: selectedNode.neighbors.join(", ")
    });
  }, [selectedNode]);

  useEffect(() => {
    if (!pickedPoint) return;
    setForm((previous) => ({
      ...previous,
      x: pickedPoint.x,
      y: pickedPoint.y
    }));
  }, [pickedPoint]);

  const updateForm = (field: keyof NodeForm, value: string | number) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSaveNode = () => {
    const nextNode = toRouteNode(form);
    if (!nextNode) return;

    const nextGraph = updateGraphNode(graph, floor, selectedNodeId, nextNode);
    const nextStartNodeMap = ensureStartNode(startNodeMap, floor, nextGraph[floor] ?? [], nextNode.id);
    setGraph(nextGraph);
    setStartNodeMap(nextStartNodeMap);
    setSelectedNodeId(nextNode.id);
    saveRouteGraph(nextGraph);
    saveRouteStartNodeMap(nextStartNodeMap);
    onSaved();
  };

  const handleDeleteNode = () => {
    if (!selectedNodeId) return;
    const nextNodes = floorNodes
      .filter((routeNode) => routeNode.id !== selectedNodeId)
      .map((routeNode) => ({
        ...routeNode,
        neighbors: routeNode.neighbors.filter((neighborId) => neighborId !== selectedNodeId)
      }));
    const nextGraph = { ...graph, [floor]: nextNodes };
    const nextStartNodeMap = ensureStartNode(startNodeMap, floor, nextNodes);
    setGraph(nextGraph);
    setStartNodeMap(nextStartNodeMap);
    setSelectedNodeId("");
    setForm(emptyNodeForm);
    saveRouteGraph(nextGraph);
    saveRouteStartNodeMap(nextStartNodeMap);
    onSaved();
  };

  const handleReset = () => {
    const nextGraph = resetRouteGraph();
    setGraph(nextGraph);
    setStartNodeMap(getRouteStartNodeMap());
    setSelectedNodeId("");
    setForm(emptyNodeForm);
    onSaved();
  };

  const handleStartNodeChange = (nodeId: string) => {
    const nextStartNodeMap = { ...startNodeMap, [floor]: nodeId };
    setStartNodeMap(nextStartNodeMap);
    saveRouteStartNodeMap(nextStartNodeMap);
    onSaved();
  };

  return (
    <section className="grid gap-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3">
      <div>
        <h3 className="text-sm font-black text-primary">통로망 편집</h3>
        <p className="mt-1 text-xs font-bold leading-5 text-slate-600">
          지도에서 좌표를 찍고 노드를 저장하세요. 연결 노드는 쉼표로 구분합니다.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <select
          value={selectedNodeId}
          onChange={(event) => setSelectedNodeId(event.target.value)}
          className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800"
          aria-label="통로 노드 선택"
        >
          <option value="">새 통로 노드</option>
          {floorNodes.map((routeNode) => (
            <option key={routeNode.id} value={routeNode.id}>
              {routeNode.labelKo} ({routeNode.id})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setSelectedNodeId("");
            setForm(emptyNodeForm);
          }}
          className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-primary"
        >
          새 노드
        </button>
      </div>

      <label className="grid gap-1 text-xs font-black text-slate-700">
        이 층 경로 출발점
        <select
          value={selectedStartNodeId}
          onChange={(event) => handleStartNodeChange(event.target.value)}
          className="min-h-11 rounded-lg border border-blue-100 bg-white px-3 text-sm font-bold text-primary"
          aria-label="이 층 경로 출발점 선택"
        >
          {floorNodes.map((routeNode) => (
            <option key={routeNode.id} value={routeNode.id}>
              {routeNode.labelKo} ({routeNode.id})
            </option>
          ))}
        </select>
      </label>

      {pickedPoint && (
        <p className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-xs font-black text-primary">
          지도 클릭 좌표 자동 적용됨: x {pickedPoint.x}, y {pickedPoint.y}
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <TextInput label="노드 ID" value={form.id} onChange={(value) => updateForm("id", slugify(value))} />
        <TextInput label="노드명" value={form.labelKo} onChange={(value) => updateForm("labelKo", value)} />
        <TextInput label="영문명" value={form.labelEn} onChange={(value) => updateForm("labelEn", value)} />
        <TextInput label="연결 노드 ID" value={form.neighborsText} onChange={(value) => updateForm("neighborsText", value)} />
        <NumberInput label="X 좌표" value={form.x} onChange={(value) => updateForm("x", value)} />
        <NumberInput label="Y 좌표" value={form.y} onChange={(value) => updateForm("y", value)} />
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <button type="button" onClick={handleSaveNode} className="min-h-11 rounded-lg bg-primary px-4 text-sm font-black text-white">
          통로 저장
        </button>
        <button
          type="button"
          onClick={handleDeleteNode}
          disabled={!selectedNodeId}
          className="min-h-11 rounded-lg border border-rose-200 bg-white px-4 text-sm font-black text-rose-700 disabled:opacity-40"
        >
          노드 삭제
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-600"
        >
          기본값 복원
        </button>
      </div>
    </section>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-xs font-black text-slate-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
      />
    </label>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-1 text-xs font-black text-slate-700">
      {label}
      <input
        type="number"
        min={0}
        max={100}
        step={0.1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
      />
    </label>
  );
}

function toRouteNode(form: NodeForm): RouteNode | null {
  const id = slugify(form.id);
  if (!id) return null;

  return {
    id,
    labelKo: form.labelKo.trim() || id,
    labelEn: form.labelEn.trim() || id,
    point: {
      x: clampPercent(form.x),
      y: clampPercent(form.y)
    },
    neighbors: form.neighborsText
      .split(",")
      .map((neighborId) => slugify(neighborId))
      .filter((neighborId) => neighborId && neighborId !== id)
  };
}

function updateGraphNode(graph: RouteGraph, floor: Floor, previousId: string, node: RouteNode): RouteGraph {
  const nodes = graph[floor] ?? [];
  const nextNodes = nodes
    .filter((routeNode) => routeNode.id !== previousId && routeNode.id !== node.id)
    .map((routeNode) => ({
      ...routeNode,
      neighbors: routeNode.neighbors.map((neighborId) => (neighborId === previousId ? node.id : neighborId))
    }));
  const knownIds = new Set([...nextNodes.map((routeNode) => routeNode.id), node.id]);
  const nextNode = {
    ...node,
    neighbors: Array.from(new Set(node.neighbors.filter((neighborId) => knownIds.has(neighborId))))
  };

  const withNode = [...nextNodes, nextNode].map((routeNode) => {
    if (nextNode.neighbors.includes(routeNode.id) && !routeNode.neighbors.includes(nextNode.id)) {
      return { ...routeNode, neighbors: [...routeNode.neighbors, nextNode.id] };
    }
    return routeNode;
  });

  return { ...graph, [floor]: withNode };
}

function ensureStartNode(startNodeMap: RouteStartNodeMap, floor: Floor, floorNodes: RouteNode[], preferredNodeId = ""): RouteStartNodeMap {
  const existingStartId = startNodeMap[floor];
  if (floorNodes.some((routeNode) => routeNode.id === existingStartId)) return startNodeMap;

  return {
    ...startNodeMap,
    [floor]: floorNodes.find((routeNode) => routeNode.id === preferredNodeId)?.id ?? floorNodes[0]?.id ?? existingStartId
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clampPercent(value: number) {
  if (Number.isNaN(value)) return 50;
  return Math.min(100, Math.max(0, value));
}
