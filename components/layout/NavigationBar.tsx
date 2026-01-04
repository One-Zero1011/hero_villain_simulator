
import React from 'react';
import { Building2, ShoppingBag } from 'lucide-react';

interface Props {
  currentView: 'CITY' | 'SHOP';
  onNavigate: (view: 'CITY' | 'SHOP') => void;
}

const NavigationBar: React.FC<Props> = ({ currentView, onNavigate }) => {
  return (
    <div className="bg-[#232323] border-b border-[#333333] sticky top-14 md:top-16 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-12">
        <button
          onClick={() => onNavigate('CITY')}
          className={`flex-1 sm:flex-none sm:w-32 h-full flex items-center justify-center gap-2 text-sm font-bold border-b-2 transition-colors
            ${currentView === 'CITY' 
              ? 'border-blue-500 text-white' 
              : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'}
          `}
        >
          <Building2 className="w-4 h-4" />
          메인 도시
        </button>
        
        <div className="w-px h-6 bg-[#333] mx-2 hidden sm:block"></div>

        <button
          onClick={() => onNavigate('SHOP')}
          className={`flex-1 sm:flex-none sm:w-32 h-full flex items-center justify-center gap-2 text-sm font-bold border-b-2 transition-colors
            ${currentView === 'SHOP' 
              ? 'border-yellow-500 text-white' 
              : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'}
          `}
        >
          <ShoppingBag className="w-4 h-4" />
          상점
        </button>
      </div>
    </div>
  );
};

export default NavigationBar;
