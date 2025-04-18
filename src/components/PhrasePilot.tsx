import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import OnboardingScreen from './OnboardingScreen';
import AndroidBubble from './AndroidBubble';
import IOSKeyboard from './IOSKeyboard';
import { LLMConfig, defaultConfig } from '@/models/ConfigModel';
import { storageService } from '@/services/StorageService';
import { Settings, Smartphone, Keyboard, Info } from 'lucide-react';

const PhrasePilot: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [config, setConfig] = useState<LLMConfig>({ ...defaultConfig });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Capacitor info message
  const capacitorMessage = `
    In a real Flutter app, this would use Capacitor to:
    
    - On Android: Request SYSTEM_ALERT_WINDOW permission and create an overlay bubble
    - On iOS: Register a keyboard extension that communicates with the main app
    
    This is a web simulation to demonstrate the UI flows.
  `;
  
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const storedConfig = await storageService.getConfig();
        const configured = await storageService.isConfigured();
        
        setConfig(storedConfig);
        setIsConfigured(configured);
      } catch (error) {
        console.error('Error loading config:', error);
        toast({
          title: "Error",
          description: "Could not load configuration",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, []);
  
  const handleConfigComplete = async () => {
    try {
      const storedConfig = await storageService.getConfig();
      setConfig(storedConfig);
      setIsConfigured(true);
      toast({
        title: "Ready to use",
        description: "Phrase Pilot is now configured and ready to use!",
      });
    } catch (error) {
      console.error('Error after config completion:', error);
    }
  };
  
  const handleResetConfig = async () => {
    try {
      await storageService.clearConfig();
      setConfig({ ...defaultConfig });
      setIsConfigured(false);
      toast({
        title: "Configuration reset",
        description: "All settings have been cleared.",
      });
    } catch (error) {
      console.error('Error resetting config:', error);
      toast({
        title: "Error",
        description: "Could not reset configuration",
        variant: "destructive",
      });
    }
  };

  const toggleRephrasing = (value: boolean) => {
    setIsEnabled(value);
    toast({
      title: value ? "Enabled" : "Disabled",
      description: value 
        ? "Phrase Pilot is now active and ready to rephrase" 
        : "Phrase Pilot is now disabled",
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-phrase-primary animate-pulse-soft"></div>
          <p className="text-lg font-medium">Loading Phrase Pilot...</p>
        </div>
      </div>
    );
  }
  
  if (!isConfigured) {
    return <OnboardingScreen onComplete={handleConfigComplete} />;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-phrase-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Phrase Pilot Mobile</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch 
                id="rephrase-mode" 
                checked={isEnabled} 
                onCheckedChange={toggleRephrasing} 
              />
              <label htmlFor="rephrase-mode" className="text-sm font-medium">
                {isEnabled ? "Enabled" : "Disabled"}
              </label>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => toast({
                title: "Capacitor Integration Note",
                description: capacitorMessage,
              })}
            >
              <Info className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4">
        <Tabs defaultValue="android">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="android" className="flex-1">
              <Smartphone className="mr-2 h-4 w-4" />
              <span>Android Bubble</span>
            </TabsTrigger>
            <TabsTrigger value="ios" className="flex-1">
              <Keyboard className="mr-2 h-4 w-4" />
              <span>iOS Keyboard</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="android" className="mt-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold mb-2">Android Overlay Demo</h2>
              <p className="text-muted-foreground mb-4">
                Drag the bubble anywhere on the screen and tap to expand
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-8 h-96 relative border">
              <div className="flex justify-center">
                <div className="w-full max-w-sm pt-4">
                  <div className="rounded-t-xl bg-gray-200 h-6 flex justify-center items-center">
                    <div className="w-20 h-1 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-b-xl shadow-sm h-72">
                    <p className="text-center text-muted-foreground">
                      This area simulates other apps on your device
                    </p>
                  </div>
                </div>
              </div>
              
              {isEnabled && <AndroidBubble config={config} />}
            </div>
          </TabsContent>
          
          <TabsContent value="ios" className="mt-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold mb-2">iOS Keyboard Extension Demo</h2>
              <p className="text-muted-foreground mb-4">
                Type some text and click "Rephrase" to see it in action
              </p>
            </div>
            <div className="flex justify-center">
              <IOSKeyboard config={config} enabled={isEnabled} />
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-4">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-bold mb-4">Current Configuration</h2>
              
              <div className="bg-muted p-4 rounded-lg mb-6">
                <div className="grid grid-cols-3 gap-y-2">
                  <div className="font-medium">Provider:</div>
                  <div className="col-span-2">{config.provider}</div>
                  
                  <div className="font-medium">API URL:</div>
                  <div className="col-span-2 break-words">{config.apiUrl}</div>
                  
                  <div className="font-medium">API Key:</div>
                  <div className="col-span-2">••••••••••••••••</div>
                  
                  <div className="font-medium">Model:</div>
                  <div className="col-span-2">{config.modelName}</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsConfigured(false)}
                >
                  Reconfigure
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleResetConfig}
                >
                  Reset All Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-muted py-4 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Phrase Pilot Mobile - System-wide text rephrasing</p>
          <p className="text-xs mt-1">Simulated Flutter & Capacitor integration</p>
        </div>
      </footer>
    </div>
  );
};

export default PhrasePilot;
