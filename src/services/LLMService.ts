
import { LLMConfig, LLMProvider, LLMResponse } from '../models/ConfigModel';

export interface LLMService {
  listModels(): Promise<string[]>;
  rephrase(text: string, options?: Record<string, unknown>): Promise<LLMResponse>;
}

export class OpenAIService implements LLMService {
  private config: LLMConfig;
  
  constructor(config: LLMConfig) {
    this.config = config;
  }
  
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data.map((model: any) => model.id);
    } catch (error) {
      console.error('Error listing models:', error);
      return [];
    }
  }
  
  async rephrase(text: string, options?: Record<string, unknown>): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.config.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages: [
            {
              role: "system",
              content: "You are a rephrase assistant. Rephrase the user's input while preserving meaning and tone. Return only valid JSON in the form {\"rephrased\":\"...\"}."
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: options?.temperature ?? 0.5,
          response_format: { type: "json_object" }
        }),
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          // Implement exponential backoff
          const retryAfter = response.headers.get('Retry-After') || '5';
          const delay = parseInt(retryAfter, 10) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.rephrase(text, options);
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsedContent = JSON.parse(content);
        return { rephrased: parsedContent.rephrased };
      } catch (e) {
        // Fallback if content isn't valid JSON
        return { rephrased: content };
      }
    } catch (error: any) {
      console.error('Error rephrasing text:', error);
      return { rephrased: '', error: error.message };
    }
  }
}

export class HuggingFaceService implements LLMService {
  private config: LLMConfig;
  
  constructor(config: LLMConfig) {
    this.config = config;
  }
  
  async listModels(): Promise<string[]> {
    // For HF, we'd typically return a list of recommended models
    // since there's no API endpoint to list all available models
    return [
      "meta-llama/Meta-Llama-3-8B",
      "meta-llama/Meta-Llama-3-70B",
      "mistralai/Mistral-7B-Instruct-v0.2",
      "mistralai/Mixtral-8x7B-Instruct-v0.1",
      "google/gemma-7b",
      "google/gemma-2b",
      "facebook/opt-6.7b"
    ];
  }
  
  async rephrase(text: string, options?: Record<string, unknown>): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.config.apiUrl}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `<s>[INST]You are a rephrase assistant. Rephrase the following text while preserving its meaning and tone. Return only valid JSON in the format {"rephrased":"..."}:\n\n${text}[/INST]</s>`,
          parameters: {
            temperature: options?.temperature ?? 0.5,
            max_new_tokens: 512,
            return_full_text: false
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      let content = data[0].generated_text;
      
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{.*\}/s);
        if (jsonMatch) {
          const parsedContent = JSON.parse(jsonMatch[0]);
          return { rephrased: parsedContent.rephrased };
        }
        // If no JSON found, return the raw text
        return { rephrased: content };
      } catch (e) {
        return { rephrased: content };
      }
    } catch (error: any) {
      console.error('Error rephrasing text:', error);
      return { rephrased: '', error: error.message };
    }
  }
}

export class AzureService implements LLMService {
  private config: LLMConfig;
  
  constructor(config: LLMConfig) {
    this.config = config;
  }
  
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/openai/deployments?api-version=2023-05-15`, {
        method: 'GET',
        headers: {
          'api-key': this.config.apiKey,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.value.map((model: any) => model.id);
    } catch (error) {
      console.error('Error listing models:', error);
      return [];
    }
  }
  
  async rephrase(text: string, options?: Record<string, unknown>): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.config.apiUrl}/openai/deployments/${this.config.modelName}/chat/completions?api-version=2023-05-15`, {
        method: 'POST',
        headers: {
          'api-key': this.config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are a rephrase assistant. Rephrase the user's input while preserving meaning and tone. Return only valid JSON in the form {\"rephrased\":\"...\"}."
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: options?.temperature ?? 0.5,
          response_format: { type: "json_object" }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsedContent = JSON.parse(content);
        return { rephrased: parsedContent.rephrased };
      } catch (e) {
        return { rephrased: content };
      }
    } catch (error: any) {
      console.error('Error rephrasing text:', error);
      return { rephrased: '', error: error.message };
    }
  }
}

export class LocalLLMService implements LLMService {
  private config: LLMConfig;
  
  constructor(config: LLMConfig) {
    this.config = config;
  }
  
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/models`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [this.config.modelName];
    } catch (error) {
      console.error('Error listing models:', error);
      return [this.config.modelName];
    }
  }
  
  async rephrase(text: string, options?: Record<string, unknown>): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.config.apiUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.modelName,
          prompt: `You are a rephrase assistant. Rephrase the following text while preserving its meaning and tone. Return only valid JSON in the format {"rephrased":"..."}:\n\n${text}`,
          temperature: options?.temperature ?? 0.5,
          max_tokens: 512,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      let content = data.response || data.output || data.generated_text || "";
      
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{.*\}/s);
        if (jsonMatch) {
          const parsedContent = JSON.parse(jsonMatch[0]);
          return { rephrased: parsedContent.rephrased };
        }
        // If no JSON found, return the raw text
        return { rephrased: content };
      } catch (e) {
        return { rephrased: content };
      }
    } catch (error: any) {
      console.error('Error rephrasing text:', error);
      return { rephrased: '', error: error.message };
    }
  }
}

export class LLMServiceFactory {
  static createService(config: LLMConfig): LLMService {
    switch (config.provider) {
      case LLMProvider.OpenAI:
        return new OpenAIService(config);
      case LLMProvider.HuggingFace:
        return new HuggingFaceService(config);
      case LLMProvider.Azure:
        return new AzureService(config);
      case LLMProvider.Local:
        return new LocalLLMService(config);
      default:
        return new OpenAIService(config);
    }
  }
}
