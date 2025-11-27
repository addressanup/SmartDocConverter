import { create } from 'zustand'

export type ConversionState = 'idle' | 'uploading' | 'processing' | 'completed' | 'error'

interface ConversionStore {
  state: ConversionState
  progress: number
  error: string | null
  downloadUrl: string | null
  fileName: string | null
  jobId: string | null

  // Actions
  setUploading: (progress?: number) => void
  setProcessing: (progress?: number) => void
  setCompleted: (downloadUrl: string, fileName: string) => void
  setError: (error: string) => void
  setProgress: (progress: number) => void
  setJobId: (jobId: string) => void
  reset: () => void
}

const initialState = {
  state: 'idle' as ConversionState,
  progress: 0,
  error: null,
  downloadUrl: null,
  fileName: null,
  jobId: null,
}

export const useConversionStore = create<ConversionStore>((set) => ({
  ...initialState,

  setUploading: (progress = 0) =>
    set({ state: 'uploading', progress, error: null }),

  setProcessing: (progress = 0) =>
    set({ state: 'processing', progress, error: null }),

  setCompleted: (downloadUrl, fileName) =>
    set({ state: 'completed', progress: 100, downloadUrl, fileName, error: null }),

  setError: (error) =>
    set({ state: 'error', error }),

  setProgress: (progress) =>
    set({ progress }),

  setJobId: (jobId) =>
    set({ jobId }),

  reset: () => set(initialState),
}))
