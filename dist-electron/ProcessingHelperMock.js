"use strict";
// ProcessingHelperMock.ts - A mock version for testing
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessingHelper = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isDev = process.env.NODE_ENV === "development";
const MOCK_API_WAIT_TIME = 500;
class ProcessingHelper {
    appState;
    llmHelper;
    currentProcessingAbortController = null;
    currentExtraProcessingAbortController = null;
    constructor(appState) {
        this.appState = appState;
        // Use dummy API key for testing
        const apiKey = process.env.GEMINI_API_KEY || "dummy-api-key";
        // Create a mock LLMHelper
        this.llmHelper = {
            analyzeImageFile: this.mockAnalyzeImageFile.bind(this),
            analyzeAudioFile: this.mockAnalyzeAudioFile.bind(this),
            analyzeAudioFromBase64: this.mockAnalyzeAudioFromBase64.bind(this),
            generateSolution: this.mockGenerateSolution.bind(this),
            debugSolutionWithImages: this.mockDebugSolutionWithImages.bind(this)
        };
    }
    // Mock methods
    async mockAnalyzeImageFile(filePath) {
        await this.delay(MOCK_API_WAIT_TIME);
        return {
            text: "This is a mock problem statement generated from an image file.",
            confidence: 0.95
        };
    }
    async mockAnalyzeAudioFile(filePath) {
        await this.delay(MOCK_API_WAIT_TIME);
        return {
            text: "This is a mock problem statement generated from an audio file.",
            confidence: 0.9
        };
    }
    async mockAnalyzeAudioFromBase64(data, mimeType) {
        await this.delay(MOCK_API_WAIT_TIME);
        return {
            text: "This is a mock problem statement generated from base64 audio data.",
            confidence: 0.85
        };
    }
    async mockGenerateSolution(problemInfo) {
        await this.delay(MOCK_API_WAIT_TIME);
        return {
            solution: {
                code: `function solveProblem(input) {
  // This is a mock solution
  console.log("Solving the problem: " + input);
  return "Mock solution result";
}`,
                explanation: "This is a mock explanation of the solution."
            }
        };
    }
    async mockDebugSolutionWithImages(problemInfo, currentCode, screenshots) {
        await this.delay(MOCK_API_WAIT_TIME);
        return {
            debugged_code: `function solveProblem(input) {
  // This is a mock debugged solution
  console.log("Solving the problem: " + input);
  // Fixed the bug
  return "Mock solution result - debugged";
}`,
            explanation: "This is a mock explanation of the debugging process."
        };
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async processScreenshots() {
        const mainWindow = this.appState.getMainWindow();
        if (!mainWindow)
            return;
        const view = this.appState.getView();
        if (view === "queue") {
            const screenshotQueue = this.appState.getScreenshotHelper().getScreenshotQueue();
            if (screenshotQueue.length === 0) {
                mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.NO_SCREENSHOTS);
                return;
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
                }
                catch (err) {
                    console.error('Audio processing error:', err);
                    mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.INITIAL_SOLUTION_ERROR, err.message);
                    return;
                }
            }
            // Handle screenshot as plain text
            mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.INITIAL_START);
            this.appState.setView("solutions");
            this.currentProcessingAbortController = new AbortController();
            try {
                const imageResult = await this.llmHelper.analyzeImageFile(lastPath);
                const problemInfo = {
                    problem_statement: imageResult.text,
                    input_format: { description: "Generated from screenshot", parameters: [] },
                    output_format: { description: "Generated from screenshot", type: "string", subtype: "text" },
                    complexity: { time: "N/A", space: "N/A" },
                    test_cases: [],
                    validation_type: "manual",
                    difficulty: "custom"
                };
                mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.PROBLEM_EXTRACTED, problemInfo);
                this.appState.setProblemInfo(problemInfo);
            }
            catch (error) {
                console.error("Image processing error:", error);
                mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.INITIAL_SOLUTION_ERROR, error.message);
            }
            finally {
                this.currentProcessingAbortController = null;
            }
            return;
        }
        else {
            // Debug mode
            const extraScreenshotQueue = this.appState.getScreenshotHelper().getExtraScreenshotQueue();
            if (extraScreenshotQueue.length === 0) {
                console.log("No extra screenshots to process");
                mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.NO_SCREENSHOTS);
                return;
            }
            mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.DEBUG_START);
            this.currentExtraProcessingAbortController = new AbortController();
            try {
                // Get problem info and current solution
                const problemInfo = this.appState.getProblemInfo();
                if (!problemInfo) {
                    throw new Error("No problem info available");
                }
                // Get current solution from state
                const currentSolution = await this.llmHelper.generateSolution(problemInfo);
                const currentCode = currentSolution.solution.code;
                // Debug the solution using vision model
                const debugResult = await this.llmHelper.debugSolutionWithImages(problemInfo, currentCode, extraScreenshotQueue);
                this.appState.setHasDebugged(true);
                mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.DEBUG_SUCCESS, debugResult);
            }
            catch (error) {
                console.error("Debug processing error:", error);
                mainWindow.webContents.send(this.appState.PROCESSING_EVENTS.DEBUG_ERROR, error.message);
            }
            finally {
                this.currentExtraProcessingAbortController = null;
            }
        }
    }
    cancelOngoingRequests() {
        if (this.currentProcessingAbortController) {
            this.currentProcessingAbortController.abort();
            this.currentProcessingAbortController = null;
        }
        if (this.currentExtraProcessingAbortController) {
            this.currentExtraProcessingAbortController.abort();
            this.currentExtraProcessingAbortController = null;
        }
        this.appState.setHasDebugged(false);
    }
    async processAudioBase64(data, mimeType) {
        return this.llmHelper.analyzeAudioFromBase64(data, mimeType);
    }
    async processAudioFile(filePath) {
        return this.llmHelper.analyzeAudioFile(filePath);
    }
    getLLMHelper() {
        return this.llmHelper;
    }
}
exports.ProcessingHelper = ProcessingHelper;
//# sourceMappingURL=ProcessingHelperMock.js.map