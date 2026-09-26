import { useRef, useEffect, useCallback } from 'react';
import { Camera as CameraIcon, StopCircle, SwitchCamera, Maximize, Minimize } from 'lucide-react';

interface CameraControlsProps {
  active: boolean;
  onStart: () => void;
  onStop: () => void;
  onFlip: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  canFlip: boolean;
}

export function CameraControls({
  active,
  onStart,
  onStop,
  onFlip,
  onFullscreen,
  isFullscreen,
  canFlip,
}: CameraControlsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {!active ? (
        <button
          onClick={onStart}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-medium text-sm hover:bg-white/90 transition-all active:scale-95"
        >
          <CameraIcon className="w-4 h-4" />
          Start Camera
        </button>
      ) : (
        <button
          onClick={onStop}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/90 text-white font-medium text-sm hover:bg-red-500 transition-all active:scale-95"
        >
          <StopCircle className="w-4 h-4" />
          Stop
        </button>
      )}

      {active && canFlip && (
        <button
          onClick={onFlip}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-all active:scale-95 backdrop-blur-sm"
        >
          <SwitchCamera className="w-4 h-4" />
          Flip
        </button>
      )}

      <button
        onClick={onFullscreen}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-all active:scale-95 backdrop-blur-sm"
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </button>
    </div>
  );
}
