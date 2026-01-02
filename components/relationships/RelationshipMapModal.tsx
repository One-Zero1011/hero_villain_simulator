
import React, { useMemo, useState } from 'react';
import { Character, Status } from '../../types/index';
import { getRelColor } from '../../data/relationshipColors';
import { X, Network, Info } from 'lucide-react';

interface Props {
  characters: Character[];
  isOpen: boolean;
  onClose: () => void;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  angle: number;
  character: Character;
}

interface LinkData {
  sourceId: string;
  targetId: string;
  type: string;
  isMutual: boolean;
  color: string;
  sourcePos: NodePosition;
  targetPos: NodePosition;
}

const RelationshipMapModal: React.FC<Props> = ({ characters, isOpen, onClose }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Constants for layout
  const CENTER_X = 500;
  const CENTER_Y = 400; // Shifted up slightly to fit modal
  const RADIUS = 250;
  const NODE_SIZE = 60;

  // 1. Calculate Node Positions (Circle Layout)
  const nodes: NodePosition[] = useMemo(() => {
    const activeChars = characters; // Show all to see history, or filter if needed
    const count = activeChars.length;
    const angleStep = (2 * Math.PI) / count;

    return activeChars.map((char, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      return {
        id: char.id,
        x: CENTER_X + RADIUS * Math.cos(angle),
        y: CENTER_Y + RADIUS * Math.sin(angle),
        angle,
        character: char
      };
    });
  }, [characters]);

  // 2. Generate Links
  const links: LinkData[] = useMemo(() => {
    const linkList: LinkData[] = [];
    
    nodes.forEach(sourceNode => {
      sourceNode.character.relationships.forEach(rel => {
        const targetNode = nodes.find(n => n.id === rel.targetId);
        if (!targetNode) return;

        // Determine if we already have the reverse link (to avoid duplicates visually if mutual)
        // For visualization, simple directed lines are often clearer unless perfectly mutual.
        // We will draw all defined relationships.
        
        linkList.push({
          sourceId: sourceNode.id,
          targetId: targetNode.id,
          type: rel.type,
          isMutual: rel.isMutual || false,
          color: getRelColor(rel.type),
          sourcePos: sourceNode,
          targetPos: targetNode
        });
      });
    });
    return linkList;
  }, [nodes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-6xl h-[90vh] bg-[#1a1a1a] rounded-2xl border border-[#333] shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 pointer-events-none">
          <div className="bg-[#1a1a1a]/80 backdrop-blur px-4 py-2 rounded-full border border-[#333] pointer-events-auto flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-gray-200">인물 관계도</span>
            <span className="text-xs text-gray-500 border-l border-[#404040] pl-2 ml-1">
              {nodes.length}명 / {links.length}개 관계
            </span>
          </div>
          <button onClick={onClose} className="p-2 bg-[#1a1a1a]/80 backdrop-blur rounded-full text-gray-400 hover:text-white border border-[#333] pointer-events-auto transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 z-20 bg-[#1a1a1a]/90 border border-[#333] p-3 rounded-xl pointer-events-auto">
          <div className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-wider flex items-center gap-1">
            <Info className="w-3 h-3" /> 범례
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-gray-300">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> 가족/혈연</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> 동료/우호</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> 적대/라이벌</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500"></div> 연인/애정</div>
          </div>
        </div>

        {/* SVG Graph Layer */}
        <div className="flex-1 w-full h-full relative overflow-auto cursor-grab active:cursor-grabbing">
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 1000 800`} 
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              {/* Arrow Marker */}
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="28" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#666" />
              </marker>
            </defs>

            {/* Links */}
            {links.map((link, idx) => {
              const isFaded = hoveredNode && (link.sourceId !== hoveredNode && link.targetId !== hoveredNode);
              const isHighligted = hoveredNode && (link.sourceId === hoveredNode || link.targetId === hoveredNode);
              
              return (
                <g key={`${link.sourceId}-${link.targetId}-${idx}`} className={`transition-opacity duration-300 ${isFaded ? 'opacity-10' : 'opacity-100'}`}>
                  {/* Visual Line */}
                  <line 
                    x1={link.sourcePos.x} 
                    y1={link.sourcePos.y} 
                    x2={link.targetPos.x} 
                    y2={link.targetPos.y} 
                    stroke={link.color} 
                    strokeWidth={isHighligted ? 2.5 : 1}
                    strokeOpacity={0.6}
                  />
                  
                  {/* Relationship Label (Midpoint) */}
                  <g transform={`translate(${(link.sourcePos.x + link.targetPos.x) / 2}, ${(link.sourcePos.y + link.targetPos.y) / 2})`}>
                     <rect x="-20" y="-8" width="40" height="16" rx="4" fill="#1a1a1a" fillOpacity="0.8" />
                     <text 
                      textAnchor="middle" 
                      dy="3" 
                      fill={link.color} 
                      fontSize="9" 
                      fontWeight="bold"
                     >
                       {link.type}
                     </text>
                  </g>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isDead = node.character.status === Status.DEAD;
              const isHovered = hoveredNode === node.id;
              const isDimmed = hoveredNode && hoveredNode !== node.id;
              
              // Role Colors for border
              let borderColor = '#9ca3af'; // gray
              if (node.character.role === 'HERO') borderColor = '#3b82f6';
              if (node.character.role === 'VILLAIN') borderColor = '#ef4444';
              if (node.character.role === 'CIVILIAN') borderColor = '#10b981';

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer transition-all duration-300"
                  style={{ opacity: isDimmed ? 0.3 : 1 }}
                >
                  {/* Glow Effect on Hover */}
                  <circle 
                    r={NODE_SIZE / 2 + 4} 
                    fill={borderColor} 
                    opacity={isHovered ? 0.4 : 0} 
                    className="transition-all duration-300"
                    filter="url(#glow)"
                  />

                  {/* Avatar Circle */}
                  <foreignObject x={-NODE_SIZE/2} y={-NODE_SIZE/2} width={NODE_SIZE} height={NODE_SIZE}>
                    <div className={`w-full h-full rounded-full border-2 overflow-hidden bg-[#2a2a2a] transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} style={{ borderColor }}>
                       <img 
                        src={node.character.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${node.character.id}`} 
                        className={`w-full h-full object-cover ${isDead ? 'grayscale opacity-50' : ''}`}
                        alt={node.character.name}
                      />
                    </div>
                  </foreignObject>

                  {/* Name Label */}
                  <g transform={`translate(0, ${NODE_SIZE/2 + 15})`}>
                    <rect x="-40" y="-12" width="80" height="20" rx="4" fill="black" fillOpacity="0.6" />
                    <text 
                      textAnchor="middle" 
                      fill="white" 
                      fontSize="11" 
                      dy="2"
                      fontWeight="bold"
                    >
                      {node.character.name}
                    </text>
                    {isDead && (
                      <text textAnchor="middle" dy="14" fill="#ef4444" fontSize="9" fontWeight="bold">DEAD</text>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default RelationshipMapModal;
