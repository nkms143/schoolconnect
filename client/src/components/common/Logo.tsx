import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  href?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  subtitle = 'Student Network',
  className = '',
  href = '/',
  onClick
}) => {
  const sizeClasses = {
    sm: { box: 'w-8 h-8 rounded-lg p-0.5', text: 'text-base', sub: 'text-[9px]' },
    md: { box: 'w-10 h-10 rounded-xl p-1', text: 'text-xl', sub: 'text-[10px]' },
    lg: { box: 'w-12 h-12 rounded-2xl p-1.5', text: 'text-2xl', sub: 'text-xs' },
    xl: { box: 'w-16 h-16 rounded-3xl p-2', text: 'text-3xl', sub: 'text-sm' }
  };

  const { box, text, sub } = sizeClasses[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 flex-shrink-0 group ${className}`}>
      <div className={`${box} bg-black border border-slate-800 flex items-center justify-center shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform overflow-hidden`}>
        <img
          src="/logo.png"
          alt="SchoolConnect Logo"
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <div className="flex flex-col text-left">
          <span className={`${text} font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
            SchoolConnect
          </span>
          {subtitle && (
            <span className={`hidden sm:block ${sub} uppercase font-bold tracking-widest text-slate-400 -mt-1`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link to={href} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return content;
};
