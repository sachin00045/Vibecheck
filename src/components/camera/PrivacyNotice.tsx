import { Shield } from 'lucide-react';

export function PrivacyNotice() {
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-500/8 border border-blue-400/15 backdrop-blur-sm">
      <Shield className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
      <p className="text-[11px] text-blue-200/70 leading-relaxed">
        Your camera feed is processed locally in your browser whenever possible.
        No continuous webcam footage is uploaded or stored.
      </p>
    </div>
  );
}
