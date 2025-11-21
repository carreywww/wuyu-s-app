export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface GeneratedImage {
  url: string;
  base64: string;
  mimeType: string;
}

export interface LoadingState {
  isLoading: boolean;
  message: string;
}

export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT = "3:4",
  LANDSCAPE = "4:3",
  WIDE = "16:9",
  TALL = "9:16"
}