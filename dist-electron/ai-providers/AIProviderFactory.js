"use strict";
// AIProviderFactory.ts - Factory for creating and managing AI providers
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIProviderFactory = void 0;
const GeminiProvider_1 = require("./GeminiProvider");
const OpenAIProvider_1 = require("./OpenAIProvider");
const ClaudeProvider_1 = require("./ClaudeProvider");
const MistralProvider_1 = require("./MistralProvider");
class AIProviderFactory {
    static instance;
    providers = new Map();
    activeProvider = "gemini";
    constructor() {
        // Initialize providers
        this.providers.set("gemini", new GeminiProvider_1.GeminiProvider());
        this.providers.set("openai", new OpenAIProvider_1.OpenAIProvider());
        this.providers.set("claude", new ClaudeProvider_1.ClaudeProvider());
        this.providers.set("mistral", new MistralProvider_1.MistralProvider());
    }
    static getInstance() {
        if (!AIProviderFactory.instance) {
            AIProviderFactory.instance = new AIProviderFactory();
        }
        return AIProviderFactory.instance;
    }
    initializeProvider(type, config) {
        const provider = this.providers.get(type);
        if (!provider) {
            throw new Error(`Provider type '${type}' not found`);
        }
        provider.initialize(config);
    }
    setActiveProvider(type) {
        if (!this.providers.has(type)) {
            throw new Error(`Provider type '${type}' not found`);
        }
        this.activeProvider = type;
    }
    getActiveProvider() {
        const provider = this.providers.get(this.activeProvider);
        if (!provider) {
            throw new Error(`Active provider '${this.activeProvider}' not found`);
        }
        return provider;
    }
    getProvider(type) {
        const provider = this.providers.get(type);
        if (!provider) {
            throw new Error(`Provider type '${type}' not found`);
        }
        return provider;
    }
    getActiveProviderType() {
        return this.activeProvider;
    }
    getAllProviderTypes() {
        return Array.from(this.providers.keys());
    }
    getAvailableProviders() {
        return Array.from(this.providers.entries()).map(([type, provider]) => ({
            type,
            name: provider.getProviderName()
        }));
    }
}
exports.AIProviderFactory = AIProviderFactory;
//# sourceMappingURL=AIProviderFactory.js.map