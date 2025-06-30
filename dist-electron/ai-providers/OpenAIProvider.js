"use strict";
// electron/ai-providers/OpenAIProvider.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const openai_1 = __importDefault(require("openai"));
const fs_1 = __importDefault(require("fs"));
class OpenAIProvider {
    client = null;
    systemPrompt = `You are Wingman AI, a helpful, proactive assistant for any kind of problem or situation (not just coding). For any user input, analyze the situation, provide a clear problem statement, relevant context, and suggest several possible responses or actions the user could take next. Always explain your reasoning. Present your suggestions as a list of options or next steps.`;
    defaultModel = "gpt-4o";
    availableModels = [
        "gpt-4o",
        "gpt-4-turbo",
        "gpt-4-vision-preview",
        "gpt-3.5-turbo"
    ];
    temperature = 0.7;
    maxTokens = 4096;
    initialize(config) {
        this.client = new openai_1.default({
            apiKey: config.apiKey,
            baseURL: config.baseUrl || undefined
        });
        if (config.systemPrompt)
            this.systemPrompt = config.systemPrompt;
        if (config.temperature !== undefined)
            this.temperature = config.temperature;
        if (config.maxTokens !== undefined)
            this.maxTokens = config.maxTokens;
    }
    getProviderName() { return "OpenAI"; }
    getAvailableModels() { return this.availableModels; }
    getDefaultModel() { return this.defaultModel; }
    supportsImageAnalysis() { return true; }
    supportsAudioAnalysis() { return true; }
    async fileToBase64(path) {
        const buf = await fs_1.default.promises.readFile(path);
        return buf.toString("base64");
    }
    cleanJsonResponse(text) {
        return text.replace(/^```(?:json)?\n/, "")
            .replace(/\n```$/, "")
            .trim();
    }
    /**
     * The SDK returns either a string or an array of content-block objects.
     * We force `stream: false` so `choices` is always on the ChatCompletion.
     */
    extractFirstText(res) {
        const content = res.choices?.[0]?.message?.content;
        if (typeof content === "string") {
            return content;
        }
        if (Array.isArray(content)) {
            const txtBlk = content.find(b => b.type === "text" && typeof b.text === "string");
            return txtBlk ? txtBlk.text : "";
        }
        return "";
    }
    async generateText(prompt) {
        if (!this.client)
            throw new Error("OpenAI provider not initialized");
        const res = await this.client.chat.completions.create({
            model: this.defaultModel,
            messages: [
                { role: "system", content: this.systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: this.temperature,
            max_tokens: this.maxTokens,
            stream: false
        });
        return this.extractFirstText(res);
    }
    async extractProblemFromImages(imagePaths) {
        if (!this.client)
            throw new Error("OpenAI provider not initialized");
        const imageBlocks = await Promise.all(imagePaths.map(async (path) => ({
            type: "image_url",
            image_url: {
                url: `data:${path.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg"};base64,` +
                    await this.fileToBase64(path)
            }
        })));
        const prompt = `Please analyze these images and extract the following information in JSON format:
{
  "problem_statement": "A clear statement of the problem or situation depicted in the images.",
  "context": "Relevant background or context from the images.",
  "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
  "reasoning": "Explanation of why these suggestions are appropriate."
}
Return ONLY the JSON object, without markdown or code fences.`;
        const res = await this.client.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                { role: "system", content: this.systemPrompt },
                { role: "user", content: [{ type: "text", text: prompt }, ...imageBlocks] }
            ],
            temperature: this.temperature,
            max_tokens: this.maxTokens,
            stream: false
        });
        const jsonText = this.cleanJsonResponse(this.extractFirstText(res));
        return JSON.parse(jsonText);
    }
    async generateSolution(problemInfo) {
        if (!this.client)
            throw new Error("OpenAI provider not initialized");
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
        const res = await this.client.chat.completions.create({
            model: this.defaultModel,
            messages: [
                { role: "system", content: this.systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: this.temperature,
            max_tokens: this.maxTokens,
            stream: false
        });
        const jsonText = this.cleanJsonResponse(this.extractFirstText(res));
        return JSON.parse(jsonText);
    }
    async debugSolutionWithImages(problemInfo, currentCode, debugImagePaths) {
        if (!this.client)
            throw new Error("OpenAI provider not initialized");
        const imageBlocks = await Promise.all(debugImagePaths.map(async (path) => ({
            type: "image_url",
            image_url: {
                url: `data:${path.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg"};base64,` +
                    await this.fileToBase64(path)
            }
        })));
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
        const res = await this.client.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                { role: "system", content: this.systemPrompt },
                { role: "user", content: [{ type: "text", text: prompt }, ...imageBlocks] }
            ],
            temperature: this.temperature,
            max_tokens: this.maxTokens,
            stream: false
        });
        const jsonText = this.cleanJsonResponse(this.extractFirstText(res));
        return JSON.parse(jsonText);
    }
    async analyzeAudioFile(audioPath) {
        if (!this.client)
            throw new Error("OpenAI provider not initialized");
        const stream = fs_1.default.createReadStream(audioPath);
        const transcription = await this.client.audio.transcriptions.create({
            model: "whisper-1",
            file: stream
        });
        const prompt = `Describe this audio transcript in a short, concise answer. In addition to your main answer, suggest several possible actions or responses the user could take next based on the audio. Do not return a structured JSON object, just answer naturally.\n\nTranscript: ${transcription.text}`;
        const res = await this.client.chat.completions.create({
            model: this.defaultModel,
            messages: [
                { role: "system", content: this.systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: this.temperature,
            max_tokens: this.maxTokens,
            stream: false
        });
        return {
            text: this.extractFirstText(res),
            timestamp: Date.now()
        };
    }
    async analyzeAudioFromBase64(data) {
        if (!this.client)
            throw new Error("OpenAI provider not initialized");
        const tmp = `/tmp/audio-${Date.now()}.tmp`;
        await fs_1.default.promises.writeFile(tmp, Buffer.from(data, "base64"));
        const result = await this.analyzeAudioFile(tmp);
        await fs_1.default.promises.unlink(tmp);
        return result;
    }
    async analyzeImageFile(imagePath) {
        if (!this.client)
            throw new Error("OpenAI provider not initialized");
        const base64 = await this.fileToBase64(imagePath);
        const prompt = `Describe the content of this image in a short, concise answer. In addition to your main answer, suggest several possible actions or responses the user could take next based on the image. Do not return a structured JSON object, just answer naturally.`;
        const res = await this.client.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                { role: "system", content: this.systemPrompt },
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${imagePath.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg"};base64,${base64}`
                            }
                        }
                    ]
                }
            ],
            temperature: this.temperature,
            max_tokens: this.maxTokens,
            stream: false
        });
        return {
            text: this.extractFirstText(res),
            timestamp: Date.now()
        };
    }
}
exports.OpenAIProvider = OpenAIProvider;
//# sourceMappingURL=OpenAIProvider.js.map