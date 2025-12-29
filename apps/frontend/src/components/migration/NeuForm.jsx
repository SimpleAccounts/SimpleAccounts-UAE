/**
 * NeuForm - Form wrapper component
 * Simple wrapper for HTML form with neumorphic styling context
 */
import React from 'react';
import { cn } from '@/lib/utils';

const NeuForm = React.forwardRef(
  ({ children, className, onSubmit, inline = false, style, ...props }, ref) => (
    <form
      ref={ref}
      className={cn(inline && 'flex flex-wrap items-center gap-4', className)}
      onSubmit={onSubmit}
      style={style}
      {...props}
    >
      {children}
    </form>
  )
);
NeuForm.displayName = 'NeuForm';

export { NeuForm };
