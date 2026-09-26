import { useRef, useState, useCallback } from 'react';
import { Camera as CameraIcon, Download, RefreshCw, X } from 'lucide-react';

interface SnapshotButtonProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function SnapshotButton({ canvasRef, videoRef }: SnapshotButtonProps) {
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const takeSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const w = video.videoWidth || canvas.width;
    const h = video.videoHeight || canvas.height;

    const snap = document.createElement('canvas');
    snap.width = w;
    snap.height = h;
    const ctx = snap.getContext('2d')!;

    if (video.videoWidth > 0) {
      ctx.save();
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, w, h);
      ctx.restore();
    }

    ctx.drawImage(canvas, 0, 0, w, h);

    const url = snap.toDataURL('image/png');
    setSnapshot(url);
    setShow(true);
  }, [canvasRef, videoRef]);

  const download = useCallback(() => {
    if (!snapshot) return;
    const a = document.createElement('a');
    a.href = snapshot;
    a.download = `vibecheck-${Date.now()}.png`;
    a.click();
  }, [snapshot]);

  const retake = useCallback(() => {
    setSnapshot(null);
    setShow(false);
  }, []);

  return (
    <>
      <button
        onClick={takeSnapshot}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-all active:scale-95 backdrop-blur-sm border border-white/10"
      >
        <CameraIcon className="w-4 h-4" />
        Take Snapshot
      </button>

      {show && snapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4">
          <div className="relative max-w-3xl w-full">
            <button
              onClick={() => { setShow(false); setSnapshot(null); }}
              className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={snapshot} alt="Snapshot" className="w-full rounded-2xl border border-white/10" />
            <div className="flex gap-3 mt-4 justify-center">
              <button
                onClick={download}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-medium text-sm hover:bg-white/90 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={retake}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-all active:scale-95 backdrop-blur-sm border border-white/10"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
