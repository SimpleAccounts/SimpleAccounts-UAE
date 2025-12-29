/**
 * NeuLayout - Layout Components (Row, Col, Container)
 * These are thin wrappers around Bootstrap's grid - kept for API compatibility
 */
import React from 'react';
import { cn } from '@/lib/utils';

// Row - Bootstrap grid row
const NeuRow = React.forwardRef(({ children, className, style, ...props }, ref) => (
  <div ref={ref} className={cn('row', className)} style={style} {...props}>
    {children}
  </div>
));
NeuRow.displayName = 'NeuRow';

// Col - Bootstrap grid column
const NeuCol = React.forwardRef(
  ({ children, className, xs, sm, md, lg, xl, xxl, style, ...props }, ref) => {
    const colClasses = [
      xs && (xs === true ? 'col' : `col-${xs}`),
      sm && `col-sm-${sm}`,
      md && `col-md-${md}`,
      lg && `col-lg-${lg}`,
      xl && `col-xl-${xl}`,
      xxl && `col-xxl-${xxl}`,
      !xs && !sm && !md && !lg && !xl && !xxl && 'col',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={cn(colClasses, className)} style={style} {...props}>
        {children}
      </div>
    );
  }
);
NeuCol.displayName = 'NeuCol';

// Container
const NeuContainer = React.forwardRef(
  ({ children, className, fluid = false, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(fluid ? 'container-fluid' : 'container', className)}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
);
NeuContainer.displayName = 'NeuContainer';

export { NeuRow, NeuCol, NeuContainer };
