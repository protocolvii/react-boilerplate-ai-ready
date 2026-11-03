import React from 'react';
import config from '../../config';
import { cn } from '../../utils/cn';
import AppLogo from '../AppLogo';

export default function BrandIdentity({ className, textClassName, name = config.app.title, showLogo = config.app.showLogo, logoSize = config.app.logoSize, logoSrc = config.app.logoSrc }) {
  return (
    <span data-slot="brand-identity" className={cn('flex min-w-0 items-center gap-2', className)}>
      {showLogo && <AppLogo size={logoSize} src={logoSrc} />}
      <span className={cn('min-w-0 truncate', textClassName)}>{name}</span>
    </span>
  );
}
