
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { LLMProvider, LLMConfig, defaultConfig } from '@/models/ConfigModel';
import { storageService } from '@/services/StorageService';
import { LLMServiceFactory } from '@/services/LLMService';
import { ArrowRight, Lock, Server, Key, Cpu, Sparkles } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [config, setConfig] = useState<LLMConfig>({ ...defaultConfig });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleProviderChange = (value: string) => {
    const provider = value as LLMProvider;
    let apiUrl = config.apiUrl;
    
    // Set default API URLs based on provider
    switch (provider) {
      case LLMProvider.OpenAI:
        apiUrl = 'https://api.openai.com/v1';
        break;
      case LLMProvider.HuggingFace:
        apiUrl = 'https://api-inference.huggingface.co/models';
        break;
      case LLMProvider.Azure:
        apiUrl = 'https://your-resource-name.openai.azure.com';
        break;
      case LLMProvider.Local:
        apiUrl = 'http://localhost:11434/api';
        break;
      case LLMProvider.Gemini:
        apiUrl = 'https://generativelanguage.googleapis.com';
        break;
    }
    
    setConfig({ ...config, provider: provider as LLMProvider, apiUrl });
  };
  
  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        return !!config.provider;
      case 2:
        return !!config.apiUrl;
      case 3:
        return !!config.apiKey;
      case 4:
        return !!config.modelName;
      default:
        return true;
    }
  };
  
  const testConnection = async () => {
    setIsLoading(true);
    try {
      const service = LLMServiceFactory.createService(config);
      const models = await service.listModels();
      
      if (models.length > 0) {
        toast({
          title: "Connection successful!",
          description: `Found ${models.length} models on the server.`,
          variant: "default",
        });
        return true;
      } else {
        toast({
          title: "Connection warning",
          description: "Connected to the server but no models were found.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Could not connect to the LLM server.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      try {
        // Test connection first
        const connectionSuccess = await testConnection();
        
        if (connectionSuccess) {
          // Save configuration
          await storageService.saveConfig({ ...config, isConfigured: true });
          toast({
            title: "Configuration saved",
            description: "Your LLM provider settings have been saved successfully.",
          });
          onComplete();
        }
      } catch (error) {
        toast({
          title: "Error saving configuration",
          description: "Please check your settings and try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Choose your LLM Provider</CardTitle>
              <CardDescription>
                Select which AI provider you want to use for text rephrasing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select 
                    value={config.provider} 
                    onValueChange={handleProviderChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LLMProvider.OpenAI}>
                        <div className="flex items-center">
                          <Server className="mr-2 h-4 w-4" />
                          <span>OpenAI</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={LLMProvider.HuggingFace}>
                        <div className="flex items-center">
                          <Server className="mr-2 h-4 w-4" />
                          <span>Hugging Face</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={LLMProvider.Azure}>
                        <div className="flex items-center">
                          <Server className="mr-2 h-4 w-4" />
                          <span>Azure OpenAI</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={LLMProvider.Local}>
                        <div className="flex items-center">
                          <Cpu className="mr-2 h-4 w-4" />
                          <span>Local LLM</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={LLMProvider.Gemini}>
                        <div className="flex items-center">
                          <Sparkles className="mr-2 h-4 w-4" />
                          <span>Gemini</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </>
        );
        
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">API Endpoint</CardTitle>
              <CardDescription>
                Enter the API URL for your {config.provider} service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="apiUrl">API URL</Label>
                  <Input
                    id="apiUrl"
                    type="text"
                    placeholder="Enter API URL"
                    value={config.apiUrl}
                    onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    {config.provider === LLMProvider.OpenAI && 
                      "Default: https://api.openai.com/v1"}
                    {config.provider === LLMProvider.HuggingFace && 
                      "Default: https://api-inference.huggingface.co/models"}
                    {config.provider === LLMProvider.Azure && 
                      "Format: https://your-resource-name.openai.azure.com"}
                    {config.provider === LLMProvider.Local && 
                      "For Ollama: http://localhost:11434/api"}
                  </p>
                </div>
              </div>
            </CardContent>
          </>
        );
        
      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">API Key</CardTitle>
              <CardDescription>
                Enter your {config.provider} API key
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="apiKey" className="flex items-center">
                    <Key className="mr-2 h-4 w-4" />
                    <span>API Key</span>
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your API key"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  />
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Lock className="mr-1 h-3 w-3" />
                    <span>Your key is stored securely on your device only</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        );
        
      case 4:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Model Selection</CardTitle>
              <CardDescription>
                Choose the model to use for rephrasing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="modelName">Model Name</Label>
                  <Input
                    id="modelName"
                    type="text"
                    placeholder="e.g., gpt-4o-mini, facebook/opt-6.7b"
                    value={config.modelName}
                    onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    {config.provider === LLMProvider.OpenAI && 
                      "Recommended: gpt-4o-mini or gpt-4o"}
                    {config.provider === LLMProvider.HuggingFace && 
                      "Example: meta-llama/Meta-Llama-3-8B"}
                    {config.provider === LLMProvider.Azure && 
                      "Your deployment name in Azure"}
                    {config.provider === LLMProvider.Local && 
                      "For Ollama: llama3 or mistral or other model you've pulled"}
                  </p>
                </div>
              </div>
            </CardContent>
          </>
        );
        
      case 5:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Ready to Go!</CardTitle>
              <CardDescription>
                Your configuration is ready to be saved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="font-medium">Provider:</div>
                    <div className="col-span-2">{config.provider}</div>
                    
                    <div className="font-medium">API URL:</div>
                    <div className="col-span-2 truncate">{config.apiUrl}</div>
                    
                    <div className="font-medium">API Key:</div>
                    <div className="col-span-2">••••••••••••••••</div>
                    
                    <div className="font-medium">Model:</div>
                    <div className="col-span-2">{config.modelName}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Click Finish to test the connection and save your settings.
                </p>
              </div>
            </CardContent>
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-phrase-light to-white p-4 dark:from-phrase-dark dark:to-gray-900">
      <Card className="w-full max-w-md">
        {renderStepContent()}
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1 || isLoading}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!validateStep() || isLoading}
            className="bg-phrase-primary hover:bg-phrase-primary/90"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                <span className="ml-2">Processing...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <span>{step === 5 ? "Finish" : "Next"}</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingScreen;
