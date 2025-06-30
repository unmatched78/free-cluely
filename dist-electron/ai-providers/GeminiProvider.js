"use strict";
// GeminiProvider.ts - Implementation for Google's Gemini AI
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const generative_ai_1 = require("@google/generative-ai");
const fs_1 = __importDefault(require("fs"));
class GeminiProvider {
    model = null;
    systemPrompt = `You are Wingman AI, a helpful, proactive assistant for any kind of problem or situation (not just coding). For any user input, analyze the situation, provide a clear problem statement, relevant context, and suggest several possible responses or actions the user could take next. Always explain your reasoning. Present your suggestions as a list of options or next steps.`;
    defaultModel = "gemini-2.0-flash";
    availableModels = [
        "gemini-2.0-flash",
        "gemini-2.0-pro",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
    ];
    initialize(config) {
        const genAI = new generative_ai_1.GoogleGenerativeAI(config.apiKey);
        this.model = genAI.getGenerativeModel({
            model: config.model || this.defaultModel,
            generationConfig: {
                temperature: config.temperature || 0.7,
                maxOutputTokens: config.maxTokens || 8192,
            }
        });
        if (config.systemPrompt) {
            this.systemPrompt = config.systemPrompt;
        }
    }
    getProviderName() {
        return "Google Gemini";
    }
    getAvailableModels() {
        return this.availableModels;
    }
    getDefaultModel() {
        return this.defaultModel;
    }
    supportsImageAnalysis() {
        return true;
    }
    supportsAudioAnalysis() {
        return true;
    }
    async fileToGenerativePart(imagePath) {
        const imageData = await fs_1.default.promises.readFile(imagePath);
        return {
            inlineData: {
                data: imageData.toString("base64"),
                mimeType: "image/png"
            }
        };
    }
    cleanJsonResponse(text) {
        // Remove markdown code block syntax if present
        text = text.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
        // Remove any leading/trailing whitespace
        text = text.trim();
        return text;
    }
    async generateText(prompt) {
        if (!this.model) {
            throw new Error("Gemini provider not initialized");
        }
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
    async extractProblemFromImages(imagePaths) {
        if (!this.model) {
            throw new Error("Gemini provider not initialized");
        }
        try {
            const imageParts = await Promise.all(imagePaths.map(path => this.fileToGenerativePart(path)));
            const prompt = `${this.systemPrompt}\n\nYou are a wingman. Please analyze these images and extract the following information in JSON format:\n{
  "problem_statement": "A clear statement of the problem or situation depicted in the images.",
  "context": "Relevant background or context from the images.",
  "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
  "reasoning": "Explanation of why these suggestions are appropriate."
}\nImportant: Return ONLY the JSON object, without any markdown formatting or code blocks.`;
            const result = await this.model.generateContent([prompt, ...imageParts]);
            const response = await result.response;
            const text = this.cleanJsonResponse(response.text());
            return JSON.parse(text);
        }
        catch (error) {
            console.error("Error extracting problem from images:", error);
            throw error;
        }
    }
    async generateSolution(problemInfo) {
        if (!this.model) {
            throw new Error("Gemini provider not initialized");
        }
        const prompt = `${this.systemPrompt}\n\nGiven this problem or situation:\n${JSON.stringify(problemInfo, null, 2)}\n\nPlease provide your response in the following JSON format:\n{
  "solution": {
    "code": "The code or main answer here.",
    "problem_statement": "Restate the problem or situation.",
    "context": "Relevant background/context.",
    "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
    "reasoning": "Explanation of why these suggestions are appropriate."
  }
}\nImportant: Return ONLY the JSON object, without any markdown formatting or code blocks.`;
        console.log("[GeminiProvider] Calling Gemini LLM for solution...");
        try {
            const result = await this.model.generateContent(prompt);
            console.log("[GeminiProvider] Gemini LLM returned result.");
            const response = await result.response;
            const text = this.cleanJsonResponse(response.text());
            const parsed = JSON.parse(text);
            console.log("[GeminiProvider] Parsed LLM response:", parsed);
            return parsed;
        }
        catch (error) {
            console.error("[GeminiProvider] Error in generateSolution:", error);
            throw error;
        }
    }
    async debugSolutionWithImages(problemInfo, currentCode, debugImagePaths) {
        if (!this.model) {
            throw new Error("Gemini provider not initialized");
        }
        try {
            const imageParts = await Promise.all(debugImagePaths.map(path => this.fileToGenerativePart(path)));
            const prompt = `${this.systemPrompt}\n\nYou are a wingman. Given:\n1. The original problem or situation: ${JSON.stringify(problemInfo, null, 2)}\n2. The current response or approach: ${currentCode}\n3. The debug information in the provided images\n\nPlease analyze the debug information and provide feedback in this JSON format:\n{
  "solution": {
    "code": "The code or main answer here.",
    "problem_statement": "Restate the problem or situation.",
    "context": "Relevant background/context.",
    "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
    "reasoning": "Explanation of why these suggestions are appropriate."
  }
}\nImportant: Return ONLY the JSON object, without any markdown formatting or code blocks.`;
            const result = await this.model.generateContent([prompt, ...imageParts]);
            const response = await result.response;
            const text = this.cleanJsonResponse(response.text());
            const parsed = JSON.parse(text);
            console.log("[GeminiProvider] Parsed debug LLM response:", parsed);
            return parsed;
        }
        catch (error) {
            console.error("Error debugging solution with images:", error);
            throw error;
        }
    }
    async analyzeAudioFile(audioPath) {
        if (!this.model) {
            throw new Error("Gemini provider not initialized");
        }
        try {
            const audioData = await fs_1.default.promises.readFile(audioPath);
            const audioPart = {
                inlineData: {
                    data: audioData.toString("base64"),
                    mimeType: "audio/mp3"
                }
            };
            const prompt = `${this.systemPrompt}\n\nDescribe this audio clip in a short, concise answer. In addition to your main answer, suggest several possible actions or responses the user could take next based on the audio. Do not return a structured JSON object, just answer naturally as you would to a user.`;
            const result = await this.model.generateContent([prompt, audioPart]);
            const response = await result.response;
            const text = response.text();
            return { text, timestamp: Date.now() };
        }
        catch (error) {
            console.error("Error analyzing audio file:", error);
            throw error;
        }
    }
    async analyzeAudioFromBase64(data, mimeType) {
        if (!this.model) {
            throw new Error("Gemini provider not initialized");
        }
        try {
            const audioPart = {
                inlineData: {
                    data,
                    mimeType
                }
            };
            const prompt = `${this.systemPrompt}\n\nDescribe this audio clip in a short, concise answer. In addition to your main answer, suggest several possible actions or responses the user could take next based on the audio. Do not return a structured JSON object, just answer naturally as you would to a user and be concise.`;
            const result = await this.model.generateContent([prompt, audioPart]);
            const response = await result.response;
            const text = response.text();
            return { text, timestamp: Date.now() };
        }
        catch (error) {
            console.error("Error analyzing audio from base64:", error);
            throw error;
        }
    }
    async analyzeImageFile(imagePath) {
        if (!this.model) {
            throw new Error("Gemini provider not initialized");
        }
        try {
            const imageData = await fs_1.default.promises.readFile(imagePath);
            const imagePart = {
                inlineData: {
                    data: imageData.toString("base64"),
                    mimeType: "image/png"
                }
            };
            const prompt = `${this.systemPrompt}\n\nDescribe the content of this image in a short, concise answer. In addition to your main answer, suggest several possible actions or responses the user could take next based on the image. Do not return a structured JSON object, just answer naturally as you would to a user. Be concise and brief.`;
            const result = await this.model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();
            return { text, timestamp: Date.now() };
        }
        catch (error) {
            console.error("Error analyzing image file:", error);
            throw error;
        }
    }
}
exports.GeminiProvider = GeminiProvider;
//# sourceMappingURL=GeminiProvider.js.map