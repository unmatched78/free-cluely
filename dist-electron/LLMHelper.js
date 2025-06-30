"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMHelper = void 0;
const ai_providers_1 = require("./ai-providers");
class LLMHelper {
    providerFactory;
    systemPrompt = `You are Wingman AI, a helpful, proactive assistant for any kind of problem or situation (not just coding). For any user input, analyze the situation, provide a clear problem statement, relevant context, and suggest several possible responses or actions the user could take next. Always explain your reasoning. Present your suggestions as a list of options or next steps.`;
    constructor(apiKey, providerType = "gemini", model) {
        this.providerFactory = ai_providers_1.AIProviderFactory.getInstance();
        // Initialize the provider
        const config = {
            apiKey,
            model,
            systemPrompt: this.systemPrompt
        };
        this.providerFactory.initializeProvider(providerType, config);
        this.providerFactory.setActiveProvider(providerType);
    }
    async extractProblemFromImages(imagePaths) {
        try {
            const provider = this.providerFactory.getActiveProvider();
            if (!provider.supportsImageAnalysis()) {
                throw new Error(`Provider ${provider.getProviderName()} does not support image analysis`);
            }
            return await provider.extractProblemFromImages(imagePaths);
        }
        catch (error) {
            console.error("Error extracting problem from images:", error);
            throw error;
        }
    }
    async generateSolution(problemInfo) {
        console.log(`[LLMHelper] Calling ${this.providerFactory.getActiveProvider().getProviderName()} for solution...`);
        try {
            const provider = this.providerFactory.getActiveProvider();
            const result = await provider.generateSolution(problemInfo);
            console.log(`[LLMHelper] ${provider.getProviderName()} returned result.`);
            console.log("[LLMHelper] Parsed LLM response:", result);
            return result;
        }
        catch (error) {
            console.error("[LLMHelper] Error in generateSolution:", error);
            throw error;
        }
    }
    async debugSolutionWithImages(problemInfo, currentCode, debugImagePaths) {
        try {
            const provider = this.providerFactory.getActiveProvider();
            if (!provider.supportsImageAnalysis()) {
                throw new Error(`Provider ${provider.getProviderName()} does not support image analysis`);
            }
            const result = await provider.debugSolutionWithImages(problemInfo, currentCode, debugImagePaths);
            console.log(`[LLMHelper] Parsed debug ${provider.getProviderName()} response:`, result);
            return result;
        }
        catch (error) {
            console.error("Error debugging solution with images:", error);
            throw error;
        }
    }
    async analyzeAudioFile(audioPath) {
        try {
            const provider = this.providerFactory.getActiveProvider();
            if (!provider.supportsAudioAnalysis()) {
                throw new Error(`Provider ${provider.getProviderName()} does not support audio analysis`);
            }
            return await provider.analyzeAudioFile(audioPath);
        }
        catch (error) {
            console.error("Error analyzing audio file:", error);
            throw error;
        }
    }
    async analyzeAudioFromBase64(data, mimeType) {
        try {
            const provider = this.providerFactory.getActiveProvider();
            if (!provider.supportsAudioAnalysis()) {
                throw new Error(`Provider ${provider.getProviderName()} does not support audio analysis`);
            }
            return await provider.analyzeAudioFromBase64(data, mimeType);
        }
        catch (error) {
            console.error("Error analyzing audio from base64:", error);
            throw error;
        }
    }
    async analyzeImageFile(imagePath) {
        try {
            const provider = this.providerFactory.getActiveProvider();
            if (!provider.supportsImageAnalysis()) {
                throw new Error(`Provider ${provider.getProviderName()} does not support image analysis`);
            }
            return await provider.analyzeImageFile(imagePath);
        }
        catch (error) {
            console.error("Error analyzing image file:", error);
            throw error;
        }
    }
    setProvider(providerType, config) {
        if (config) {
            this.providerFactory.initializeProvider(providerType, config);
        }
        this.providerFactory.setActiveProvider(providerType);
    }
    getAvailableProviders() {
        return this.providerFactory.getAvailableProviders();
    }
    getCurrentProvider() {
        return {
            type: this.providerFactory.getActiveProviderType(),
            name: this.providerFactory.getActiveProvider().getProviderName(),
            models: this.providerFactory.getActiveProvider().getAvailableModels(),
            currentModel: this.providerFactory.getActiveProvider().getDefaultModel()
        };
    }
}
exports.LLMHelper = LLMHelper;
//# sourceMappingURL=LLMHelper.js.map