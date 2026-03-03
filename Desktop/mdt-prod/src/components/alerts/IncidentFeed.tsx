"use client";

import { useState, useEffect } from "react";

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
}

interface Viewer {
  unitId: string;
  isPinned: boolean;
}

interface IncidentFeedProps {
  alertId: string;
  initialComments?: Comment[];
  height?: string;
}

// Generate consistent fake viewers based on alert ID
function generateViewers(alertId: string): Viewer[] {
  const seed = alertId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seededRandom = (max: number, offset: number = 0) => 
    Math.floor(((seed + offset) * 9301 + 49297) % 233280 / 233280 * max);
  
  const unitPrefixes = ["A", "B", "C", "D", "E"];
  const viewerCount = 1 + seededRandom(15); // 1-15 viewers
  
  const viewers: Viewer[] = [];
  for (let i = 0; i < viewerCount; i++) {
    const prefix = unitPrefixes[seededRandom(unitPrefixes.length, i)];
    const num = 100 + seededRandom(900, i * 2);
    viewers.push({
      unitId: `${prefix}${num}`,
      isPinned: seededRandom(100, i * 3) < 40, // 40% chance pinned
    });
  }
  
  return viewers;
}

export function IncidentFeed({ alertId, initialComments = [], height = "h-36" }: IncidentFeedProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [viewers, setViewers] = useState<Viewer[]>([]);
  
  useEffect(() => {
    // Generate viewers based on alert ID
    setViewers(generateViewers(alertId));
  }, [alertId]);
  
  const addComment = () => {
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now().toString(),
        author: "4A21",
        text: newComment.trim(),
        timestamp: new Date(),
      },
    ]);
    setNewComment("");
  };
  
  const totalViewers = viewers.length;
  const pinnedCount = viewers.filter(v => v.isPinned).length;
  const displayedViewers = viewers.slice(0, 8);
  const remainingViewers = totalViewers - displayedViewers.length;
  
  return (
    <div className={`${height} border-t border-mdt-border bg-mdt-panel flex flex-col`}>
      {/* Header with viewers */}
      <div className="px-2 py-1.5 border-b border-mdt-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>💬</span>
          <span className="font-bold text-sm">Feed</span>
        </div>
        
        {/* Currently viewing */}
        <div className="flex items-center gap-2">
          {/* Unit badges */}
          <div className="flex items-center gap-1">
            {displayedViewers.map((viewer) => (
              <div
                key={viewer.unitId}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  viewer.isPinned
                    ? "bg-mdt-info/30 text-mdt-info border border-mdt-info/50"
                    : "bg-mdt-border text-mdt-text"
                }`}
                title={viewer.isPinned ? `${viewer.unitId} (pinned)` : `${viewer.unitId} (viewing)`}
              >
                {viewer.unitId}
              </div>
            ))}
            {remainingViewers > 0 && (
              <div className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-mdt-muted/20 text-mdt-muted">
                +{remainingViewers} more
              </div>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-mdt-border">
            <div className="flex items-center gap-1" title="Currently viewing">
              <span className="text-[10px]">👁️</span>
              <span className="text-[10px] text-mdt-muted font-semibold">{totalViewers}</span>
            </div>
            <div className="flex items-center gap-1" title="Pinned">
              <span className="text-[10px]">📌</span>
              <span className="text-[10px] text-mdt-info font-semibold">{pinnedCount}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comments */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {comments.map((c) => (
          <div key={c.id} className="bg-mdt-bg rounded p-1.5">
            <div className="flex justify-between">
              <span className="font-bold text-xs text-mdt-info">{c.author}</span>
              <span className="text-[10px] text-mdt-muted">
                {c.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-xs">{c.text}</p>
          </div>
        ))}
      </div>
      
      {/* Input */}
      <div className="p-1.5 border-t border-mdt-border flex gap-1">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addComment()}
          placeholder="Comment..."
          className="flex-1 px-2 py-1 bg-mdt-bg border border-mdt-border rounded text-sm"
        />
        <button
          onClick={addComment}
          className="px-3 py-1 bg-mdt-info text-mdt-bg font-bold rounded text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// Helper hook to get viewer stats for use in AlertCard
export function useViewerStats(alertId: string) {
  const viewers = generateViewers(alertId);
  return {
    totalViewers: viewers.length,
    pinnedCount: viewers.filter(v => v.isPinned).length,
  };
}
