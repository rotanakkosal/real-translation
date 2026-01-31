import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './Header';
import { TranslationCard } from './TranslationCard';
import { ActionBar } from './ActionBar';
import { translateText } from '../services/translationService';
import { AlertCircle, X } from 'lucide-react';

// Debounce hook to prevent excessive API calls
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const TranslationInterface: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Korean');
  const [isPolite, setIsPolite] = useState(true); // Default to Polite/Formal
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null); // Type 'any' for window.webkitSpeechRecognition

  const debouncedInputText = useDebounce(inputText, 600); // 600ms debounce

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Set language based on source
      if (sourceLang === 'English') recognitionRef.current.lang = 'en-US';
      else if (sourceLang === 'Korean') recognitionRef.current.lang = 'ko-KR';
      else if (sourceLang === 'Khmer') recognitionRef.current.lang = 'km-KH';
      
      try {
        recognitionRef.current.start();
        setError(null);
      } catch (e) {
        console.error("Speech recognition error", e);
        setError("Could not start microphone.");
      }
    }
  };

  const performTranslation = useCallback(async (text: string) => {
    if (!text.trim()) {
      setOutputText('');
      setError(null);
      return;
    }
    
    // Clear previous errors when starting new translation attempt
    setError(null); 

    const result = await translateText({
      text,
      sourceLang,
      targetLang,
      isPolite: (targetLang === 'Korean' || targetLang === 'Khmer') ? isPolite : undefined
    });
    
    if (result.error) {
      setError(result.error);
      setOutputText(""); 
    } else {
      setOutputText(result.text);
    }
  }, [sourceLang, targetLang, isPolite]);

  // Effect to trigger translation when text changes (debounced)
  useEffect(() => {
    performTranslation(debouncedInputText);
  }, [debouncedInputText, performTranslation]);

  // Handle immediate re-translation if nuance changes (no debounce needed if text exists)
  useEffect(() => {
    if (debouncedInputText) {
      performTranslation(debouncedInputText);
    }
  }, [isPolite, performTranslation]); // Only depends on isPolite change here + text existence

  const handleSwapLanguages = () => {
    // When swapping, the 'sourceLang' (which becomes the new target) determines if we reset polite state
    const newTarget = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(outputText); // Swap text too
    setOutputText(inputText);
    setError(null);
    
    // Reset nuance to Polite if the new target supports it
    if (newTarget === 'Korean' || newTarget === 'Khmer') {
      setIsPolite(true); 
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-12">
      <Header 
        sourceLang={sourceLang} 
        targetLang={targetLang}
        setSourceLang={setSourceLang}
        setTargetLang={setTargetLang}
        onSwap={handleSwapLanguages} 
      />

      {/* Error Alert */}
      {error && (
        <div className="mb-6 mx-auto max-w-2xl bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="p-1 -mr-1 rounded-full text-red-400 hover:text-red-700 hover:bg-red-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 md:gap-8 mt-2">
        {/* Input Card */}
        <div className="w-full md:w-1/2">
          <TranslationCard
            type="input"
            language={sourceLang}
            text={inputText}
            setText={setInputText}
            placeholder="Enter text..."
            onMicClick={handleMicClick}
            isListening={isListening}
            onClear={() => {
                setInputText('');
                setOutputText('');
                setError(null);
            }}
          />
        </div>

        {/* Output Card */}
        <div className="w-full md:w-1/2">
          <TranslationCard
            type="output"
            language={targetLang}
            text={outputText}
            placeholder="..."
            readOnly={true}
            isPolite={isPolite}
            onToggleNuance={setIsPolite}
          />
        </div>
      </div>

      <ActionBar />
    </div>
  );
};