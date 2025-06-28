// MistralProvider.ts - Implementation for Mistral AI

import MistralClient from "@mistralai/mistralai";
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
  private client: MistralClient | null = null;
  private systemPrompt: string = `You are Wingman AI, a helpful, proactive assistant for any kind of problem or situation (not just coding). For any user input, analyze the situation, provide a clear problem statement, relevant context, and suggest several possible responses or actions the user could take next. Always explain your reasoning. Present your suggestions as a list of options or next steps.`;
  private defaultModel: string = "mistral-large-latest";
  private availableModels: string[] = [
    "mistral-large-latest",
    "mistral-medium-latest",
    "mistral-small-latest",
    "open-mixtral-8x7b"
  ];
  private temperature: number = 0.7;
  private maxTokens: number = 4096;

  initialize(config: AIProviderConfig): void {
    this.client = new MistralClient(config.apiKey, {
      endpoint: config.baseUrl || undefined
    });
    
    if (config.systemPrompt) {
      this.systemPrompt = config.systemPrompt;
    }
    
    if (config.temperature !== undefined) {
      this.temperature = config.temperature;
    }
    
    if (config.maxTokens !== undefined) {
      this.maxTokens = config.maxTokens;
    }
  }

  getProviderName(): string {
    return "Mistral AI";
  }

  getAvailableModels(): string[] {
    return this.availableModels;
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  supportsImageAnalysis(): boolean {
    return false; // Mistral doesn't support image analysis natively yet
  }

  supportsAudioAnalysis(): boolean {
    return false; // Mistral doesn't support audio analysis natively
  }

  private cleanJsonResponse(text: string): string {
    // Remove markdown code block syntax if present
    text = text.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
    // Remove any leading/trailing whitespace
    text = text.trim();
    return text;
  }

  async generateText(prompt: string): Promise<string> {
    if (!this.client) {
      throw new Error("Mistral provider not initialized");
    }

    const response = await this.client.chat({
      model: this.defaultModel,
      messages: [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: this.temperature,
      maxTokens: this.maxTokens
    });

    return response.choices[0]?.message?.content || "";
  }

  async extractProblemFromImages(imagePaths: string[]): Promise<AIProblemExtraction> {
    // Mistral doesn't support image analysis natively yet
    throw new Error("Image analysis not supported by Mistral provider");
  }

  async generateSolution(problemInfo: any): Promise<AISolution> {
    if (!this.client) {
      throw new Error("Mistral provider not initialized");
    }

    const prompt = `Given this problem or situation:\n${JSON.stringify(problemInfo, null, 2)}\n\nPlease provide your response in the following JSON format:\n{
  "solution": {
    "code": "The code or main answer here.",
    "problem_statement": "Restate the problem or situation.",
    "context": "Relevant background/context.",
    "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
    "reasoning": "Explanation of why these suggestions are appropriate."
  }
}\nImportant: Return ONLY the JSON object, without any markdown formatting or code blocks.`;

    console.log("[MistralProvider] Calling Mistral for solution...");
    try {
      const response = await this.client.chat({
        model: this.defaultModel,
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: this.temperature,
        maxTokens: this.maxTokens
      });

      console.log("[MistralProvider] Mistral returned result.");
      const text = this.cleanJsonResponse(response.choices[0]?.message?.content || "");
      const parsed = JSON.parse(text);
      console.log("[MistralProvider] Parsed LLM response:", parsed);
      return parsed;
    } catch (error) {
      console.error("[MistralProvider] Error in generateSolution:", error);
      throw error;
    }
  }

  async debugSolutionWithImages(problemInfo: any, currentCode: string, debugImagePaths: string[]): Promise<AISolution> {
    // Mistral doesn't support image analysis natively yet
    throw new Error("Image analysis not supported by Mistral provider");
  }

  async analyzeAudioFile(audioPath: string): Promise<AIAudioAnalysisResponse> {
    // Mistral doesn't support audio analysis natively
    throw new Error("Audio analysis not supported by Mistral provider");
  }

  async analyzeAudioFromBase64(data: string, mimeType: string): Promise<AIAudioAnalysisResponse> {
    // Mistral doesn't support audio analysis natively
    throw new Error("Audio analysis not supported by Mistral provider");
  }

  async analyzeImageFile(imagePath: string): Promise<AIImageAnalysisResponse> {
    // Mistral doesn't support image analysis natively yet
    throw new Error("Image analysis not supported by Mistral provider");
  }
}