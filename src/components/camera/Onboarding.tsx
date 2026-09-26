import { Camera, User, Lightbulb, Maximize2, AlertTriangle } from 'lucide-react';

interface OnboardingProps {
  onStart: () => void;
  loading: boolean;
}

const TIPS = [
  { icon: Maximize2, text: 'Stand approximately 1-2 meters from the camera.' },
  { icon: User, text: 'Face the camera and keep your shoulders visible.' },
  { icon: Lightbulb, text: 'Use good lighting for best tracking results.' },
  { icon: AlertTriangle, text: 'Keep arms slightly away from your body.' },
];

export function Onboarding({ onStart, loading }: OnboardingProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="max-w-md w-full rounded-3xl bg-gray-900/80 border border-white/10 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 flex items-center justify-center mb-4 border border-cyan-400/20">
            <Camera className="w-7 h-7 text-cyan-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-1">For the best result</h2>
          <p className="text-sm text-white/50">Follow these tips for an accurate virtual try-on</p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {TIPS.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5">
                <Icon className="w-4 h-4 text-cyan-400/70 flex-shrink-0" />
                <span className="text-sm text-white/70">{tip.text}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={onStart}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Loading models...' : 'Start VibeCheck'}
        </button>
      </div>
    </div>
  );
}
