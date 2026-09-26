import type { VirtualTryOnEngine, TryOnRenderInput, TryOnRenderResult } from './VirtualTryOnEngine';

/**
 * NeuralVTONEngine is a placeholder for a future neural virtual try-on model.
 * It implements the same VirtualTryOnEngine interface so it can be swapped in
 * without changing the rendering pipeline.
 *
 * When a cloud-based neural VTON service is available, implement the render()
 * method to send body + garment + pose data and receive an enhanced render.
 */
export class NeuralVTONEngine implements VirtualTryOnEngine {
  private initialized = false;

  get isReady(): boolean {
    return this.initialized;
  }

  async initialize(): Promise<void> {
    this.initialized = false;
  }

  render(_input: TryOnRenderInput): TryOnRenderResult {
    return { rendered: false, bodyDetected: false };
  }

  dispose(): void {
    this.initialized = false;
  }
}
