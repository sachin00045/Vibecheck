import { useRef, useState, useEffect, useCallback } from 'react';
import { PoseTracker } from '@/components/tracking/PoseTracker';
import { PersonSegmenter } from '@/components/tracking/PersonSegmenter';
import { RealtimeMeshEngine } from '@/components/engines/RealtimeMeshEngine';
import { computeBodyGeometry, getBodyStatus, getRotationDegrees } from '@/utils/geometry';
import { LandmarkSmoother } from '@/utils/landmarkSmoother';
import { perfMonitor } from '@/utils/performance';
import { startCamera, stopCamera, flipCamera, toggleFullscreen } from '@/components/camera/cameraUtils';
import { GarmentUploader } from '@/components/garment/GarmentUploader';
import { CameraControls } from '@/components/camera/CameraControls';
import { BodyStatusPanel } from '@/components/tracking/BodyStatusPanel';
import { TryOnControls } from '@/components/rendering/TryOnControls';
import { SnapshotButton } from '@/components/rendering/SnapshotButton';
import { PrivacyNotice } from '@/components/camera/PrivacyNotice';
import { Onboarding } from '@/components/camera/Onboarding';
import type { ProcessedGarment, ManualAdjustments, BodyStatus, SegmentationData } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface TryOnPageProps {
  onBack: () => void;
}

const DEFAULT_ADJUSTMENTS: ManualAdjustments = {
  scale: 1.0,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
};

