import React, { useRef, useEffect } from 'react';
import { Copy, Mic, Volume2, X, MessageCircle, Briefcase } from 'lucide-react';

interface TranslationCardProps {
  type: 'input' | 'output';
  language: string;
  text: string;
  setText?: (text: string) => void;
  onMicClick?: () => void;
  isListening?: boolean;
  onClear?: () => void;
  placeholder?: string;
  isPolite?: boolean;
  onToggleNuance?: (isPolite: boolean) => void;
  readOnly?: boolean;
}

export const TranslationCard: React.FC<TranslationCardProps> = ({
  type,
  language,
  text,
  setText,
  onMicClick,
  isListening,
  onClear,
  placeholder,
  isPolite,
  onToggleNuance,
  readOnly = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize text area
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  const handleCopy = async () => {
    if (text) {
      await navigator.clipboard.writeText(text);
      // Optional: Show toast or feedback
    }
  };

  const handleSpeak = () => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language
    if (language === 'English') utterance.lang = 'en-US';
    else if (language === 'Korean') utterance.lang = 'ko-KR';
    else if (language === 'Khmer') utterance.lang = 'km-KH';
    else if (language === 'French') utterance.lang = 'fr-FR';
    
    window.speechSynthesis.speak(utterance);
  };

  const getNuanceConfig = () => {
    if (language === 'Khmer') {
      return {
        casual: { 
          label: 'General', 
          icon: <MessageCircle size={14} className="stroke-[2.5]" />,
          example: 'e.g. ទៅណា?' 
        },
        polite: { 
          label: 'Formal', 
          icon: <Briefcase size={14} className="stroke-[2.5]" />,
          example: 'e.g. លោកអ្នកទៅណា?'
        }
      };
    }
    // Default to Korean labels
    return {
      casual: { label: 'Casual', icon: <MessageCircle size={14} className="stroke-[2.5]" />, example: null },
      polite: { label: 'Polite', icon: <Briefcase size={14} className="stroke-[2.5]" />, example: null }
    };
  };

  const nuanceConfig = getNuanceConfig();

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col h-[320px] md:h-[400px] relative transition-all duration-300 hover:shadow-md border border-gray-100">
      {/* Header inside card (Language label + Nuance Toggle for Output) */}
      <div className="flex justify-between items-center mb-4 min-h-[36px]">
        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide px-1">
          {language}
        </span>
        
        {type === 'output' && (language === 'Korean' || language === 'Khmer') && onToggleNuance && (
          <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
            <button
              onClick={() => onToggleNuance(false)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-full font-semibold transition-all duration-200 ${
                !isPolite 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              {nuanceConfig.casual.icon}
              <span className="flex items-center gap-1">
                {nuanceConfig.casual.label}
                {nuanceConfig.casual.example && (
                  <span className="hidden sm:inline-block font-normal opacity-60 text-[10px]">
                    {nuanceConfig.casual.example}
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => onToggleNuance(true)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-full font-semibold transition-all duration-200 ${
                isPolite 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              {nuanceConfig.polite.icon}
              <span className="flex items-center gap-1">
                {nuanceConfig.polite.label}
                {nuanceConfig.polite.example && (
                  <span className="hidden sm:inline-block font-normal opacity-60 text-[10px]">
                    {nuanceConfig.polite.example}
                  </span>
                )}
              </span>
            </button>
          </div>
        )}

        {/* Speak button for output inside the header area */}
        {type === 'output' && (
          <div className={!((language === 'Korean' || language === 'Khmer') && onToggleNuance) ? 'ml-auto' : ''}>
             <button 
              onClick={handleSpeak}
              className="p-2 rounded-full hover:bg-gray-50 text-gray-400 hover:text-blue-600 transition-colors"
              title="Read aloud"
            >
              <Volume2 size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Text Area */}
      <textarea
        ref={textareaRef}
        className={`w-full flex-grow bg-transparent border-none outline-none resize-none text-2xl md:text-3xl font-medium text-gray-800 placeholder-gray-300 leading-tight`}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText && setText(e.target.value)}
        readOnly={readOnly}
        spellCheck="false"
      />

      {/* Bottom Actions */}
      <div className="mt-4 flex justify-between items-end">
        {/* Left Side: Clear button (Input only) */}
        <div>
          {type === 'input' && text && (
            <button 
              onClick={onClear}
              className="text-gray-400 hover:text-gray-600 font-medium text-sm flex items-center gap-1 py-2 px-1"
            >
              <X size={16} /> Clear
            </button>
          )}
          {/* Placeholder for empty space if no clear button */}
          {type === 'output' && (
             <span className="text-gray-300 text-sm px-1 py-2 block">Real-time</span>
          )}
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3">
            
          {/* Copy Button */}
          {text && (
            <button 
              onClick={handleCopy}
              className="p-3 rounded-full hover:bg-gray-50 text-gray-400 hover:text-blue-600 transition-colors"
              title="Copy"
            >
              <Copy size={22} />
            </button>
          )}

          {/* Mic Button (Input only) */}
          {type === 'input' && (
            <div className="flex items-center gap-3 ml-2">
              {/* Audio Waveform Visualization */}
              {isListening && (
                <div className="flex items-end gap-1 h-5 pb-1">
                  <div className="w-1 bg-red-400 rounded-full animate-pulse h-2"></div>
                  <div className="w-1 bg-red-400 rounded-full animate-pulse delay-75 h-4"></div>
                  <div className="w-1 bg-red-400 rounded-full animate-pulse delay-150 h-2"></div>
                </div>
              )}

              <div className="relative">
                {/* Ping Ring Animation */}
                {isListening && (
                  <span className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping"></span>
                )}
                
                {/* Main Mic Button */}
                <button
                  onClick={onMicClick}
                  className={`relative z-10 p-3 rounded-full transition-all duration-300 flex items-center justify-center ${
                    isListening 
                      ? 'bg-red-500 text-white shadow-lg ring-4 ring-red-50 scale-105' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isListening ? "Stop listening" : "Start listening"}
                >
                  <Mic size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};