"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export type MindmapNodeData = {
  label: string;
  category?: "root" | "main" | "sub" | "detail";
};

const categoryStyles: Record<string, string> = {
  root: "bg-blue-600 border-blue-400 text-white font-bold text-base px-5 py-3",
  main: "bg-slate-700 border-blue-500/60 text-slate-100 font-semibold px-4 py-2",
  sub: "bg-slate-800 border-slate-600 text-slate-200 px-3 py-1.5",
  detail: "bg-slate-900 border-slate-700 text-slate-400 text-sm px-3 py-1.5",
};

function MindmapNode({ data, selected }: NodeProps) {
  const nodeData = data as MindmapNodeData;
  const category = nodeData.category ?? "sub";
  const style = categoryStyles[category] ?? categoryStyles.sub;

  return (
    <div
      className={`rounded-xl border-2 transition-all cursor-pointer select-none ${style} ${
        selected ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-slate-900" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-blue-400 !border-blue-600 !w-2 !h-2"
      />
      <span className="whitespace-nowrap">{nodeData.label}</span>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-blue-400 !border-blue-600 !w-2 !h-2"
      />
    </div>
  );
}

export default memo(MindmapNode);
