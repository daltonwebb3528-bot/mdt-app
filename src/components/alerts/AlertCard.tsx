"use client";

import type { Alert } from "@/lib/types";

const priorityColors: Record<number, string> = {
  0: "border-l-mdt-critical bg-mdt-critical/20",
  1: "border-l-mdt-critical bg-mdt-critical/10",
  2: "border-l-mdt-high bg-mdt-high/10",
  3: "border-l-mdt-medium bg-mdt-medium/10",
  4: "border-l-mdt-low bg-mdt-low/10",
};

const priorityBadgeColors: Record<number, string> = {
  0: "bg-mdt-critical text-white",
  1: "bg-mdt-critical text-white",
  2: "bg-mdt-high text-black",
  3: "bg-mdt-medium text-black",
  4: "bg-mdt-low text-black",
};

// Generate consistent viewer stats based on alert ID
function getViewerStats(alertId: string) {
  const seed = alertId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const totalViewers = 1 + Math.floor(((seed * 9301 + 49297) % 233280) / 233280 * 15);
  const pinnedCount = Math.floor(totalViewers * 0.4);
  return { totalViewers, pinnedCount };
}

interface AlertCardProps {
  alert: Alert;
  onClick: () => void;
  isSelected: boolean;
}

export function AlertCard({ alert, onClick, isSelected }: AlertCardProps) {
  const timeAgo = getTimeAgo(new Date(alert.createdAt));
  const { totalViewers, pinnedCount } = getViewerStats(alert.id);
  const isHighProfile = totalViewers >= 8;
  const showPriority = alert.type === "CAD";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-l-4 rounded-r-xl mb-3 transition-all hover:brightness-125 active:scale-[0.98] ${
        showPriority ? (priorityColors[alert.priority] || priorityColors[4]) : "border-l-mdt-info bg-mdt-info/10"
      } ${isSelected ? "ring-2 ring-mdt-info" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {showPriority && (
            <span className={`px-2 py-1 text-sm font-bold rounded ${priorityBadgeColors[alert.priority] || priorityBadgeColors[4]}`}>
              P{alert.priority}
            </span>
          )}
          <span className="font-bold text-base truncate">{alert.title}</span>
        </div>
        <span className="text-sm text-mdt-muted flex-shrink-0">{timeAgo}</span>
      </div>
      <p className="text-sm text-mdt-muted mt-2 truncate">{alert.summary}</p>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <span className="text-sm px-3 py-1 bg-mdt-border rounded-lg font-semibold">{alert.type}</span>
          {alert.type === "LPR" && (
            <span className="text-sm font-mono font-bold text-mdt-info">
              {(alert.rawData as { plate?: string }).plate}
            </span>
          )}
          {alert.type === "AUDIO" && (
            <span className="text-sm font-semibold text-mdt-muted">
              {(alert.rawData as { subtype?: string }).subtype}
            </span>
          )}
          {alert.type === "PERSON" && (
            <span className="text-sm font-semibold text-mdt-info">
              {(alert.rawData as { name?: string }).name}
            </span>
          )}
        </div>
        
        {/* Viewer stats */}
        <div className={`flex items-center gap-2 px-2 py-1 rounded ${isHighProfile ? "bg-mdt-info/20" : "bg-mdt-border/50"}`}>
          <div className="flex items-center gap-1" title="Watching">
            <span className="text-xs">👁️</span>
            <span className={`text-xs font-semibold ${isHighProfile ? "text-mdt-info" : "text-mdt-muted"}`}>
              {totalViewers}
            </span>
          </div>
          {pinnedCount > 0 && (
            <div className="flex items-center gap-1" title="Pinned">
              <span className="text-xs">📌</span>
              <span className="text-xs font-semibold text-mdt-muted">{pinnedCount}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
