import React, { useEffect } from 'react';
import { ReactFlow, Background, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GraphLink, GraphNode, ProgramItem } from '../types';

const initialNodes: any[] = [];
const initialEdges: any[] = [];

interface NodeLinkViewProps {
  graphData: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  programs?: ProgramItem[];
  isGenerating: boolean;
}

export function NodeLinkView({ graphData, programs = [], isGenerating }: NodeLinkViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    if (isGenerating || !graphData) return;

    // Build color map from programs: id → color
    const colorMap: Record<string, string> = {};
    programs.forEach(p => { colorMap[p.id] = p.color; });

    const getFallbackColor = (group: number) => {
      const colors = ['#ff5252', '#44ff44', '#44ffff', '#b366ff', '#ffa500', '#ff88cc'];
      return colors[group % colors.length];
    };

    const validNodeIds = new Set(graphData.nodes.map(n => n.id));
    const count = graphData.nodes.length;

    const newNodes = graphData.nodes.map((node, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const radius = Math.max(70, count * 16);
      const color = colorMap[node.id] || getFallbackColor(node.group);
      return {
        id: node.id,
        position: {
          x: 150 + Math.cos(angle) * radius,
          y: 150 + Math.sin(angle) * radius,
        },
        data: { label: node.label },
        style: {
          background: color,
          color: '#000',
          border: `2px solid ${color}`,
          borderRadius: '50%',
          width: 38,
          height: 38,
          fontSize: '7px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          boxShadow: `0 0 12px ${color}60`,
          textAlign: 'center' as const,
          padding: '2px',
        },
      };
    });

    const newEdges = graphData.links
      .filter(link => validNodeIds.has(link.source) && validNodeIds.has(link.target))
      .map((link, i) => ({
        id: `e${i}`,
        source: link.source,
        target: link.target,
        animated: true,
        label: link.relation || undefined,
        labelStyle: { fill: '#ffffff80', fontSize: 7 },
        labelBgStyle: { fill: '#00000060' },
        style: {
          stroke: '#ffffff50',
          strokeWidth: Math.max(1, Math.min(link.value / 3, 4)),
        },
      }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [graphData, programs, isGenerating, setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-[#111111] relative">
      {isGenerating && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin mb-2"></div>
          <span className="text-white/70 text-[10px] uppercase tracking-widest">Updating Graph...</span>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="#ffffff" gap={16} size={1} style={{ opacity: 0.03 }} />
      </ReactFlow>
    </div>
  );
}
