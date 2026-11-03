import React from 'react';
import { cn } from '../../utils/cn';

// 品牌示例资产，可在这里替换图形；与文字并排时不重复向屏幕阅读器朗读。
export default function AppLogo({ size, className, src, label }) {
  const appearance = {
    'data-slot': 'app-logo',
    className: cn('size-7 shrink-0 text-primary', className),
    style: size == null ? undefined : { width: size, height: size },
    'aria-hidden': label ? undefined : true
  };

  if (src) return <img {...appearance} src={src} alt={label || ''} className={cn(appearance.className, 'object-contain')} />;

  return (
    <svg {...appearance} viewBox="100 100 800 800" fill="none" role={label ? 'img' : undefined} aria-label={label} focusable="false" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M232 250h232c-51 49-54 123 17 174H212v344q0 20 20 20h485q20 0 20-20V563a31.5 31.5 0 0 1 63 0v206q0 81-81 81H232q-82 0-82-81V332q0-82 82-82Z" />
      <g stroke="currentColor" strokeWidth="63" strokeLinecap="round" strokeLinejoin="round">
        <path d="m326 548 75 75-75 75m149 0h76" />
      </g>
      <path fill="currentColor" d="M627 185c9-47 73-47 82 0 13 57 48 93 108 106 45 10 45 70 0 81-60 13-95 50-108 106-10 46-73 46-82 0-13-56-48-93-105-106-46-10-46-70 0-81 57-13 92-49 105-106Z" />
    </svg>
  );
}
