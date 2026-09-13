import React from 'react';
import { ControllerButton } from '../controlsStore';

interface DPadProps {
  className?: string;
  size?: 'md' | 'lg';
  getButtonProps: (button: ControllerButton) => React.ButtonHTMLAttributes<HTMLButtonElement>;
}

export const DPad: React.FC<DPadProps> = ({ className = '', size = 'lg', getButtonProps }) => {
  const sizeClasses = size === 'lg' ? 'w-32 h-32' : 'w-28 h-28';

  return (
    <div className={`relative select-none drop-shadow-lg ${sizeClasses} ${className}`}>
      {/* Background well / cross shadow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 bottom-0 left-1/3 right-1/3 bg-black/30 rounded-sm" />
        <div className="absolute left-0 right-0 top-1/3 bottom-1/3 bg-black/30 rounded-sm" />
      </div>

      {/* UP button */}
      <button
        type="button"
        {...getButtonProps('UP')}
        className="absolute top-0 left-1/3 right-1/3 h-1/3 dpad-button rounded-t-sm flex flex-col items-center justify-start pt-1.5 focus:outline-none"
      >
        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-gray-400 pointer-events-none" />
      </button>

      {/* DOWN button */}
      <button
        type="button"
        {...getButtonProps('DOWN')}
        className="absolute bottom-0 left-1/3 right-1/3 h-1/3 dpad-button rounded-b-sm flex flex-col items-center justify-end pb-1.5 focus:outline-none"
      >
        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-gray-400 pointer-events-none" />
      </button>

      {/* LEFT button */}
      <button
        type="button"
        {...getButtonProps('LEFT')}
        className="absolute left-0 top-1/3 bottom-1/3 w-1/3 dpad-button rounded-l-sm flex items-center justify-start pl-1.5 focus:outline-none"
      >
        <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-gray-400 pointer-events-none" />
      </button>

      {/* RIGHT button */}
      <button
        type="button"
        {...getButtonProps('RIGHT')}
        className="absolute right-0 top-1/3 bottom-1/3 w-1/3 dpad-button rounded-r-sm flex items-center justify-end pr-1.5 focus:outline-none"
      >
        <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-gray-400 pointer-events-none" />
      </button>

      {/* Center pivot */}
      <div className="absolute top-1/3 bottom-1/3 left-1/3 right-1/3 bg-[#333] flex items-center justify-center pointer-events-none border border-black/40">
        <div className="w-3.5 h-3.5 bg-[#202020] rounded-full shadow-inner border border-black/30" />
      </div>
    </div>
  );
};
