import React, { useState, useRef, useEffect } from 'react';
import { LLMConfig } from '@/models/ConfigModel';
import { LLMServiceFactory } from '@/services/LLMService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Copy, RotateCcw, Pencil, X, Check, MessageSquareText } from 'lucide-react';

interface AndroidBubbleProps {
  config: LLMConfig;
}

const AndroidBubble: React.FC<AndroidBubbleProps> = ({ config }) => {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const [rephrased, setRephrased] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const { toast } = useToast();
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  // Simulated clipboard access for the web demo
  const getClipboardText = async (): Promise<string> => {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      return '';
    }
  };
  
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  };
  
  const handleBubbleClick = () => {
    if (!expanded) {
      setExpanded(true);
      // Try to get text from clipboard
      getClipboardText().then(clipText => {
        if (clipText) setText(clipText);
      });
    }
  };
  
  const handleClose = () => {
    setExpanded(false);
    setText('');
    setRephrased('');
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
        setRephrased(result.rephrased);
        toast({
          title: "Success",
          description: "Text has been rephrased successfully.",
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
  
  const handleCopy = async () => {
    if (rephrased) {
      const success = await copyToClipboard(rephrased);
      if (success) {
        toast({
          title: "Copied",
          description: "Rephrased text copied to clipboard",
        });
        // Auto-collapse after copying for better UX
        setTimeout(() => {
          setExpanded(false);
          setText('');
          setRephrased('');
        }, 1500);
      } else {
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard. Permission denied.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleRetry = () => {
    setRephrased('');
    handleRephrase();
  };
  
  const handleEdit = () => {
    setText(rephrased);
    setRephrased('');
  };
  
  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX - position.x, 
        y: e.touches[0].clientY - position.y 
      });
    }
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        setPosition({
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y
        });
        e.preventDefault(); // Prevent scrolling while dragging
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragStart]);
  
  return (
    <div 
      ref={bubbleRef}
      className="fixed z-50 select-none"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'all 0.1s ease-out'
      }}
    >
      {expanded ? (
        <div className="mini-dialog w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-lg">Phrase Pilot</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {!rephrased ? (
            <>
              <div className="space-y-3">
                <Textarea
                  placeholder="Enter text to rephrase..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-20"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleRephrase} 
                  className="w-full bg-phrase-primary hover:bg-phrase-primary/90 flex items-center justify-center gap-2"
                  disabled={isLoading || !text.trim()}
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      <span>Rephrasing...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquareText className="h-4 w-4" />
                      <span>Rephrase Text</span>
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-muted rounded-md p-3 mb-3 max-h-60 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{rephrased}</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="default" 
                  onClick={handleCopy}
                  className="flex-1 bg-phrase-primary hover:bg-phrase-primary/90"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  <span>Copy & Close</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRetry}
                  size="icon"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleEdit}
                  size="icon"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div
          className="bubble bg-phrase-primary text-white shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
          style={{ width: '56px', height: '56px', borderRadius: '28px' }}
          onClick={handleBubbleClick}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <MessageSquareText className="h-6 w-6" />
        </div>
      )}
    </div>
  );
};

export default AndroidBubble;
