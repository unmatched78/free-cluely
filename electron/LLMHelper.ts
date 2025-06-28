import { AIProviderFactory, ProviderType, AIProviderConfig } from "./ai-providers";

export class LLMHelper {
  private providerFactory: AIProviderFactory;
  private readonly systemPrompt = `You are Wingman AI, a helpful, proactive assistant for any kind of problem or situation (not just coding). For any user input, analyze the situation, provide a clear problem statement, relevant context, and suggest several possible responses or actions the user could take next. Always explain your reasoning. Present your suggestions as a list of options or next steps.`;

  constructor(apiKey: string, providerType: ProviderType = "gemini", model?: string) {
    this.providerFactory = AIProviderFactory.getInstance();
    
    // Initialize the provider
    const config: AIProviderConfig = {
      apiKey,
      model,
      systemPrompt: this.systemPrompt
    };
    
    this.providerFactory.initializeProvider(providerType, config);
    this.providerFactory.setActiveProvider(providerType);
  }

  public async extractProblemFromImages(imagePaths: string[]) {
    try {
      const provider = this.providerFactory.getActiveProvider();
      
      if (!provider.supportsImageAnalysis()) {
        throw new Error(`Provider ${provider.getProviderName()} does not support image analysis`);
      }
      
      return await provider.extractProblemFromImages(imagePaths);
    } catch (error) {
      console.error("Error extracting problem from images:", error);
      throw error;
    }
  }

  public async generateSolution(problemInfo: any) {
    console.log(`[LLMHelper] Calling ${this.providerFactory.getActiveProvider().getProviderName()} for solution...`);
    try {
      const provider = this.providerFactory.getActiveProvider();
      const result = await provider.generateSolution(problemInfo);
      console.log(`[LLMHelper] ${provider.getProviderName()} returned result.`);
      console.log("[LLMHelper] Parsed LLM response:", result);
      return result;
    } catch (error) {
      console.error("[LLMHelper] Error in generateSolution:", error);
      throw error;
    }
  }

  public async debugSolutionWithImages(problemInfo: any, currentCode: string, debugImagePaths: string[]) {
    try {
      const provider = this.providerFactory.getActiveProvider();
      
      if (!provider.supportsImageAnalysis()) {
        throw new Error(`Provider ${provider.getProviderName()} does not support image analysis`);
      }
      
      const result = await provider.debugSolutionWithImages(problemInfo, currentCode, debugImagePaths);
      console.log(`[LLMHelper] Parsed debug ${provider.getProviderName()} response:`, result);
      return result;
    } catch (error) {
      console.error("Error debugging solution with images:", error);
      throw error;
    }
  }

  public async analyzeAudioFile(audioPath: string) {
    try {
      const provider = this.providerFactory.getActiveProvider();
      
      if (!provider.supportsAudioAnalysis()) {
        throw new Error(`Provider ${provider.getProviderName()} does not support audio analysis`);
      }
      
      return await provider.analyzeAudioFile(audioPath);
    } catch (error) {
      console.error("Error analyzing audio file:", error);
      throw error;
    }
  }

  public async analyzeAudioFromBase64(data: string, mimeType: string) {
    try {
      const provider = this.providerFactory.getActiveProvider();
      
      if (!provider.supportsAudioAnalysis()) {
        throw new Error(`Provider ${provider.getProviderName()} does not support audio analysis`);
      }
      
      return await provider.analyzeAudioFromBase64(data, mimeType);
    } catch (error) {
      console.error("Error analyzing audio from base64:", error);
      throw error;
    }
  }

  public async analyzeImageFile(imagePath: string) {
    try {
      const provider = this.providerFactory.getActiveProvider();
      
      if (!provider.supportsImageAnalysis()) {
        throw new Error(`Provider ${provider.getProviderName()} does not support image analysis`);
      }
      
      return await provider.analyzeImageFile(imagePath);
    } catch (error) {
      console.error("Error analyzing image file:", error);
      throw error;
    }
  }
  
  public setProvider(providerType: ProviderType, config?: AIProviderConfig): void {
    if (config) {
      this.providerFactory.initializeProvider(providerType, config);
    }
    this.providerFactory.setActiveProvider(providerType);
  }
  
  public getAvailableProviders() {
    return this.providerFactory.getAvailableProviders();
  }
  
  public getCurrentProvider() {
    return {
      type: this.providerFactory.getActiveProviderType(),
      name: this.providerFactory.getActiveProvider().getProviderName(),
      models: this.providerFactory.getActiveProvider().getAvailableModels(),
      currentModel: this.providerFactory.getActiveProvider().getDefaultModel()
    };
  }
}