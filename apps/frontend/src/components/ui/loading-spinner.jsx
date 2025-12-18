import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ size = 'default', className }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeClasses[size], className)}
      aria-hidden="true"
    />
  );
}

export function LoadingOverlay({ message, submessage }) {
  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
          <LoadingSpinner size="xl" className="absolute inset-0 m-auto" />
        </div>
        {message && (
          <div className="text-center space-y-1">
            <p className="text-lg font-medium text-foreground">{message}</p>
            {submessage && <p className="text-sm text-muted-foreground">{submessage}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export function ButtonSpinner({ className }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} aria-hidden="true" />;
}

export function SkeletonCard() {
  return (
    <div className="w-full max-w-md p-6 space-y-4 animate-pulse" role="status" aria-label="Loading">
      <div className="flex justify-center">
        <div className="h-16 w-32 bg-muted rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-8 w-3/4 mx-auto bg-muted rounded" />
        <div className="h-4 w-1/2 mx-auto bg-muted rounded" />
      </div>
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
        </div>
        <div className="h-10 w-full bg-muted rounded" />
      </div>
      <span className="sr-only">Loading form...</span>
    </div>
  );
}

export default LoadingSpinner;
