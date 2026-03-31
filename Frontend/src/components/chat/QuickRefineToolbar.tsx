import React from "react";
import { Scissors, Briefcase, List, RotateCcw } from "lucide-react";

interface QuickRefineToolbarProps {
  onRefine: (prompt: string) => void;
}

const QuickRefineToolbar: React.FC<QuickRefineToolbarProps> = ({ onRefine }) => {
  const actions = [
    { 
      id: "shorten", 
      label: "Shorten", 
      icon: <Scissors className="h-3 w-3" />, 
      prompt: "Summarize the previous response to be much shorter." 
    },
    { 
      id: "pro", 
      label: "Professional", 
      icon: <Briefcase className="h-3 w-3" />, 
      prompt: "Rewrite the previous response in a professional, formal tone." 
    },
    { 
      id: "list", 
      label: "Listify", 
      icon: <List className="h-3 w-3" />, 
      prompt: "Convert the previous response into a bulleted list." 
    },
    { 
      id: "retry", 
      label: "Retry", 
      icon: <RotateCcw className="h-3 w-3" />, 
      prompt: "Regenerate the previous response." 
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out justify-start">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onRefine(action.prompt)}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-white hover:bg-purple-50 border border-gray-200 rounded-md transition-all shadow-sm text-gray-600 hover:text-purple-700 hover:border-purple-200"
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default QuickRefineToolbar;