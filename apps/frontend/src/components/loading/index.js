import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="sk-double-bounce loader">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
