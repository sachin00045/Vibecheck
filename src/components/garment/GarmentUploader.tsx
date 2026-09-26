import { useRef, useState, useCallback } from 'react';
import { Upload, Sparkles, RefreshCw, Shirt } from 'lucide-react';
import { GarmentProcessor } from '@/components/garment/GarmentProcessor';
import type { ProcessedGarment } from '@/types';

interface GarmentUploaderProps {
  onGarmentReady: (garment: ProcessedGarment) => void;
  currentGarment: ProcessedGarment | null;
}

export function GarmentUploader({ onGarmentReady, currentGarment }: GarmentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setProcessing(true);
    setMethod(null);
    try {
      const result = await GarmentProcessor.processFile(file);
      onGarmentReady(result.garment);
      setMethod(result.method);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown';
      if (msg === 'unsupported') {
        setError('Please upload PNG, JPG, JPEG, or WEBP.');
      } else {
        setError("Couldn't isolate the garment. Try a clearer clothing image.");
      }
    } finally {
      setProcessing(false);
    }
  }, [onGarmentReady]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleUseAsIs = useCallback(async () => {
    if (!fileInputRef.current?.files?.[0]) return;
    const file = fileInputRef.current.files[0];
    setError(null);
    setProcessing(true);
    try {
      const { loadImageFromFile, imageToCanvas } = await import('@/utils/imageProcessing');
      const img = await loadImageFromFile(file);
      const canvas = imageToCanvas(img);
      const result = GarmentProcessor.processAsIs(canvas);
      onGarmentReady(result.garment);
      setMethod(result.method);
    } catch {
      setError("Couldn't process the image. Try another one.");
    } finally {
      setProcessing(false);
    }
  }, [onGarmentReady]);

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={processing}
        className="group relative w-full flex items-center justify-center gap-2.5 px-4 py-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-white font-medium text-sm hover:from-cyan-500/30 hover:to-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-50 backdrop-blur-sm overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        {processing ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Processing garment...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 text-cyan-400" />
            {currentGarment ? 'Replace Shirt' : '+ Upload Your Shirt'}
          </>
        )}
      </button>

      {error && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-amber-400/90 px-1">{error}</p>
          <button
            onClick={handleUseAsIs}
            className="text-xs text-white/60 underline hover:text-white/80 transition-colors"
          >
            Use image as-is
          </button>
        </div>
      )}

      {method === 'bg-removal' && !error && (
        <p className="text-xs text-emerald-400/70 px-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Background removed automatically
        </p>
      )}

      {method === 'auto-alpha' && !error && (
        <p className="text-xs text-emerald-400/70 px-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Transparency detected
        </p>
      )}
    </div>
  );
}
