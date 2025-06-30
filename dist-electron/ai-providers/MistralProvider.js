"use strict";
// electron/ai-providers/MistralProvider.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.MistralProvider = void 0;
const mistralai_1 = require("@mistralai/mistralai");
class MistralProvider {
    client = null;
    systemPrompt = `You are Wingman AI, a helpful, proactive assistant for any kind of problem or situation (not just coding). For any user input, analyze the situation, provide a clear problem statement, relevant context, and suggest several possible responses or actions the user could take next. Always explain your reasoning. Present your suggestions as a list of options or next steps.`;
    defaultModel = "mistral-large-latest";
    availableModels = [
        "mistral-large-latest",
        "mistral-medium-latest",
        "mistral-small-latest",
        "open-mixtral-8x7b"
    ];
    temperature = 0.7;
    maxTokens = 4096;
    initialize(config) {
        this.client = new mistralai_1.Mistral({
            apiKey: config.apiKey,
            serverURL: config.baseUrl, // correct option name
        });
        if (config.systemPrompt)
            this.systemPrompt = config.systemPrompt;
        if (config.temperature !== undefined)
            this.temperature = config.temperature;
        if (config.maxTokens !== undefined)
            this.maxTokens = config.maxTokens;
    }
    getProviderName() { return "Mistral AI"; }
    getAvailableModels() { return this.availableModels; }
    getDefaultModel() { return this.defaultModel; }
    supportsImageAnalysis() { return false; }
    supportsAudioAnalysis() { return false; }
    cleanJsonResponse(text) {
        return text
            .replace(/^```(?:json)?\n/, "")
            .replace(/\n```$/, "")
            .trim();
    }
    extractFirstText(res) {
        const content = res.choices?.[0]?.message?.content;
        if (typeof content === "string") {
            return content;
        }
        if (Array.isArray(content)) {
            const txt = content.find((b) => b.type === "text" && typeof b.text === "string");
            return txt?.text ?? "";
        }
        return "";
    }
    async generateText(prompt) {
        if (!this.client)
            throw new Error("Mistral provider not initialized");
        const res = await this.client.chat.complete({
            model: this.defaultModel,
            messages: [
                { role: "system", content: this.systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: this.temperature,
            maxTokens: this.maxTokens
        });
        return this.extractFirstText(res);
    }
    async extractProblemFromImages(_imagePaths) {
        throw new Error("Image analysis not supported by Mistral provider");
    }
    async generateSolution(problemInfo) {
        if (!this.client)
            throw new Error("Mistral provider not initialized");
        const prompt = `Given this problem or situation:\n${JSON.stringify(problemInfo, null, 2)}\n\n` +
            `Please provide your response in the following JSON format:\n` +
            `{\n` +
            `  "solution": {\n` +
            `    "code": "The code or main answer here.",\n` +
            `    "problem_statement": "Restate the problem or situation.",\n` +
            `    "context": "Relevant background/context.",\n` +
            `    "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],\n` +
            `    "reasoning": "Explanation of why these suggestions are appropriate."\n` +
            `  }\n` +
            `}\n` +
            `Return ONLY the JSON object, without markdown or code fences.`;
        const res = await this.client.chat.complete({
            model: this.defaultModel,
            messages: [
                { role: "system", content: this.systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: this.temperature,
            maxTokens: this.maxTokens
        });
        const raw = this.extractFirstText(res);
        const jsonText = this.cleanJsonResponse(raw);
        return JSON.parse(jsonText);
    }
    async debugSolutionWithImages(_problemInfo, _currentCode, _debugImagePaths) {
        throw new Error("Image analysis not supported by Mistral provider");
    }
    async analyzeAudioFile(_audioPath) {
        throw new Error("Audio analysis not supported by Mistral provider");
    }
    async analyzeAudioFromBase64(_data, _mimeType) {
        throw new Error("Audio analysis not supported by Mistral provider");
    }
    async analyzeImageFile(_imagePath) {
        throw new Error("Image analysis not supported by Mistral provider");
    }
}
exports.MistralProvider = MistralProvider;
//# sourceMappingURL=MistralProvider.js.map