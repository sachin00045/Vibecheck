import type { RefObject } from 'react';

export interface CameraState {
  stream: MediaStream | null;
  active: boolean;
  error: string | null;
  facingMode: 'user' | 'environment';
}

export async function startCamera(
  video: HTMLVideoElement,
  facingMode: 'user' | 'environment' = 'user'
): Promise<MediaStream> {
  const constraints: MediaStreamConstraints = {
    video: {
      facingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream;
  video.setAttribute('playsinline', 'true');
  await video.play();
  return stream;
}

export function stopCamera(stream: MediaStream | null, video: HTMLVideoElement | null) {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
  }
  if (video) {
    video.srcObject = null;
  }
}

export async function flipCamera(
  video: HTMLVideoElement,
  currentStream: MediaStream | null,
  currentFacing: 'user' | 'environment'
): Promise<{ stream: MediaStream; facingMode: 'user' | 'environment' }> {
  stopCamera(currentStream, video);
  const newFacing = currentFacing === 'user' ? 'environment' : 'user';
  const stream = await startCamera(video, newFacing);
  return { stream, facingMode: newFacing };
}

export function isFullscreen(): boolean {
  return !!document.fullscreenElement;
}

export async function toggleFullscreen(element: HTMLElement): Promise<void> {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await element.requestFullscreen();
  }
}
