// OpenAIProvider.ts - Implementation for OpenAI

import OpenAI from "openai";
import fs from "fs";
import { 
  AIProvider, 
  AIProviderConfig, 
  AIImageAnalysisResponse, 
  AIAudioAnalysisResponse,
  AIProblemExtraction,
  AISolution
} from "./AIProvider";

export class OpenAIProvider implements AIProvider {
  private client: OpenAI | null = null;
  private systemPrompt: string = `You are Wingman AI, a helpful, proactive assistant for any kind of problem or situation (not just coding). For any user input, analyze the situation, provide a clear problem statement, relevant context, and suggest several possible responses or actions the user could take next. Always explain your reasoning. Present your suggestions as a list of options or next steps.`;
  private defaultModel: string = "gpt-4o";
  private availableModels: string[] = [
    "gpt-4o",
    "gpt-4-turbo",
    "gpt-4-vision-preview",
    "gpt-3.5-turbo"
  ];
  private temperature: number = 0.7;
  private maxTokens: number = 4096;

  initialize(config: AIProviderConfig): void {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || undefined
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
    return "OpenAI";
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
    return true;
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
      throw new Error("OpenAI provider not initialized");
    }

    const response = await this.client.chat.completions.create({
      model: this.defaultModel,
      messages: [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: this.temperature,
      max_tokens: this.maxTokens
    });

    return response.choices[0]?.message?.content || "";
  }

  async extractProblemFromImages(imagePaths: string[]): Promise<AIProblemExtraction> {
    if (!this.client) {
      throw new Error("OpenAI provider not initialized");
    }

    try {
      const imageContents = await Promise.all(
        imagePaths.map(async (path) => {
          const base64Image = await this.fileToBase64(path);
          return {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${base64Image}`
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

      const response = await this.client.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          { role: "system", content: this.systemPrompt },
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

      const text = this.cleanJsonResponse(response.choices[0]?.message?.content || "");
      return JSON.parse(text);
    } catch (error) {
      console.error("Error extracting problem from images:", error);
      throw error;
    }
  }

  async generateSolution(problemInfo: any): Promise<AISolution> {
    if (!this.client) {
      throw new Error("OpenAI provider not initialized");
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

    console.log("[OpenAIProvider] Calling OpenAI for solution...");
    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });

      console.log("[OpenAIProvider] OpenAI returned result.");
      const text = this.cleanJsonResponse(response.choices[0]?.message?.content || "");
      const parsed = JSON.parse(text);
      console.log("[OpenAIProvider] Parsed LLM response:", parsed);
      return parsed;
    } catch (error) {
      console.error("[OpenAIProvider] Error in generateSolution:", error);
      throw error;
    }
  }

  async debugSolutionWithImages(problemInfo: any, currentCode: string, debugImagePaths: string[]): Promise<AISolution> {
    if (!this.client) {
      throw new Error("OpenAI provider not initialized");
    }

    try {
      const imageContents = await Promise.all(
        debugImagePaths.map(async (path) => {
          const base64Image = await this.fileToBase64(path);
          return {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${base64Image}`
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

      const response = await this.client.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          { role: "system", content: this.systemPrompt },
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

      const text = this.cleanJsonResponse(response.choices[0]?.message?.content || "");
      const parsed = JSON.parse(text);
      console.log("[OpenAIProvider] Parsed debug LLM response:", parsed);
      return parsed;
    } catch (error) {
      console.error("Error debugging solution with images:", error);
      throw error;
    }
  }

  async analyzeAudioFile(audioPath: string): Promise<AIAudioAnalysisResponse> {
    if (!this.client) {
      throw new Error("OpenAI provider not initialized");
    }

    try {
      const transcription = await this.client.audio.transcriptions.create({
        file: await fs.promises.readFile(audioPath),
        model: "whisper-1",
      });

      const prompt = `Describe this audio transcript in a short, concise answer. In addition to your main answer, suggest several possible actions or responses the user could take next based on the audio. Do not return a structured JSON object, just answer naturally as you would to a user.\n\nTranscript: ${transcription.text}`;
      
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });

      return { 
        text: response.choices[0]?.message?.content || "", 
        timestamp: Date.now() 
      };
    } catch (error) {
      console.error("Error analyzing audio file:", error);
      throw error;
    }
  }

  async analyzeAudioFromBase64(data: string, mimeType: string): Promise<AIAudioAnalysisResponse> {
    if (!this.client) {
      throw new Error("OpenAI provider not initialized");
    }

    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(data, 'base64');
      
      // Create a temporary file
      const tempFilePath = `/tmp/audio-${Date.now()}.mp3`;
      await fs.promises.writeFile(tempFilePath, buffer);
      
      // Process the audio file
      const result = await this.analyzeAudioFile(tempFilePath);
      
      // Clean up the temporary file
      await fs.promises.unlink(tempFilePath);
      
      return result;
    } catch (error) {
      console.error("Error analyzing audio from base64:", error);
      throw error;
    }
  }

  async analyzeImageFile(imagePath: string): Promise<AIImageAnalysisResponse> {
    if (!this.client) {
      throw new Error("OpenAI provider not initialized");
    }

    try {
      const base64Image = await this.fileToBase64(imagePath);
      
      const prompt = `Describe the content of this image in a short, concise answer. In addition to your main answer, suggest several possible actions or responses the user could take next based on the image. Do not return a structured JSON object, just answer naturally as you would to a user. Be concise and brief.`;
      
      const response = await this.client.chat.completions.create({
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
                  url: `data:image/png;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });

      return { 
        text: response.choices[0]?.message?.content || "", 
        timestamp: Date.now() 
      };
    } catch (error) {
      console.error("Error analyzing image file:", error);
      throw error;
    }
  }
}