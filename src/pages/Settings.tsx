import { useState } from 'react';
import { ArrowLeft, Activity, Eye, Shield, Info } from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [debugMode, setDebugMode] = useState(() => {
    try { return localStorage.getItem('vc_debug') === '1'; } catch { return false; }
  });

  const toggleDebug = () => {
    const newVal = !debugMode;
    setDebugMode(newVal);
    try { localStorage.setItem('vc_debug', newVal ? '1' : '0'); } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5 bg-black/30 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <span className="font-semibold tracking-tight">Settings</span>
        <div className="w-16" />
      </header>

      <div className="max-w-2xl mx-auto p-6 flex flex-col gap-4">
        <div className="rounded-2xl bg-white/5 border border-white/8 p-5">
          <div className="flex items-start gap-3 mb-4">
            <Activity className="w-5 h-5 text-cyan-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Debug Mode</h3>
              <p className="text-xs text-white/40 mt-0.5">Show FPS counter and rotation angle during try-on.</p>
            </div>
          </div>
          <button
            onClick={toggleDebug}
            className={`relative w-12 h-6 rounded-full transition-colors ${debugMode ? 'bg-cyan-500' : 'bg-white/10'}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${debugMode ? 'translate-x-6' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/8 p-5">
          <div className="flex items-start gap-3 mb-2">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Privacy</h3>
              <p className="text-xs text-white/40 mt-0.5">How your data is handled.</p>
            </div>
          </div>
          <p className="text-sm text-white/50 leading-relaxed mt-3">
            Your camera feed is processed locally in your browser whenever possible.
            No continuous webcam footage is uploaded or stored.
            Only snapshots you explicitly take are saved to your device.
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/8 p-5">
          <div className="flex items-start gap-3 mb-2">
            <Info className="w-5 h-5 text-teal-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Technology</h3>
              <p className="text-xs text-white/40 mt-0.5">What powers VibeCheck.</p>
            </div>
          </div>
          <ul className="text-sm text-white/50 leading-relaxed mt-3 space-y-1">
            <li>MediaPipe Pose Landmarker for body tracking</li>
            <li>MediaPipe Selfie Segmenter for person segmentation</li>
            <li>Deformable 2D garment mesh with real-time rendering</li>
            <li>Canvas 2D with requestAnimationFrame</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
