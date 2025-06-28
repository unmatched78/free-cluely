// ClaudeProvider.ts - Implementation for Anthropic's Claude

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import { 
  AIProvider, 
  AIProviderConfig, 
  AIImageAnalysisResponse, 
  AIAudioAnalysisResponse,
  AIProblemExtraction,
  AISolution
} from "./AIProvider";

export class ClaudeProvider implements AIProvider {
  private client: Anthropic | null = null;
  private systemPrompt: string = `You are Wingman AI, a helpful, proactive assistant for any kind of problem or situation (not just coding). For any user input, analyze the situation, provide a clear problem statement, relevant context, and suggest several possible responses or actions the user could take next. Always explain your reasoning. Present your suggestions as a list of options or next steps.`;
  private defaultModel: string = "claude-3-opus-20240229";
  private availableModels: string[] = [
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307"
  ];
  private temperature: number = 0.7;
  private maxTokens: number = 4096;

  initialize(config: AIProviderConfig): void {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl
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
    return "Anthropic Claude";
  }

  getAvailableModels(): string[] {
    return this.availableModels;
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  supportsImageAnalysis(): boolean {
    return true;
  }

  supportsAudioAnalysis(): boolean {
    return false; // Claude doesn't natively support audio analysis
  }

  private async fileToBase64(filePath: string): Promise<string> {
    const data = await fs.promises.readFile(filePath);
    return data.toString("base64");
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
      throw new Error("Claude provider not initialized");
    }

    const response = await this.client.messages.create({
      model: this.defaultModel,
      system: this.systemPrompt,
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: this.temperature,
      max_tokens: this.maxTokens
    });

    return response.content[0]?.text || "";
  }

  async extractProblemFromImages(imagePaths: string[]): Promise<AIProblemExtraction> {
    if (!this.client) {
      throw new Error("Claude provider not initialized");
    }

    try {
      const imageContents = await Promise.all(
        imagePaths.map(async (path) => {
          const base64Image = await this.fileToBase64(path);
          const mimeType = path.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
          return {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType,
              data: base64Image
            }
          };
        })
      );

      const prompt = `Please analyze these images and extract the following information in JSON format:
{
  "problem_statement": "A clear statement of the problem or situation depicted in the images.",
  "context": "Relevant background or context from the images.",
  "suggested_responses": ["First possible answer or action", "Second possible answer or action", "..."],
  "reasoning": "Explanation of why these suggestions are appropriate."
}
Important: Return ONLY the JSON object, without any markdown formatting or code blocks.`;

      const response = await this.client.messages.create({
        model: this.defaultModel,
        system: this.systemPrompt,
        messages: [
          { 
            role: "user", 
            content: [
              { type: "text", text: prompt },
              ...imageContents
            ]
          }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });

      const text = this.cleanJsonResponse(response.content[0]?.text || "");
      return JSON.parse(text);
    } catch (error) {
      console.error("Error extracting problem from images:", error);
      throw error;
    }
  }

  async generateSolution(problemInfo: any): Promise<AISolution> {
    if (!this.client) {
      throw new Error("Claude provider not initialized");
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

    console.log("[ClaudeProvider] Calling Claude for solution...");
    try {
      const response = await this.client.messages.create({
        model: this.defaultModel,
        system: this.systemPrompt,
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });

      console.log("[ClaudeProvider] Claude returned result.");
      const text = this.cleanJsonResponse(response.content[0]?.text || "");
      const parsed = JSON.parse(text);
      console.log("[ClaudeProvider] Parsed LLM response:", parsed);
      return parsed;
    } catch (error) {
      console.error("[ClaudeProvider] Error in generateSolution:", error);
      throw error;
    }
  }

  async debugSolutionWithImages(problemInfo: any, currentCode: string, debugImagePaths: string[]): Promise<AISolution> {
    if (!this.client) {
      throw new Error("Claude provider not initialized");
    }

    try {
      const imageContents = await Promise.all(
        debugImagePaths.map(async (path) => {
          const base64Image = await this.fileToBase64(path);
          const mimeType = path.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
          return {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType,
              data: base64Image
            }
          };
        })
      );

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
Important: Return ONLY the JSON object, without any markdown formatting or code blocks.`;

      const response = await this.client.messages.create({
        model: this.defaultModel,
        system: this.systemPrompt,
        messages: [
          { 
            role: "user", 
            content: [
              { type: "text", text: prompt },
              ...imageContents
            ]
          }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });

      const text = this.cleanJsonResponse(response.content[0]?.text || "");
      const parsed = JSON.parse(text);
      console.log("[ClaudeProvider] Parsed debug LLM response:", parsed);
      return parsed;
    } catch (error) {
      console.error("Error debugging solution with images:", error);
      throw error;
    }
  }

  async analyzeAudioFile(audioPath: string): Promise<AIAudioAnalysisResponse> {
    // Claude doesn't natively support audio analysis
    // We could implement a workaround using a transcription service and then Claude
    throw new Error("Audio analysis not supported by Claude provider");
  }

  async analyzeAudioFromBase64(data: string, mimeType: string): Promise<AIAudioAnalysisResponse> {
    // Claude doesn't natively support audio analysis
    throw new Error("Audio analysis not supported by Claude provider");
  }

  async analyzeImageFile(imagePath: string): Promise<AIImageAnalysisResponse> {
    if (!this.client) {
      throw new Error("Claude provider not initialized");
    }

    try {
      const base64Image = await this.fileToBase64(imagePath);
      const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      const prompt = `Describe the content of this image in a short, concise answer. In addition to your main answer, suggest several possible actions or responses the user could take next based on the image. Do not return a structured JSON object, just answer naturally as you would to a user. Be concise and brief.`;
      
      const response = await this.client.messages.create({
        model: this.defaultModel,
        system: this.systemPrompt,
        messages: [
          { 
            role: "user", 
            content: [
              { type: "text", text: prompt },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType,
                  data: base64Image
                }
              }
            ]
          }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });

      return { 
        text: response.content[0]?.text || "", 
        timestamp: Date.now() 
      };
    } catch (error) {
      console.error("Error analyzing image file:", error);
      throw error;
    }
  }
}