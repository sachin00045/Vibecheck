import {
  FilesetResolver,
  ImageSegmenter,
  type ImageSegmenterResult,
} from '@mediapipe/tasks-vision';
import type { SegmentationData } from '@/types';

const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const SEGMENTER_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite';

export class PersonSegmenter {
  private segmenter: ImageSegmenter | null = null;
  private initialized = false;
  private initializing = false;
  private lastTimestamp = 0;
  private maskCanvas: HTMLCanvasElement | null = null;
  private maskCtx: CanvasRenderingContext2D | null = null;

  get isReady(): boolean {
    return this.initialized;
  }

  get isInitializing(): boolean {
    return this.initializing;
  }

  async initialize(): Promise<void> {
    if (this.initialized || this.initializing) return;
    this.initializing = true;
    try {
      const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
      this.segmenter = await ImageSegmenter.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: SEGMENTER_MODEL_URL,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        outputCategoryMask: true,
        outputConfidenceMasks: false,
      });
      this.initialized = true;
    } catch {
      try {
        const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
        this.segmenter = await ImageSegmenter.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: SEGMENTER_MODEL_URL,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          outputCategoryMask: true,
          outputConfidenceMasks: false,
        });
        this.initialized = true;
      } finally {
        this.initializing = false;
      }
    }
    this.initializing = false;
  }

  segment(video: HTMLVideoElement): SegmentationData | null {
    if (!this.segmenter || !this.initialized) return null;
    if (video.readyState < 2) return null;

    const timestamp = performance.now();
    if (timestamp <= this.lastTimestamp) return null;
    this.lastTimestamp = timestamp;

    let result: ImageSegmenterResult | null = null;
    try {
      result = this.segmenter.segmentForVideo(video, timestamp);
    } catch {
      return null;
    }

    if (!result || !result.categoryMask) return null;

    const mask = result.categoryMask;
    const width = mask.width;
    const height = mask.height;
    const categoryData = mask.getAsUint8Array();

    return {
      categoryMask: categoryData,
      width,
      height,
      timestamp,
    };
  }

  getPersonMaskData(
    segData: SegmentationData,
    videoWidth: number,
    videoHeight: number
  ): Uint8Array {
    const mask = segData.categoryMask;
    const maskW = segData.width;
    const maskH = segData.height;
    const out = new Uint8Array(videoWidth * videoHeight);

    const xRatio = maskW / videoWidth;
    const yRatio = maskH / videoHeight;

    for (let y = 0; y < videoHeight; y++) {
      for (let x = 0; x < videoWidth; x++) {
        const mx = Math.min(maskW - 1, Math.floor(x * xRatio));
        const my = Math.min(maskH - 1, Math.floor(y * yRatio));
        const cat = mask[my * maskW + mx];
        out[y * videoWidth + x] = cat > 0 ? 255 : 0;
      }
    }
    return out;
  }

  dispose() {
    if (this.segmenter) {
      this.segmenter.close();
      this.segmenter = null;
    }
    this.initialized = false;
    this.maskCanvas = null;
    this.maskCtx = null;
  }
}
