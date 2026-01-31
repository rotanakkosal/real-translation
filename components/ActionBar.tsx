import React from 'react';
import { BookOpen, Globe, Star, Camera, History } from 'lucide-react';

export const ActionBar: React.FC = () => {
  const actions = [
    { icon: <Globe size={24} />, label: "Alternative" },
    { icon: <BookOpen size={24} />, label: "Dictionary" },
    { icon: <Star size={24} />, label: "Saved" },
    { icon: <Camera size={24} />, label: "Camera" },
  ];

  return (
    <div className="mt-8 grid grid-cols-4 gap-4 max-w-2xl mx-auto">
      {actions.map((action, index) => (
        <button 
          key={index}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-blue-600 group"
        >
          <div className="group-hover:scale-110 transition-transform duration-200">
            {action.icon}
          </div>
          <span className="text-xs font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  );
};