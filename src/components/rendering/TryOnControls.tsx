import type { ManualAdjustments } from '@/types';
import {
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RotateCw,
  Sparkles,
  Undo2,
} from 'lucide-react';

interface TryOnControlsProps {
  adjustments: ManualAdjustments;
  onChange: (adjustments: ManualAdjustments) => void;
  onAutoFit: () => void;
  onReset: () => void;
  autoFit: boolean;
}

const BTN = 'flex items-center justify-center w-10 h-10 rounded-xl bg-white/8 text-white/80 hover:bg-white/15 hover:text-white transition-all active:scale-90 backdrop-blur-sm border border-white/5';
const BTN_PRIMARY = 'flex items-center justify-center gap-1.5 px-3 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30 transition-all active:scale-95 text-xs font-medium backdrop-blur-sm';

export function TryOnControls({ adjustments, onChange, onAutoFit, onReset, autoFit }: TryOnControlsProps) {
  const update = (patch: Partial<ManualAdjustments>) => {
    onChange({ ...adjustments, ...patch });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onAutoFit}
          className={`${BTN_PRIMARY} ${autoFit ? 'ring-1 ring-cyan-400/50' : ''} flex-1`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Auto Fit
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 px-3 h-10 rounded-xl bg-white/8 text-white/70 hover:bg-white/15 hover:text-white transition-all active:scale-95 text-xs font-medium border border-white/5 backdrop-blur-sm"
        >
          <Undo2 className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Size</span>
          <div className="flex gap-2">
            <button className={BTN} onClick={() => update({ scale: adjustments.scale + 0.05 })}>
              <ZoomIn className="w-4 h-4" />
            </button>
            <button className={BTN} onClick={() => update({ scale: Math.max(0.3, adjustments.scale - 0.05) })}>
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Rotate</span>
          <div className="flex gap-2">
            <button className={BTN} onClick={() => update({ rotation: adjustments.rotation - 0.05 })}>
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className={BTN} onClick={() => update({ rotation: adjustments.rotation + 0.05 })}>
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Vertical</span>
          <div className="flex gap-2">
            <button className={BTN} onClick={() => update({ offsetY: adjustments.offsetY - 10 })}>
              <ArrowUp className="w-4 h-4" />
            </button>
            <button className={BTN} onClick={() => update({ offsetY: adjustments.offsetY + 10 })}>
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Horizontal</span>
          <div className="flex gap-2">
            <button className={BTN} onClick={() => update({ offsetX: adjustments.offsetX - 10 })}>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className={BTN} onClick={() => update({ offsetX: adjustments.offsetX + 10 })}>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
