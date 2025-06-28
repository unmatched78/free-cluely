// AIProvider.ts - Interface for all AI providers

export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIResponse {
  text: string;
  timestamp: number;
}

export interface AIImageAnalysisResponse extends AIResponse {}
export interface AIAudioAnalysisResponse extends AIResponse {}

export interface AIProblemExtraction {
  problem_statement: string;
  context: string;
  suggested_responses: string[];
  reasoning: string;
}

export interface AISolution {
  solution: {
    code: string;
    problem_statement: string;
    context: string;
    suggested_responses: string[];
    reasoning: string;
  };
}

export interface AIProvider {
  // Initialize the provider with configuration
  initialize(config: AIProviderConfig): void;
  
  // Get provider name
  getProviderName(): string;
  
  // Get available models for this provider
  getAvailableModels(): string[];
  
  // Get default model for this provider
  getDefaultModel(): string;
  
  // Check if provider supports image analysis
  supportsImageAnalysis(): boolean;
  
  // Check if provider supports audio analysis
  supportsAudioAnalysis(): boolean;
  
  // Process text prompt
  generateText(prompt: string): Promise<string>;
  
  // Extract problem from images
  extractProblemFromImages(imagePaths: string[]): Promise<AIProblemExtraction>;
  
  // Generate solution based on problem info
  generateSolution(problemInfo: any): Promise<AISolution>;
  
  // Debug solution with additional images
  debugSolutionWithImages(problemInfo: any, currentCode: string, debugImagePaths: string[]): Promise<AISolution>;
  
  // Analyze audio file
  analyzeAudioFile(audioPath: string): Promise<AIAudioAnalysisResponse>;
  
  // Analyze audio from base64
  analyzeAudioFromBase64(data: string, mimeType: string): Promise<AIAudioAnalysisResponse>;
  
  // Analyze image file
  analyzeImageFile(imagePath: string): Promise<AIImageAnalysisResponse>;
}