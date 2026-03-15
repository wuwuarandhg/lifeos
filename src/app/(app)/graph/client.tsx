'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Network, Filter, ZoomIn, ZoomOut, Maximize2, X, Tag,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { GraphNode, GraphEdge, ItemType } from '@/lib/types';

// ----------------------------------------------------------
// Type colors matching graph-helpers.ts
// ----------------------------------------------------------
const TYPE_COLORS: Record<string, string> = {
  task: '#3b82f6',
  habit: '#8b5cf6',
  journal: '#f59e0b',
  note: '#10b981',
  idea: '#eab308',
  project: '#6366f1',
  goal: '#ef4444',
  metric: '#06b6d4',
  entity: '#ec4899',
  event: '#f97316',
  review: '#14b8a6',
  inbox: '#6b7280',
};

const TYPE_LABELS: Record<string, string> = {
  task: 'Tasks', habit: 'Habits', journal: 'Journal', note: 'Notes',
  idea: 'Ideas', project: 'Projects', goal: 'Goals', metric: 'Metrics',
  entity: 'Entities', event: 'Events', review: 'Reviews',
};

const EDGE_TYPE_STYLES: Record<string, { color: string; dash?: string }> = {
  relation: { color: 'var(--color-text-tertiary)' },
  structural: { color: 'var(--color-brand-400)', dash: '4 2' },
  tag: { color: 'var(--color-text-muted)', dash: '2 4' },
};

const NODE_RADIUS = 18;
const CANVAS_SIZE = 1000;

// ----------------------------------------------------------
// Props
// ----------------------------------------------------------
interface Props {
  initialNodes: GraphNode[];
  initialEdges: GraphEdge[];
  availableTags: { id: string; name: string; color: string | null }[];
}

