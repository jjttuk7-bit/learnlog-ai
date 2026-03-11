"use client";

import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import MindmapNode from "./node";
import MindmapEdge from "./edge";

const nodeTypes = { mindmap: MindmapNode };
const edgeTypes = { mindmap: MindmapEdge };

interface Props {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  readOnly?: boolean;
}

export function MindmapCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  readOnly = false,
}: Props) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        colorMode="dark"
        defaultEdgeOptions={{ type: "mindmap", animated: false }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#334155"
        />
        <Controls className="[&>button]:bg-slate-800 [&>button]:border-slate-600 [&>button]:text-slate-300" />
        <MiniMap
          className="!bg-slate-900 !border-slate-700"
          nodeColor={(node) => {
            const cat = (node.data as { category?: string }).category;
            if (cat === "root") return "#2563eb";
            if (cat === "main") return "#475569";
            return "#1e293b";
          }}
        />
      </ReactFlow>
    </div>
  );
}
