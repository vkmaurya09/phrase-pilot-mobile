
export interface LLMConfig {
  provider: LLMProvider;
  apiUrl: string;
  apiKey: string;
  modelName: string;
  isConfigured: boolean;
}

export enum LLMProvider {
  OpenAI = "OpenAI",
  HuggingFace = "Hugging Face",
  Azure = "Azure",
  Local = "Local"
}

export const defaultConfig: LLMConfig = {
  provider: LLMProvider.OpenAI,
  apiUrl: "https://api.openai.com/v1",
  apiKey: "",
  modelName: "gpt-4o-mini",
  isConfigured: false
};

export interface LLMResponse {
  rephrased: string;
  error?: string;
}
