// AIProviderFactory.ts - Factory for creating and managing AI providers

import { AIProvider, AIProviderConfig } from "./AIProvider";
import { GeminiProvider } from "./GeminiProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { ClaudeProvider } from "./ClaudeProvider";
import { MistralProvider } from "./MistralProvider";

export type ProviderType = "gemini" | "openai" | "claude" | "mistral";

export class AIProviderFactory {
  private static instance: AIProviderFactory;
  private providers: Map<ProviderType, AIProvider> = new Map();
  private activeProvider: ProviderType = "gemini";

  private constructor() {
    // Initialize providers
    this.providers.set("gemini", new GeminiProvider());
    this.providers.set("openai", new OpenAIProvider());
    this.providers.set("claude", new ClaudeProvider());
    this.providers.set("mistral", new MistralProvider());
  }

  public static getInstance(): AIProviderFactory {
    if (!AIProviderFactory.instance) {
      AIProviderFactory.instance = new AIProviderFactory();
    }
    return AIProviderFactory.instance;
  }

  public initializeProvider(type: ProviderType, config: AIProviderConfig): void {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Provider type '${type}' not found`);
    }
    provider.initialize(config);
  }

  public setActiveProvider(type: ProviderType): void {
    if (!this.providers.has(type)) {
      throw new Error(`Provider type '${type}' not found`);
    }
    this.activeProvider = type;
  }

  public getActiveProvider(): AIProvider {
    const provider = this.providers.get(this.activeProvider);
    if (!provider) {
      throw new Error(`Active provider '${this.activeProvider}' not found`);
    }
    return provider;
  }

  public getProvider(type: ProviderType): AIProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Provider type '${type}' not found`);
    }
    return provider;
  }

  public getActiveProviderType(): ProviderType {
    return this.activeProvider;
  }

  public getAllProviderTypes(): ProviderType[] {
    return Array.from(this.providers.keys());
  }

  public getAvailableProviders(): { type: ProviderType; name: string }[] {
    return Array.from(this.providers.entries()).map(([type, provider]) => ({
      type,
      name: provider.getProviderName()
    }));
  }
}