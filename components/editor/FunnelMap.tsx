"use client";

import { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Handle, 
  Position, 
  Node, 
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FileText, CheckCircle, ArrowRight, MousePointerClick } from 'lucide-react';

// --- CUSTOM NODE ---
const StepNode = ({ data }: { data: any }) => {
  const isSelected = data.isActive;
  
  return (
    <div 
      className={`w-64 shadow-xl rounded-xl border-2 transition-all duration-300 bg-white dark:bg-[#1E293B] group ${isSelected ? 'border-purple-500 ring-4 ring-purple-500/20 scale-105' : 'border-slate-200 dark:border-white/10 hover:border-purple-300'}`}
      onClick={() => data.onSelect(data.stepId)}
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-300 !w-3 !h-3" />
      
      {/* Header */}
      <div className={`p-3 border-b ${isSelected ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-100' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'} rounded-t-lg flex justify-between items-center`}>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step {data.index + 1}</span>
        {isSelected && <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-white px-2 py-0.5 rounded-full shadow-sm"><MousePointerClick size={10}/> Editing</span>}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2 rounded-lg ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/10'}`}>
            <FileText size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">{data.label}</h3>
            <p className="text-[10px] text-slate-400 mt-1">/{data.slug}</p>
          </div>
        </div>

        {/* Stats (Mock for now, connect to real DB later) */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
          <div className="text-center">
            <div className="text-lg font-bold text-slate-700 dark:text-slate-300">0</div>
            <div className="text-[9px] uppercase text-slate-400">Visits</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-700 dark:text-slate-300">0%</div>
            <div className="text-[9px] uppercase text-slate-400">Conv.</div>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-purple-500 !w-3 !h-3" />
    </div>
  );
};

const nodeTypes = { stepNode: StepNode };

// --- MAIN COMPONENT ---
export default function FunnelMap({ steps, activeStepId, onSelectStep }: { steps: any[], activeStepId: string, onSelectStep: (id: string) => void }) {
  
  // 1. Convert Steps to Nodes
  const initialNodes: Node[] = useMemo(() => steps.map((step, i) => ({
    id: step.id,
    type: 'stepNode',
    position: { x: i * 350, y: 100 + (i % 2 === 0 ? 0 : 50) }, // Zig-zag layout
    data: { 
      label: step.name, 
      slug: step.slug, 
      index: i,
      isActive: step.id === activeStepId,
      stepId: step.id,
      onSelect: onSelectStep
    },
  })), [steps, activeStepId, onSelectStep]);

  // 2. Create Edges (Connect Step 1 -> 2 -> 3)
  const initialEdges: Edge[] = useMemo(() => steps.slice(0, -1).map((step, i) => ({
    id: `e-${step.id}-${steps[i+1].id}`,
    source: step.id,
    target: steps[i+1].id,
    animated: true,
    style: { stroke: '#9333ea', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#9333ea' },
  })), [steps]);

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-black/50">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background gap={20} size={1} color="#cbd5e1" />
        <Controls />
      </ReactFlow>
    </div>
  );
}