export function GraphClient({ initialNodes, initialEdges, availableTags }: Props) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [nodes] = useState(initialNodes);
  const [edges] = useState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(() => {
    const types = new Set<string>();
    for (const n of initialNodes) types.add(n.type);
    return types;
  });

  // Pan / Zoom state
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: CANVAS_SIZE, h: CANVAS_SIZE });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Filtered data
  const filteredNodes = useMemo(
    () => nodes.filter(n => enabledTypes.has(n.type)),
    [nodes, enabledTypes]
  );
  const filteredNodeIds = useMemo(
    () => new Set(filteredNodes.map(n => n.id)),
    [filteredNodes]
  );
  const filteredEdges = useMemo(
    () => edges.filter(e => filteredNodeIds.has(e.sourceId) && filteredNodeIds.has(e.targetId)),
    [edges, filteredNodeIds]
  );

  // Selected node info
  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;
  const hoveredNode = hoveredNodeId ? nodes.find(n => n.id === hoveredNodeId) : null;

  // Neighbor highlight
  const neighborIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const ids = new Set<string>();
    for (const e of filteredEdges) {
      if (e.sourceId === selectedNodeId) ids.add(e.targetId);
      if (e.targetId === selectedNodeId) ids.add(e.sourceId);
    }
    ids.add(selectedNodeId);
    return ids;
  }, [selectedNodeId, filteredEdges]);

  // Node positions map for edge drawing
  const nodeMap = useMemo(() => {
    const m = new Map<string, GraphNode>();
    for (const n of filteredNodes) m.set(n.id, n);
    return m;
  }, [filteredNodes]);

  // ----------------------------------------------------------
  // Interaction handlers
  // ----------------------------------------------------------
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(prev => prev === nodeId ? null : nodeId);
  }, []);

  const handleNodeDoubleClick = useCallback((node: GraphNode) => {
    router.push(node.detailUrl);
  }, [router]);

  const handleZoom = useCallback((factor: number) => {
    setViewBox(prev => {
      const newW = Math.max(200, Math.min(2000, prev.w * factor));
      const newH = Math.max(200, Math.min(2000, prev.h * factor));
      const dx = (prev.w - newW) / 2;
      const dy = (prev.h - newH) / 2;
      return { x: prev.x + dx, y: prev.y + dy, w: newW, h: newH };
    });
  }, []);

  const handleReset = useCallback(() => {
    setViewBox({ x: 0, y: 0, w: CANVAS_SIZE, h: CANVAS_SIZE });
    setSelectedNodeId(null);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    handleZoom(factor);
  }, [handleZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as Element).tagName === 'line' || (e.target as Element).tagName === 'rect') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = (e.clientX - panStart.x) * (viewBox.w / (containerRef.current?.clientWidth ?? 800));
    const dy = (e.clientY - panStart.y) * (viewBox.h / (containerRef.current?.clientHeight ?? 600));
    setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
    setPanStart({ x: e.clientX, y: e.clientY });
  }, [isPanning, panStart, viewBox.w, viewBox.h]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  // Toggle type filter
  const toggleType = useCallback((type: string) => {
    setEnabledTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  // Count by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of nodes) {
      counts[n.type] = (counts[n.type] ?? 0) + 1;
    }
    return counts;
  }, [nodes]);

  // Available types (only types that have nodes)
  const availableTypes = useMemo(
    () => Object.keys(typeCounts).sort(),
    [typeCounts]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-3">
        <div className="flex items-center gap-3">
          <Network size={20} className="text-brand-500" />
          <h1 className="text-lg font-semibold text-text-primary">Graph Explorer</h1>
          <span className="text-2xs text-text-muted">
            {filteredNodes.length} nodes · {filteredEdges.length} edges
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
              showFilters
                ? 'bg-brand-100 text-brand-700'
                : 'text-text-muted hover:bg-surface-2'
            )}
          >
            <Filter size={14} />
            Filters
          </button>
          <button onClick={() => handleZoom(0.8)} className="p-1.5 rounded-md text-text-muted hover:bg-surface-2 transition-colors" title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <button onClick={() => handleZoom(1.25)} className="p-1.5 rounded-md text-text-muted hover:bg-surface-2 transition-colors" title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <button onClick={handleReset} className="p-1.5 rounded-md text-text-muted hover:bg-surface-2 transition-colors" title="Reset View">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Filter Panel */}
        {showFilters && (
          <div className="w-56 border-r border-surface-3 p-4 overflow-y-auto flex-shrink-0 space-y-4">
            {/* Type filters */}
            <div>
              <h3 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">Node Types</h3>
              <div className="space-y-1">
                {availableTypes.map(type => (
                  <label key={type} className="flex items-center gap-2 py-1 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={enabledTypes.has(type)}
                      onChange={() => toggleType(type)}
                      className="rounded border-surface-3 text-brand-500 focus:ring-brand-500"
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: TYPE_COLORS[type] ?? '#6b7280' }}
                    />
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors flex-1">
                      {TYPE_LABELS[type] ?? type}
                    </span>
                    <span className="text-2xs text-text-muted">{typeCounts[type] ?? 0}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div>
              <h3 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">Edge Types</h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-2xs text-text-muted">
                  <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="var(--color-text-tertiary)" strokeWidth="1.5" /></svg>
                  Explicit relation
                </div>
                <div className="flex items-center gap-2 text-2xs text-text-muted">
                  <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="var(--color-brand-400)" strokeWidth="1.5" strokeDasharray="4 2" /></svg>
                  Structural (FK)
                </div>
                <div className="flex items-center gap-2 text-2xs text-text-muted">
                  <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeDasharray="2 4" /></svg>
                  Shared tag
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <h3 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">Quick</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setEnabledTypes(new Set(availableTypes))}
                  className="text-2xs text-brand-500 hover:text-brand-600 transition-colors"
                >
                  Show all
                </button>
                <span className="text-2xs text-text-muted mx-1">·</span>
                <button
                  onClick={() => setEnabledTypes(new Set(['project', 'goal', 'note', 'idea']))}
                  className="text-2xs text-brand-500 hover:text-brand-600 transition-colors"
                >
                  Plan only
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Graph Canvas */}
        <div
          ref={containerRef}
          className="flex-1 relative bg-surface-1 overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {filteredNodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Network size={32} className="mx-auto text-text-muted mb-2" />
                <p className="text-sm text-text-muted">No connected items to display.</p>
                <p className="text-2xs text-text-muted mt-1">
                  Create relations between items to see the graph.
                </p>
              </div>
            </div>
          ) : (
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
              onWheel={handleWheel}
              className="select-none"
            >
              {/* Background */}
              <rect
                x={viewBox.x} y={viewBox.y}
                width={viewBox.w} height={viewBox.h}
                fill="transparent"
              />

              {/* Edges */}
              <g className="edges">
                {filteredEdges.map(edge => {
                  const source = nodeMap.get(edge.sourceId);
                  const target = nodeMap.get(edge.targetId);
                  if (!source || !target) return null;

                  const style = EDGE_TYPE_STYLES[edge.edgeType] ?? EDGE_TYPE_STYLES.relation;
                  const isHighlighted = selectedNodeId && (
                    edge.sourceId === selectedNodeId || edge.targetId === selectedNodeId
                  );
                  const isDimmed = selectedNodeId && !isHighlighted;

                  return (
                    <line
                      key={edge.id}
                      x1={source.x} y1={source.y}
                      x2={target.x} y2={target.y}
                      stroke={style.color}
                      strokeWidth={isHighlighted ? 2 : 1}
                      strokeDasharray={style.dash}
                      opacity={isDimmed ? 0.15 : isHighlighted ? 1 : 0.4}
                      className="transition-opacity duration-200"
                    />
                  );
                })}
              </g>

              {/* Nodes */}
              <g className="nodes">
                {filteredNodes.map(node => {
                  const color = TYPE_COLORS[node.type] ?? '#6b7280';
                  const isSelected = node.id === selectedNodeId;
                  const isNeighbor = neighborIds.has(node.id);
                  const isDimmed = selectedNodeId && !isNeighbor;
                  const isHovered = node.id === hoveredNodeId;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={(e) => { e.stopPropagation(); handleNodeClick(node.id); }}
                      onDoubleClick={(e) => { e.stopPropagation(); handleNodeDoubleClick(node); }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className="cursor-pointer"
                      style={{ opacity: isDimmed ? 0.2 : 1, transition: 'opacity 200ms' }}
                    >
                      {/* Selection ring */}
                      {isSelected && (
                        <circle
                          r={NODE_RADIUS + 5}
                          fill="none"
                          stroke={color}
                          strokeWidth={2}
                          opacity={0.5}
                        />
                      )}
                      {/* Node circle */}
                      <circle
                        r={isSelected ? NODE_RADIUS + 2 : NODE_RADIUS}
                        fill={color}
                        opacity={0.85}
                        stroke={isHovered ? '#fff' : 'none'}
                        strokeWidth={isHovered ? 2 : 0}
                      />
                      {/* Label */}
                      <text
                        y={NODE_RADIUS + 14}
                        textAnchor="middle"
                        fontSize="11"
                        fill="var(--color-text-secondary)"
                        className="pointer-events-none select-none"
                        style={{ fontFamily: 'var(--font-sans, system-ui)' }}
                      >
                        {node.title.length > 20 ? node.title.slice(0, 18) + '…' : node.title}
                      </text>
                      {/* Type initial inside circle */}
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="12"
                        fontWeight="600"
                        fill="#fff"
                        className="pointer-events-none select-none"
                      >
                        {node.type.charAt(0).toUpperCase()}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          )}

          {/* Hover Tooltip */}
          {hoveredNode && !selectedNode && (
            <div className="absolute top-4 right-4 card p-3 max-w-xs pointer-events-none shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: TYPE_COLORS[hoveredNode.type] }}
                />
                <span className="text-2xs font-medium text-text-muted uppercase">
                  {TYPE_LABELS[hoveredNode.type] ?? hoveredNode.type}
                </span>
              </div>
              <p className="text-sm font-medium text-text-primary">{hoveredNode.title}</p>
              {hoveredNode.subtitle && (
                <p className="text-2xs text-text-muted mt-0.5">{hoveredNode.subtitle}</p>
              )}
              {hoveredNode.date && (
                <p className="text-2xs text-text-muted">{hoveredNode.date}</p>
              )}
            </div>
          )}

          {/* Selected Node Panel */}
          {selectedNode && (
            <div className="absolute top-4 right-4 card p-4 w-72 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: TYPE_COLORS[selectedNode.type] }}
                  />
                  <span className="text-2xs font-medium text-text-muted uppercase">
                    {TYPE_LABELS[selectedNode.type] ?? selectedNode.type}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <h3 className="text-sm font-semibold text-text-primary mb-1">
                {selectedNode.title}
              </h3>

              {selectedNode.subtitle && (
                <p className="text-2xs text-text-muted mb-1">{selectedNode.subtitle}</p>
              )}
              {selectedNode.status && (
                <span className="inline-block text-2xs px-1.5 py-0.5 rounded bg-surface-2 text-text-secondary mb-1">
                  {selectedNode.status}
                </span>
              )}
              {selectedNode.date && (
                <p className="text-2xs text-text-muted">{selectedNode.date}</p>
              )}

              {/* Connected nodes */}
              <div className="mt-3 pt-3 border-t border-surface-3">
                <p className="text-2xs text-text-muted mb-1.5">
                  {neighborIds.size - 1} connection{neighborIds.size - 1 !== 1 ? 's' : ''}
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {filteredEdges
                    .filter(e => e.sourceId === selectedNode.id || e.targetId === selectedNode.id)
                    .slice(0, 10)
                    .map(e => {
                      const otherId = e.sourceId === selectedNode.id ? e.targetId : e.sourceId;
                      const other = nodeMap.get(otherId);
                      if (!other) return null;
                      return (
                        <button
                          key={e.id}
                          onClick={() => handleNodeClick(otherId)}
                          className="flex items-center gap-2 w-full text-left py-1 px-1.5 rounded hover:bg-surface-2 transition-colors"
                        >
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: TYPE_COLORS[other.type] }}
                          />
                          <span className="text-2xs text-text-secondary truncate flex-1">{other.title}</span>
                          <span className="text-2xs text-text-muted">{e.label}</span>
                        </button>
                      );
                    })}
                </div>
              </div>

              <button
                onClick={() => router.push(selectedNode.detailUrl)}
                className="mt-3 w-full py-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors text-center"
              >
                Open Detail →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
