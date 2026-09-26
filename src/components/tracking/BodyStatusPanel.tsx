import type { BodyStatus, ManualAdjustments } from '@/types';
import { Activity, AlertCircle, CheckCircle2, Eye } from 'lucide-react';

interface BodyStatusPanelProps {
  status: BodyStatus;
  garmentLoaded: boolean;
  fps: number;
  showDebug: boolean;
  rotationDeg: number;
}

export function BodyStatusPanel({
  status,
  garmentLoaded,
  fps,
  showDebug,
  rotationDeg,
}: BodyStatusPanelProps) {
  const statusConfig = {
    detected: {
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15',
      dot: 'bg-emerald-400',
      label: 'Body detected',
      icon: CheckCircle2,
    },
    partial: {
      color: 'text-amber-400',
      bg: 'bg-amber-500/15',
      dot: 'bg-amber-400',
      label: 'Move into view',
      icon: AlertCircle,
    },
    none: {
      color: 'text-red-400',
      bg: 'bg-red-500/15',
      dot: 'bg-red-400',
      label: 'Body not detected',
      icon: AlertCircle,
    },
  } as const;

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="absolute top-3 left-3 flex flex-col gap-2 z-20 pointer-events-none">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} backdrop-blur-md border border-white/10`}>
        <span className={`relative flex h-2 w-2`}>
          <span className={`absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-60 animate-ping`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
        </span>
        <span className={`text-xs font-medium ${config.color} flex items-center gap-1.5`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {config.label}
        </span>
      </div>

      {garmentLoaded && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 backdrop-blur-md border border-white/10">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Garment tracking
          </span>
        </div>
      )}

      {showDebug && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-400">{fps} FPS</span>
          <span className="text-xs font-mono text-white/40">|</span>
          <span className="text-xs font-mono text-white/60">{rotationDeg.toFixed(0)}°</span>
        </div>
      )}
    </div>
  );
}
