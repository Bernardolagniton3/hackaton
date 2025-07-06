/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

// Type definitions for libraries that don't have their own
declare module '*.json' {
  const value: any;
  export default value;
}

// Add OffscreenCanvas type definition for Tesseract.js compatibility
declare class OffscreenCanvas {
  constructor(width: number, height: number);
  width: number;
  height: number;
  getContext(contextId: '2d'): any;
  getContext(contextId: 'webgl'): any;
  getContext(contextId: 'webgl2'): any;
  convertToBlob(options?: any): Promise<Blob>;
  transferToImageBitmap(): any;
}

export {};
