import React from 'react';
import { ArrowRightLeft, ChevronDown } from 'lucide-react';

interface HeaderProps {
  sourceLang: string;
  targetLang: string;
  setSourceLang: (lang: string) => void;
  setTargetLang: (lang: string) => void;
  onSwap: () => void;
}

const LANGUAGES = ['English', 'Korean', 'Khmer'];

export const Header: React.FC<HeaderProps> = ({ 
  sourceLang, 
  targetLang, 
  setSourceLang, 
  setTargetLang, 
  onSwap 
}) => {
  
  const LanguageSelector = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => (
    <div className="relative flex items-center gap-1 group cursor-pointer">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent text-base md:text-lg font-semibold text-gray-900 w-24 text-center cursor-pointer outline-none focus:text-blue-600 z-10"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>
      <ChevronDown size={14} className="text-gray-400 group-hover:text-blue-600 transition-colors absolute right-0 pointer-events-none" />
    </div>
  );

  return (
    <header className="flex justify-center items-center py-6 md:py-8">
      <div className="flex items-center gap-2 md:gap-8 bg-white px-6 py-2 rounded-full shadow-sm border border-gray-100">
        
        <LanguageSelector value={sourceLang} onChange={setSourceLang} />
        
        <button 
          onClick={onSwap}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
        >
          <ArrowRightLeft size={20} />
        </button>

        <LanguageSelector value={targetLang} onChange={setTargetLang} />
        
      </div>
    </header>
  );
};