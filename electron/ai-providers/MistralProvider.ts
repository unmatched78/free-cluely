// electron/ai-providers/MistralProvider.ts

import { Mistral } from "@mistralai/mistralai";
import fs from "fs";
import {
  AIProvider,
  AIProviderConfig,
  AIImageAnalysisResponse,
  AIAudioAnalysisResponse,
  AIProblemExtraction,
  AISolution
} from "./AIProvider";

export class MistralProvider implements AIProvider {
  private client: Mistral | null = null;
  private systemPrompt = `You are Wingman AI, a helpful, proactive assistant for any kind of problem or situation (not just coding). For any user input, analyze the situation, provide a clear problem statement, relevant context, and suggest several possible responses or actions the user could take next. Always explain your reasoning. Present your suggestions as a list of options or next steps.`;
  private defaultModel = "mistral-large-latest";
  private availableModels = [
    "mistral-large-latest",
    "mistral-medium-latest",
    "mistral-small-latest",
    "open-mixtral-8x7b"
  ];
  private temperature = 0.7;
  private maxTokens = 4096;

  initialize(config: AIProviderConfig): void {
    this.client = new Mistral({
      apiKey: config.apiKey,
      serverURL: config.baseUrl, // correct option name
    });

    if (config.systemPrompt) this.systemPrompt = config.systemPrompt;
    if (config.temperature !== undefined) this.temperature = config.temperature;
    if (config.maxTokens !== undefined) this.maxTokens = config.maxTokens;
  }

  getProviderName(): string { return "Mistral AI"; }
  getAvailableModels(): string[] { return this.availableModels; }
  getDefaultModel(): string { return this.defaultModel; }
  supportsImageAnalysis(): boolean { return false; }
  supportsAudioAnalysis(): boolean { return false; }

  private cleanJsonResponse(text: string): string {
    return text
      .replace(/^```(?:json)?\n/, "")
      .replace(/\n```$/, "")
      .trim();
  }

  private extractFirstText(res: any): string {
    const content = res.choices?.[0]?.message?.content;
    if (typeof content === "string") {
      return content;
    }
    if (Array.isArray(content)) {
      const txt = content.find((b: any) => b.type === "text" && typeof b.text === "string");
      return txt?.text ?? "";
    }
    return "";
  }

  async generateText(prompt: string): Promise<string> {
    if (!this.client) throw new Error("Mistral provider not initialized");

    const res = await this.client.chat.complete({
      model: this.defaultModel,
      messages: [
        { role: "system", content: this.systemPrompt },
        { role: "user",   content: prompt }
      ],
      temperature: this.temperature,
      maxTokens: this.maxTokens
    });

    return this.extractFirstText(res);
  }

  async extractProblemFromImages(_imagePaths: string[]): Promise<AIProblemExtraction> {
    throw new Error("Image analysis not supported by Mistral provider");
  }

  async generateSolution(problemInfo: any): Promise<AISolution> {
    if (!this.client) throw new Error("Mistral provider not initialized");

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
        { role: "user",   content: prompt }
      ],
      temperature: this.temperature,
      maxTokens: this.maxTokens
    });

    const raw = this.extractFirstText(res);
    const jsonText = this.cleanJsonResponse(raw);
    return JSON.parse(jsonText) as AISolution;
  }

  async debugSolutionWithImages(
    _problemInfo: any,
    _currentCode: string,
    _debugImagePaths: string[]
  ): Promise<AISolution> {
    throw new Error("Image analysis not supported by Mistral provider");
  }

  async analyzeAudioFile(_audioPath: string): Promise<AIAudioAnalysisResponse> {
    throw new Error("Audio analysis not supported by Mistral provider");
  }

  async analyzeAudioFromBase64(_data: string, _mimeType: string): Promise<AIAudioAnalysisResponse> {
    throw new Error("Audio analysis not supported by Mistral provider");
  }

  async analyzeImageFile(_imagePath: string): Promise<AIImageAnalysisResponse> {
    throw new Error("Image analysis not supported by Mistral provider");
  }
}
