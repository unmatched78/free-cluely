interface ElectronAPI {
  toggleWindow: () => void;
  takeScreenshot: () => Promise<string>;
  getSolution: (prompt: string) => Promise<string>;
  resetQueues: () => Promise<void>;
  toggleFullscreen: () => void;
  moveWindowLeft: () => void;
  moveWindowRight: () => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}