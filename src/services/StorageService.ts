
import { LLMConfig, defaultConfig } from '../models/ConfigModel';

// This is a mock implementation of secure storage for the web demo
// In a real Flutter app, this would use flutter_secure_storage
export class StorageService {
  private readonly CONFIG_KEY = 'phrase_pilot_config';
  
  async saveConfig(config: LLMConfig): Promise<void> {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  }
  
  async getConfig(): Promise<LLMConfig> {
    try {
      const storedConfig = localStorage.getItem(this.CONFIG_KEY);
      if (!storedConfig) return { ...defaultConfig };
      
      return JSON.parse(storedConfig) as LLMConfig;
    } catch (error) {
      console.error('Error getting config:', error);
      return { ...defaultConfig };
    }
  }
  
  async isConfigured(): Promise<boolean> {
    try {
      const config = await this.getConfig();
      return config.isConfigured && !!config.apiKey;
    } catch (error) {
      return false;
    }
  }
  
  async clearConfig(): Promise<void> {
    try {
      localStorage.removeItem(this.CONFIG_KEY);
    } catch (error) {
      console.error('Error clearing config:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
