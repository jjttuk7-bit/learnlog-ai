"use client";

import { memo, useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export type GraphNode = {
  id: string;
  label: string;
  studyAmount: number;
  day: number;
};

export type GraphEdge = {
  source: string;
  target: string;
  weight: number;
  relationLabel: string;
};

type KnowledgeNodeData = {
  label: string;
  studyAmount: number;
  day: number;
  highlighted: boolean;
  selected: boolean;
};

function KnowledgeNode({ data, selected }: NodeProps) {
  const d = data as KnowledgeNodeData;
  const size = 28 + d.studyAmount * 6;
  const isHighlighted = d.highlighted;

  return (
    <div
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.18) }}
      className={`rounded-full border-2 flex items-center justify-center text-center font-semibold cursor-pointer select-none transition-all leading-tight px-1
        ${isHighlighted
          ? "bg-blue-500 border-blue-300 text-white shadow-lg shadow-blue-500/40"
          : selected
          ? "bg-slate-600 border-blue-400 text-white"
          : "bg-slate-800 border-slate-600 text-slate-200 hover:border-slate-400"
        }`}
    >
      <Handle type="target" position={Position.Left} className="!opacity-0 !w-1 !h-1" />
      <span className="break-words">{d.label}</span>
      <Handle type="source" position={Position.Right} className="!opacity-0 !w-1 !h-1" />
    </div>
  );
}

const MemoKnowledgeNode = memo(KnowledgeNode);

function KnowledgeEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as { weight: number; relationLabel: string } | undefined;
  const weight = edgeData?.weight ?? 3;
  const strokeWidth = 1 + weight * 0.4;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? "#60a5fa" : `rgba(100, 116, 139, ${0.3 + weight * 0.07})`,
          strokeWidth: selected ? strokeWidth + 1 : strokeWidth,
        }}
      />
      {edgeData?.relationLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "none",
            }}
            className="absolute text-[10px] bg-slate-900/80 border border-slate-700 rounded px-1 py-0.5 text-slate-400"
          >
            {edgeData.relationLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const MemoKnowledgeEdge = memo(KnowledgeEdge);

const nodeTypes = { knowledge: MemoKnowledgeNode };
const edgeTypes = { knowledge: MemoKnowledgeEdge };

function layoutNodes(graphNodes: GraphNode[]): Node[] {
  const count = graphNodes.length;
  return graphNodes.map((n, i) => {
    const angle = (2 * Math.PI * i) / count;
    const radius = Math.min(300, 80 + count * 25);
    return {
      id: n.id,
      type: "knowledge",
      position: {
        x: 400 + radius * Math.cos(angle),
        y: 300 + radius * Math.sin(angle),
      },
      data: {
        label: n.label,
        studyAmount: n.studyAmount,
        day: n.day,
        highlighted: false,
        selected: false,
      },
    };
  });
}

function buildFlowEdges(graphEdges: GraphEdge[]): Edge[] {
  return graphEdges.map((e, i) => ({
    id: `e-${i}-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    type: "knowledge",
    data: { weight: e.weight, relationLabel: e.relationLabel },
  }));
}

interface Props {
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  onNodeClick?: (node: GraphNode) => void;
}

export function KnowledgeGraph({ graphNodes, graphEdges, onNodeClick }: Props) {
  const [search, setSearch] = useState("");
  const [currentDay, setCurrentDay] = useState<number>(0);

  const maxDay = useMemo(
    () => graphNodes.reduce((m, n) => Math.max(m, n.day), 1),
    [graphNodes]
  );

  const filteredNodes = useMemo(() => {
    const dayLimit = currentDay === 0 ? maxDay : currentDay;
    return graphNodes.filter((n) => n.day <= dayLimit);
  }, [graphNodes, currentDay, maxDay]);

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    return graphEdges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
  }, [graphEdges, filteredNodes]);

  const flowNodes: Node[] = useMemo(() => {
    const searchLower = search.toLowerCase();
    return layoutNodes(filteredNodes).map((n) => ({
      ...n,
      data: {
        ...n.data,
        highlighted: search.length > 0 && (n.data as KnowledgeNodeData).label.toLowerCase().includes(searchLower),
      },
    }));
  }, [filteredNodes, search]);

  const flowEdges: Edge[] = useMemo(() => buildFlowEdges(filteredEdges), [filteredEdges]);

  const [nodes, , onNodesChange] = useNodesState(flowNodes);
  const [edges, , onEdgesChange] = useEdgesState(flowEdges);

  const syncedNodes = useMemo(() => {
    const map = new Map(nodes.map((n) => [n.id, n.position]));
    return flowNodes.map((n) => ({
      ...n,
      position: map.get(n.id) ?? n.position,
    }));
  }, [flowNodes, nodes]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const original = graphNodes.find((n) => n.id === node.id);
      if (original && onNodeClick) onNodeClick(original);
    },
    [graphNodes, onNodeClick]
  );

  const dayLabel = currentDay === 0 ? `전체 (${maxDay}일)` : `${currentDay}일차`;

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="개념 검색..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>
        <div className="text-xs text-slate-400 whitespace-nowrap">
          {filteredNodes.length}개 개념
        </div>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border border-slate-700 min-h-0">
        <ReactFlow
          nodes={syncedNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          colorMode="dark"
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1e293b" />
          <Controls className="[&>button]:bg-slate-800 [&>button]:border-slate-600 [&>button]:text-slate-300" />
          <MiniMap
            className="!bg-slate-900 !border-slate-700"
            nodeColor={(n) => {
              const d = n.data as KnowledgeNodeData;
              return d.highlighted ? "#3b82f6" : "#334155";
            }}
          />
        </ReactFlow>
      </div>

      <div className="flex-shrink-0 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-300">시간 슬라이더</span>
          <span className="text-xs text-blue-400 font-medium">{dayLabel}</span>
        </div>
        <input
          type="range"
          min={0}
          max={maxDay}
          value={currentDay}
          onChange={(e) => setCurrentDay(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-slate-700 accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-500">시작</span>
          <span className="text-[10px] text-slate-500">{maxDay}일차</span>
        </div>
      </div>
    </div>
  );
}
