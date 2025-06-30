"use strict";
// electron/ai-providers/ClaudeProvider.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeProvider = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const fs_1 = __importDefault(require("fs"));
class ClaudeProvider {
    client = null;
    systemPrompt = `You are Wingman AI, a helpful, proactive assistant for any kind of problem or situation (not just coding). For any user input, analyze the situation, provide a clear problem statement, relevant context, and suggest several possible responses or actions the user could take next. Always explain your reasoning. Present your suggestions as a list of options or next steps.`;
    defaultModel = "claude-3-opus-20240229";
    availableModels = [
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307"
    ];
    temperature = 0.7;
    maxTokens = 4096;
    initialize(config) {
        this.client = new sdk_1.default({
            apiKey: config.apiKey,
            baseURL: config.baseUrl
        });
        if (config.systemPrompt)
            this.systemPrompt = config.systemPrompt;
        if (config.temperature !== undefined)
            this.temperature = config.temperature;
        if (config.maxTokens !== undefined)
            this.maxTokens = config.maxTokens;
    }
    getProviderName() { return "Anthropic Claude"; }
    getAvailableModels() { return this.availableModels; }
    getDefaultModel() { return this.defaultModel; }
    supportsImageAnalysis() { return true; }
    supportsAudioAnalysis() { return false; }
    async fileToBase64(path) {
        const buf = await fs_1.default.promises.readFile(path);
        return buf.toString("base64");
    }
    cleanJsonResponse(text) {
        return text
            .replace(/^```(?:json)?\n/, "")
            .replace(/\n```$/, "")
            .trim();
    }
    /** Pulls the first “text” block out of the SDK response */
    extractFirstText(res) {
        if (!Array.isArray(res.content))
            return "";
        const blk = res.content.find((b) => b.type === "text" && typeof b.text === "string");
        return blk?.text ?? "";
    }
    async generateText(prompt) {
        if (!this.client)
            throw new Error("Claude provider not initialized");
        const res = await this.client.messages.create({
            model: this.defaultModel,
            system: this.systemPrompt,
            messages: [{ role: "user", content: prompt }],
            temperature: this.temperature,
            max_tokens: this.maxTokens
        });
        return this.extractFirstText(res);
    }
    async extractProblemFromImages(imagePaths) {
        if (!this.client)
            throw new Error("Claude provider not initialized");
        // Build blocks with literal MIME types
        const imageBlocks = await Promise.all(imagePaths.map(async (path) => {
            const base64 = await this.fileToBase64(path);
            const mime = path.toLowerCase().endsWith(".png")
                ? "image/png"
                : "image/jpeg";
            return {
                type: "image",
                source: {
                    type: "base64",
                    media_type: mime,
                    data: base64
                }
            };
        }));
        const prompt = `Please analyze these images and extract the following information in JSON format:
{
  "problem_statement": "A clear statement of the problem or situation depicted in the images.",
  "context": "Relevant background or context from the images.",
  "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
  "reasoning": "Explanation of why these suggestions are appropriate."
}
Return ONLY the JSON object, without markdown or code fences.`;
        const res = await this.client.messages.create({
            model: this.defaultModel,
            system: this.systemPrompt,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        ...imageBlocks
                    ]
                }
            ],
            temperature: this.temperature,
            max_tokens: this.maxTokens
        });
        const jsonText = this.cleanJsonResponse(this.extractFirstText(res));
        return JSON.parse(jsonText);
    }
    async generateSolution(problemInfo) {
        if (!this.client)
            throw new Error("Claude provider not initialized");
        const prompt = `Given this problem or situation:\n${JSON.stringify(problemInfo, null, 2)}\n\n` +
            `Please provide your response in the following JSON format:\n` +
            `{
  "solution": {
    "code": "The code or main answer here.",
    "problem_statement": "Restate the problem or situation.",
    "context": "Relevant background/context.",
    "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
    "reasoning": "Explanation of why these suggestions are appropriate."
  }
}
Return ONLY the JSON object, without markdown or code fences.`;
        const res = await this.client.messages.create({
            model: this.defaultModel,
            system: this.systemPrompt,
            messages: [{ role: "user", content: prompt }],
            temperature: this.temperature,
            max_tokens: this.maxTokens
        });
        const jsonText = this.cleanJsonResponse(this.extractFirstText(res));
        return JSON.parse(jsonText);
    }
    async debugSolutionWithImages(problemInfo, currentCode, debugImagePaths) {
        if (!this.client)
            throw new Error("Claude provider not initialized");
        const imageBlocks = await Promise.all(debugImagePaths.map(async (path) => {
            const base64 = await this.fileToBase64(path);
            const mime = path.toLowerCase().endsWith(".png")
                ? "image/png"
                : "image/jpeg";
            return {
                type: "image",
                source: {
                    type: "base64",
                    media_type: mime,
                    data: base64
                }
            };
        }));
        const prompt = `Given:
1. The original problem or situation: ${JSON.stringify(problemInfo, null, 2)}
2. The current response or approach: ${currentCode}
3. The debug information in the provided images

Please analyze the debug information and provide feedback in this JSON format:
{
  "solution": {
    "code": "The code or main answer here.",
    "problem_statement": "Restate the problem or situation.",
    "context": "Relevant background/context.",
    "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
    "reasoning": "Explanation of why these suggestions are appropriate."
  }
}
Return ONLY the JSON object, without markdown or code fences.`;
        const res = await this.client.messages.create({
            model: this.defaultModel,
            system: this.systemPrompt,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        ...imageBlocks
                    ]
                }
            ],
            temperature: this.temperature,
            max_tokens: this.maxTokens
        });
        const jsonText = this.cleanJsonResponse(this.extractFirstText(res));
        return JSON.parse(jsonText);
    }
    async analyzeAudioFile(_path) {
        throw new Error("Audio analysis not supported by Claude");
    }
    async analyzeAudioFromBase64(_data, _mime) {
        throw new Error("Audio analysis not supported by Claude");
    }
    async analyzeImageFile(imagePath) {
        if (!this.client)
            throw new Error("Claude provider not initialized");
        const base64Image = await this.fileToBase64(imagePath);
        const mimeType = imagePath.toLowerCase().endsWith(".png")
            ? "image/png"
            : "image/jpeg";
        const prompt = `Describe the content of this image in a short, concise answer. In addition to your main answer, suggest several possible actions or responses the user could take next based on the image. Answer naturally—no JSON or markdown.`;
        const res = await this.client.messages.create({
            model: this.defaultModel,
            system: this.systemPrompt,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image",
                            source: { type: "base64", media_type: mimeType, data: base64Image }
                        }
                    ]
                }
            ],
            temperature: this.temperature,
            max_tokens: this.maxTokens
        });
        return {
            text: this.extractFirstText(res),
            timestamp: Date.now()
        };
    }
}
exports.ClaudeProvider = ClaudeProvider;
//# sourceMappingURL=ClaudeProvider.js.map