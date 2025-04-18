import React, { useState } from 'react';
import { LLMConfig } from '@/models/ConfigModel';
import { LLMServiceFactory } from '@/services/LLMService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Keyboard, ArrowRight, RotateCcw, MessageSquareText } from 'lucide-react';

interface IOSKeyboardProps {
  config: LLMConfig;
  enabled: boolean;
}

const IOSKeyboard: React.FC<IOSKeyboardProps> = ({ config, enabled }) => {
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const { toast } = useToast();
  
  const handleShowKeyboard = () => {
    setIsOpen(true);
  };
  
  const handleHideKeyboard = () => {
    setIsOpen(false);
  };
  
  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      setText(text.slice(0, -1));
    } else if (key === 'space') {
      setText(text + ' ');
    } else if (key === 'return') {
      setText(text + '\n');
    } else {
      setText(text + key);
    }
  };
  
  const handleRephrase = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to rephrase.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const service = LLMServiceFactory.createService(config);
      const result = await service.rephrase(text);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.rephrased) {
        setText(result.rephrased);
        toast({
          title: "Success",
          description: "Text has been rephrased!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to get a response from the LLM.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simulate an iOS keyboard layout
  const renderKeyboard = () => {
    const rows = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
    ];
    
    return (
      <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded-t-lg">
        <div className="flex justify-between items-center mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHideKeyboard}
            className="text-xs"
          >
            Hide
          </Button>
          {enabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRephrase}
              disabled={isLoading || !text.trim()}
              className="bg-phrase-primary text-white text-xs hover:bg-phrase-primary/90"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1"></div>
                  <span>Rephrasing...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span>Rephrase</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              )}
            </Button>
          )}
        </div>
        
        <div className="space-y-1">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center space-x-1">
              {row.map((key) => (
                <Button
                  key={key}
                  variant="secondary"
                  className={`h-10 ${key === 'backspace' ? 'w-16' : 'w-8'} text-xs sm:text-sm rounded-md`}
                  onClick={() => handleKeyPress(key)}
                >
                  {key === 'backspace' ? '⌫' : key}
                </Button>
              ))}
            </div>
          ))}
          <div className="flex justify-center space-x-1">
            <Button
              variant="secondary"
              className="h-10 w-8 text-xs sm:text-sm rounded-md"
              onClick={() => handleKeyPress(',')}
            >
              ,
            </Button>
            <Button
              variant="secondary"
              className="h-10 flex-1 text-xs sm:text-sm rounded-md"
              onClick={() => handleKeyPress('space')}
            >
              space
            </Button>
            <Button
              variant="secondary"
              className="h-10 w-8 text-xs sm:text-sm rounded-md"
              onClick={() => handleKeyPress('.')}
            >
              .
            </Button>
            <Button
              variant="secondary"
              className="h-10 w-16 text-xs sm:text-sm rounded-md"
              onClick={() => handleKeyPress('return')}
            >
              return
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="ios-keyboard-demo border rounded-lg overflow-hidden shadow-lg max-w-lg mx-auto">
      <div className="p-3 bg-white dark:bg-gray-900 border-b">
        <div 
          className="min-h-20 p-2 bg-gray-50 dark:bg-gray-800 rounded border"
          style={{ minHeight: '100px' }}
        >
          {text || <span className="text-gray-400">Type something or press the keyboard icon...</span>}
        </div>
        
        <div className="flex justify-end mt-2 gap-2">
          {enabled && text.trim() && !isOpen && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleRephrase}
              disabled={isLoading}
              className="bg-phrase-primary hover:bg-phrase-primary/90"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1"></div>
                  <span>Rephrasing...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <MessageSquareText className="h-4 w-4 mr-1" />
                  <span>Rephrase</span>
                </div>
              )}
            </Button>
          )}
          {!isOpen && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleShowKeyboard}
              className="h-8 w-8"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {isOpen && renderKeyboard()}
    </div>
  );
};

export default IOSKeyboard;
