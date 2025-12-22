/**
 * NeuTooltip - Tooltip with Neumorphic Styling
 * Uses Radix UI Tooltip primitive
 */
import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const NEU_TOOLTIP_STYLES = {
  content: {
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      '4px 4px 8px var(--neu-shadow-dark, #c4c9cf), -4px -4px 8px var(--neu-shadow-light, #ffffff)',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    color: 'var(--neu-text-primary, #1e3a5f)',
    fontSize: '14px',
  },
};

const NeuTooltipProvider = TooltipPrimitive.Provider;

const NeuTooltip = TooltipPrimitive.Root;

const NeuTooltipTrigger = TooltipPrimitive.Trigger;

const NeuTooltipContent = React.forwardRef(
  ({ className, sideOffset = 4, style, ...props }, ref) => (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        className
      )}
      style={{ ...NEU_TOOLTIP_STYLES.content, ...style }}
      {...props}
    />
  )
);
NeuTooltipContent.displayName = 'NeuTooltipContent';

// UncontrolledTooltip - simplified API matching reactstrap
const NeuUncontrolledTooltip = ({ children, target, placement = 'top', ...props }) => {
  return (
    <NeuTooltipProvider>
      <NeuTooltip>
        <NeuTooltipTrigger asChild>
          <span>{target}</span>
        </NeuTooltipTrigger>
        <NeuTooltipContent side={placement} {...props}>
          {children}
        </NeuTooltipContent>
      </NeuTooltip>
    </NeuTooltipProvider>
  );
};
NeuUncontrolledTooltip.displayName = 'NeuUncontrolledTooltip';

export {
  NeuTooltipProvider,
  NeuTooltip,
  NeuTooltipTrigger,
  NeuTooltipContent,
  NeuUncontrolledTooltip,
};