export function TryOnPage({ onBack }: TryOnPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const poseTrackerRef = useRef<PoseTracker | null>(null);
  const segmenterRef = useRef<PersonSegmenter | null>(null);
  const engineRef = useRef<RealtimeMeshEngine | null>(null);
  const smootherRef = useRef<LandmarkSmoother>(new LandmarkSmoother(0.5));

  const rafRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const lastPoseRef = useRef<{ landmarks: any[]; timestamp: number } | null>(null);
  const lastSegRef = useRef<SegmentationData | null>(null);
  const lastSegTimeRef = useRef(0);
  const lastPoseTimeRef = useRef(0);
  const loadingModelsRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isFs, setIsFs] = useState(false);
  const [garment, setGarment] = useState<ProcessedGarment | null>(null);
  const [adjustments, setAdjustments] = useState<ManualAdjustments>(DEFAULT_ADJUSTMENTS);
  const [autoFit, setAutoFit] = useState(true);
  const [bodyStatus, setBodyStatus] = useState<BodyStatus>('none');
  const [fps, setFps] = useState(0);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [showDebug] = useState(() => {
    try { return localStorage.getItem('vc_debug') === '1'; } catch { return false; }
  });

  useEffect(() => {
    poseTrackerRef.current = new PoseTracker();
    segmenterRef.current = new PersonSegmenter();
    engineRef.current = new RealtimeMeshEngine();
    engineRef.current.initialize();

    return () => {
      cancelAnimationFrame(rafRef.current);
      stopCamera(streamRef.current, videoRef.current);
      poseTrackerRef.current?.dispose();
      segmenterRef.current?.dispose();
      engineRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      rafRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const ctx = canvas.getContext('2d')!;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (vw === 0 || vh === 0) {
      rafRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width = vw;
      canvas.height = vh;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = performance.now();
    const poseTracker = poseTrackerRef.current;
    const segmenter = segmenterRef.current;

    if (poseTracker?.isReady && video.readyState >= 2) {
      if (now - lastPoseTimeRef.current > 33) {
        const poseData = poseTracker.detect(video);
        if (poseData) {
          const smoothed = smootherRef.current.smooth(poseData.landmarks);
          lastPoseRef.current = { landmarks: smoothed, timestamp: poseData.timestamp };
          lastPoseTimeRef.current = now;
          perfMonitor.recordPoseFrame();
        }
      }
    }

    if (segmenter?.isReady && video.readyState >= 2) {
      if (now - lastSegTimeRef.current > 100) {
        const segData = segmenter.segment(video);
        if (segData) {
          lastSegRef.current = segData;
          lastSegTimeRef.current = now;
        }
      }
    }

    const pose = lastPoseRef.current;
    let geometry = null;
    if (pose) {
      geometry = computeBodyGeometry(pose.landmarks, canvas.width, canvas.height);
    }

    const status = getBodyStatus(geometry);
    if (status !== bodyStatus) setBodyStatus(status);
    if (geometry) {
      const deg = getRotationDegrees(geometry);
      if (Math.abs(deg - rotationDeg) > 1) setRotationDeg(deg);
    }

    if (geometry && engineRef.current?.isReady && garment) {
      const adj = autoFit ? adjustments : adjustments;
      engineRef.current.render({
        ctx,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        garment,
        geometry,
        segmentation: lastSegRef.current,
        adjustments: adj,
        video,
      });
    }

    perfMonitor.recordFrame();
    if (showDebug && perfMonitor.fps !== fps) {
      setFps(perfMonitor.fps);
    }

    rafRef.current = requestAnimationFrame(renderLoop);
  }, [garment, adjustments, autoFit, bodyStatus, rotationDeg, fps, showDebug]);

  const startCameraAndLoop = useCallback(async () => {
    if (loadingModelsRef.current) return;
    loadingModelsRef.current = true;
    setModelsLoading(true);
    setCameraError(null);

    try {
      if (!poseTrackerRef.current?.isReady) {
        await poseTrackerRef.current?.initialize();
      }
      if (!segmenterRef.current?.isReady) {
        await segmenterRef.current?.initialize().catch(() => {});
      }
    } catch {
      setCameraError('Failed to load tracking models. Check your connection.');
      loadingModelsRef.current = false;
      setModelsLoading(false);
      return;
    }

    try {
      const stream = await startCamera(videoRef.current!, facingMode);
      streamRef.current = stream;
      setCameraActive(true);
      setShowOnboarding(false);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(renderLoop);
    } catch (e: any) {
      if (e?.name === 'NotAllowedError') {
        setCameraError('Camera permission is required for Live Try-On.');
      } else if (e?.name === 'NotFoundError') {
        setCameraError('No compatible camera was detected.');
      } else {
        setCameraError('Could not access the camera.');
      }
    } finally {
      loadingModelsRef.current = false;
      setModelsLoading(false);
    }
  }, [facingMode, renderLoop]);

  const handleStop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    stopCamera(streamRef.current, videoRef.current);
    streamRef.current = null;
    setCameraActive(false);
    setBodyStatus('none');
    smootherRef.current.reset();
  }, []);

  const handleFlip = useCallback(async () => {
    try {
      const result = await flipCamera(videoRef.current!, streamRef.current, facingMode);
      streamRef.current = result.stream;
      setFacingMode(result.facingMode);
    } catch {
      setCameraError('Could not flip camera.');
    }
  }, [facingMode]);

  const handleFullscreen = useCallback(async () => {
    if (containerRef.current) {
      try { await toggleFullscreen(containerRef.current); } catch {}
    }
  }, []);

  const handleAutoFit = useCallback(() => {
    setAutoFit(true);
    setAdjustments(DEFAULT_ADJUSTMENTS);
  }, []);

  const handleReset = useCallback(() => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
  }, []);

  const handleGarmentReady = useCallback((g: ProcessedGarment) => {
    setGarment(g);
    engineRef.current?.initialize();
  }, []);

  const canFlip = typeof navigator !== 'undefined' && navigator.mediaDevices?.getSupportedConstraints?.()?.facingMode !== undefined;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5 bg-black/30 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">V</span>
          </div>
          <span className="font-semibold tracking-tight">VibeCheck</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 sm:p-6 max-w-[1600px] mx-auto w-full">
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div
            ref={containerRef}
            className="relative flex-1 rounded-3xl overflow-hidden bg-black border border-white/8 min-h-[400px] lg:min-h-[500px]"
          >
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''} pointer-events-none`}
            />

            <BodyStatusPanel
              status={bodyStatus}
              garmentLoaded={!!garment}
              fps={fps}
              showDebug={showDebug}
              rotationDeg={rotationDeg}
            />

            {bodyStatus === 'partial' && cameraActive && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/20 text-amber-200 text-xs font-medium z-20">
                Make sure your upper body is clearly visible.
              </div>
            )}

            {bodyStatus === 'none' && cameraActive && !showOnboarding && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-red-500/20 backdrop-blur-md border border-red-400/20 text-red-200 text-xs font-medium z-20">
                Move into the camera frame.
              </div>
            )}

            {Math.abs(rotationDeg) > 30 && cameraActive && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/20 text-blue-200 text-xs font-medium z-20">
                Turn slightly toward the camera for a better fit.
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center p-6 z-30">
                <div className="max-w-sm text-center">
                  <p className="text-sm text-red-300 mb-2">{cameraError}</p>
                  <button
                    onClick={() => { setCameraError(null); setShowOnboarding(true); }}
                    className="text-xs text-white/60 underline hover:text-white/80"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {showOnboarding && !cameraActive && (
              <Onboarding onStart={startCameraAndLoop} loading={modelsLoading} />
            )}

            {!cameraActive && !showOnboarding && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <button
                  onClick={startCameraAndLoop}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-95"
                >
                  <Loader2 className="w-4 h-4" />
                  Start Camera
                </button>
              </div>
            )}

            {cameraActive && (
              <div className="absolute bottom-3 left-3 z-20">
                <CameraControls
                  active={cameraActive}
                  onStart={startCameraAndLoop}
                  onStop={handleStop}
                  onFlip={handleFlip}
                  onFullscreen={handleFullscreen}
                  isFullscreen={isFs}
                  canFlip={canFlip}
                />
              </div>
            )}

            {cameraActive && (
              <div className="absolute bottom-3 right-3 z-20">
                <SnapshotButton canvasRef={canvasRef} videoRef={videoRef} />
              </div>
            )}
          </div>

          <PrivacyNotice />
        </div>

        <div className="lg:w-80 flex flex-col gap-4">
          <div className="rounded-2xl bg-white/5 border border-white/8 p-4 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-white/90 mb-3">Garment</h3>
            <GarmentUploader onGarmentReady={handleGarmentReady} currentGarment={garment} />
          </div>

          {garment && (
            <div className="rounded-2xl bg-white/5 border border-white/8 p-4 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-white/90 mb-3">Fit Controls</h3>
              <TryOnControls
                adjustments={adjustments}
                onChange={setAdjustments}
                onAutoFit={handleAutoFit}
                onReset={handleReset}
                autoFit={autoFit}
              />
            </div>
          )}

          <div className="rounded-2xl bg-white/5 border border-white/8 p-4 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-white/90 mb-3">Demo Library</h3>
            <DemoLibrary onGarmentReady={handleGarmentReady} />
          </div>
        </div>
      </div>
    </div>
  );
}

import { Shirt, Sparkles } from 'lucide-react';

const DEMO_GARMENTS = [
  { id: 'tshirt', name: 'T-Shirt', category: 'Casual', color: 'from-gray-400 to-gray-600' },
  { id: 'shirt', name: 'Shirt', category: 'Formal', color: 'from-blue-400 to-blue-600' },
  { id: 'hoodie', name: 'Hoodie', category: 'Casual', color: 'from-gray-500 to-gray-700' },
  { id: 'jacket', name: 'Jacket', category: 'Outerwear', color: 'from-amber-600 to-amber-800' },
];

function DemoLibrary({ onGarmentReady }: { onGarmentReady: (g: ProcessedGarment) => void }) {
  const handleDemoSelect = (id: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 240;
    const ctx = canvas.getContext('2d')!;

    const colors: Record<string, string> = {
      tshirt: '#e2e8f0',
      shirt: '#3b82f6',
      hoodie: '#6b7280',
      jacket: '#d97706',
    };

    ctx.fillStyle = colors[id] || '#e2e8f0';

    if (id === 'tshirt') {
      ctx.beginPath();
      ctx.moveTo(60, 50);
      ctx.lineTo(40, 65);
      ctx.lineTo(30, 100);
      ctx.lineTo(50, 105);
      ctx.lineTo(50, 200);
      ctx.lineTo(150, 200);
      ctx.lineTo(150, 105);
      ctx.lineTo(170, 100);
      ctx.lineTo(160, 65);
      ctx.lineTo(140, 50);
      ctx.lineTo(110, 55);
      ctx.lineTo(100, 60);
      ctx.lineTo(90, 55);
      ctx.closePath();
      ctx.fill();
    } else if (id === 'shirt') {
      ctx.beginPath();
      ctx.moveTo(55, 45);
      ctx.lineTo(35, 60);
      ctx.lineTo(25, 220);
      ctx.lineTo(175, 220);
      ctx.lineTo(165, 60);
      ctx.lineTo(145, 45);
      ctx.lineTo(108, 52);
      ctx.lineTo(100, 60);
      ctx.lineTo(92, 52);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(100, 60);
      ctx.lineTo(100, 200);
      ctx.stroke();
    } else if (id === 'hoodie') {
      ctx.beginPath();
      ctx.moveTo(50, 55);
      ctx.lineTo(30, 70);
      ctx.lineTo(20, 220);
      ctx.lineTo(180, 220);
      ctx.lineTo(170, 70);
      ctx.lineTo(150, 55);
      ctx.lineTo(120, 60);
      ctx.lineTo(100, 75);
      ctx.lineTo(80, 60);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.arc(100, 80, 25, 0, Math.PI);
      ctx.fill();
    } else if (id === 'jacket') {
      ctx.beginPath();
      ctx.moveTo(50, 45);
      ctx.lineTo(30, 60);
      ctx.lineTo(20, 220);
      ctx.lineTo(180, 220);
      ctx.lineTo(170, 60);
      ctx.lineTo(150, 45);
      ctx.lineTo(105, 55);
      ctx.lineTo(100, 60);
      ctx.lineTo(95, 55);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, 60);
      ctx.lineTo(100, 220);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(50, 45);
      ctx.lineTo(100, 60);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(150, 45);
      ctx.lineTo(100, 60);
      ctx.stroke();
    }

    onGarmentReady({
      canvas,
      width: canvas.width,
      height: canvas.height,
      hasAlpha: true,
    });
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {DEMO_GARMENTS.map((g) => (
        <button
          key={g.id}
          onClick={() => handleDemoSelect(g.id)}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95"
        >
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${g.color} flex items-center justify-center`}>
            <Shirt className="w-5 h-5 text-white/80" />
          </div>
          <span className="text-[11px] text-white/60">{g.name}</span>
        </button>
      ))}
    </div>
  );
}
