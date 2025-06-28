// ProcessingHelperMock.ts - A mock version for testing

import { AppState } from "./main"
import { LLMHelper } from "./LLMHelper"
import dotenv from "dotenv"

dotenv.config()

const isDev = process.env.NODE_ENV === "development"
const MOCK_API_WAIT_TIME = 500

export class ProcessingHelper {
  private appState: AppState
  private llmHelper: any
  private currentProcessingAbortController: AbortController | null = null
  private currentExtraProcessingAbortController: AbortController | null = null

  constructor(appState: AppState) {
    this.appState = appState
    // Use dummy API key for testing
    const apiKey = process.env.GEMINI_API_KEY || "dummy-api-key"
    
    // Create a mock LLMHelper
    this.llmHelper = {
      analyzeImageFile: this.mockAnalyzeImageFile.bind(this),
      analyzeAudioFile: this.mockAnalyzeAudioFile.bind(this),
      analyzeAudioFromBase64: this.mockAnalyzeAudioFromBase64.bind(this),
      generateSolution: this.mockGenerateSolution.bind(this),
      debugSolutionWithImages: this.mockDebugSolutionWithImages.bind(this)
    }
  }

  // Mock methods
  private async mockAnalyzeImageFile(filePath: string) {
    await this.delay(MOCK_API_WAIT_TIME)
    return {
      text: "This is a mock problem statement generated from an image file.",
      confidence: 0.95
    }
  }

  private async mockAnalyzeAudioFile(filePath: string) {
    await this.delay(MOCK_API_WAIT_TIME)
    return {
      text: "This is a mock problem statement generated from an audio file.",
      confidence: 0.9
    }
  }

  private async mockAnalyzeAudioFromBase64(data: string, mimeType: string) {
    await this.delay(MOCK_API_WAIT_TIME)
    return {
      text: "This is a mock problem statement generated from base64 audio data.",
      confidence: 0.85
    }
  }

  private async mockGenerateSolution(problemInfo: any) {
    await this.delay(MOCK_API_WAIT_TIME)
    return {
      solution: {
        code: `function solveProblem(input) {
  // This is a mock solution
  console.log("Solving the problem: " + input);
  return "Mock solution result";
}`,
        explanation: "This is a mock explanation of the solution."
      }
    }
  }

  private async mockDebugSolutionWithImages(problemInfo: any, currentCode: string, screenshots: string[]) {
    await this.delay(MOCK_API_WAIT_TIME)
    return {
      debugged_code: `function solveProblem(input) {
  // This is a mock debugged solution
  console.log("Solving the problem: " + input);
  // Fixed the bug
  return "Mock solution result - debugged";
}`,
      explanation: "This is a mock explanation of the debugging process."
    }
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  public async processScreenshots(): Promise<void> {
    const mainWindow = this.appState.getMainWindow()
    if (!mainWindow) return

    const view = this.appState.getView()

    if (view === "queue") {
      const screenshotQueue = this.appState.getScreenshotHelper().getScreenshotQueue()
      if (screenshotQueue.length === 0) {
        mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.NO_SCREENSHOTS)
        return
      }

      // Check if last screenshot is an audio file
      const allPaths = this.appState.getScreenshotHelper().getScreenshotQueue();
      const lastPath = allPaths[allPaths.length - 1];
      if (lastPath.endsWith('.mp3') || lastPath.endsWith('.wav')) {
        mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.INITIAL_START);
        this.appState.setView('solutions');
        try {
          const audioResult = await this.llmHelper.analyzeAudioFile(lastPath);
          mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.PROBLEM_EXTRACTED, audioResult);
          this.appState.setProblemInfo({ problem_statement: audioResult.text, input_format: {}, output_format: {}, constraints: [], test_cases: [] });
          return;
        } catch (err: any) {
          console.error('Audio processing error:', err);
          mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.INITIAL_SOLUTION_ERROR, err.message);
          return;
        }
      }

      // Handle screenshot as plain text
      mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.INITIAL_START)
      this.appState.setView("solutions")
      this.currentProcessingAbortController = new AbortController()
      try {
        const imageResult = await this.llmHelper.analyzeImageFile(lastPath);
        const problemInfo = {
          problem_statement: imageResult.text,
          input_format: { description: "Generated from screenshot", parameters: [] as any[] },
          output_format: { description: "Generated from screenshot", type: "string", subtype: "text" },
          complexity: { time: "N/A", space: "N/A" },
          test_cases: [] as any[],
          validation_type: "manual",
          difficulty: "custom"
        };
        mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.PROBLEM_EXTRACTED, problemInfo);
        this.appState.setProblemInfo(problemInfo);
      } catch (error: any) {
        console.error("Image processing error:", error)
        mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.INITIAL_SOLUTION_ERROR, error.message)
      } finally {
        this.currentProcessingAbortController = null
      }
      return;
    } else {
      // Debug mode
      const extraScreenshotQueue = this.appState.getScreenshotHelper().getExtraScreenshotQueue()
      if (extraScreenshotQueue.length === 0) {
        console.log("No extra screenshots to process")
        mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.NO_SCREENSHOTS)
        return
      }

      mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.DEBUG_START)
      this.currentExtraProcessingAbortController = new AbortController()

      try {
        // Get problem info and current solution
        const problemInfo = this.appState.getProblemInfo()
        if (!problemInfo) {
          throw new Error("No problem info available")
        }

        // Get current solution from state
        const currentSolution = await this.llmHelper.generateSolution(problemInfo)
        const currentCode = currentSolution.solution.code

        // Debug the solution using vision model
        const debugResult = await this.llmHelper.debugSolutionWithImages(
          problemInfo,
          currentCode,
          extraScreenshotQueue
        )

        this.appState.setHasDebugged(true)
        mainWindow.webContents.send(
          this.appState.PROCESSING_EVENTS.DEBUG_SUCCESS,
          debugResult
        )

      } catch (error: any) {
        console.error("Debug processing error:", error)
        mainWindow.webContents.send(
          this.appState.PROCESSING_EVENTS.DEBUG_ERROR,
          error.message
        )
      } finally {
        this.currentExtraProcessingAbortController = null
      }
    }
  }

  public cancelOngoingRequests(): void {
    if (this.currentProcessingAbortController) {
      this.currentProcessingAbortController.abort()
      this.currentProcessingAbortController = null
    }

    if (this.currentExtraProcessingAbortController) {
      this.currentExtraProcessingAbortController.abort()
      this.currentExtraProcessingAbortController = null
    }

    this.appState.setHasDebugged(false)
  }

  public async processAudioBase64(data: string, mimeType: string) {
    return this.llmHelper.analyzeAudioFromBase64(data, mimeType);
  }

  public async processAudioFile(filePath: string) {
    return this.llmHelper.analyzeAudioFile(filePath);
  }

  public getLLMHelper() {
    return this.llmHelper;
  }
}