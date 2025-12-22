/**
 * NeuInput - Neumorphic Input Components
 * Migration wrapper: reactstrap Input API → neumorphic styling
 *
 * Usage (drop-in replacement for reactstrap Input):
 *   import { NeuInput as Input, NeuFormGroup as FormGroup, NeuLabel as Label } from 'components/migration';
 *   <FormGroup>
 *     <Label for="email">Email</Label>
 *     <Input type="email" id="email" placeholder="Enter email" />
 *   </FormGroup>
 */
import React from 'react';
import { cn } from '@/lib/utils';

// Neumorphic input styles
const NEU_INPUT_STYLES = {
  input: {
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      'inset 2px 2px 4px var(--neu-shadow-dark, #c4c9cf), inset -2px -2px 4px var(--neu-shadow-light, #ffffff)',
    border: 'none',
    borderRadius: '12px',
    color: 'var(--neu-text-primary, #1e3a5f)',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  inputFocus: {
    boxShadow:
      'inset 3px 3px 6px var(--neu-shadow-dark, #c4c9cf), inset -3px -3px 6px var(--neu-shadow-light, #ffffff), 0 0 0 3px rgba(30, 110, 255, 0.15)',
  },
  label: {
    color: 'var(--neu-text-primary, #1e3a5f)',
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  select: {
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2366799e' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 0.75rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem',
  },
};

// Size mappings
const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

const NeuInput = React.forwardRef(
  (
    {
      className,
      type = 'text',
      bsSize = 'md',
      invalid = false,
      valid = false,
      plaintext = false,
      addon: _addon = false,
      style,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const sizeClass = SIZE_CLASSES[bsSize] || SIZE_CLASSES.md;

    const inputStyle = {
      ...NEU_INPUT_STYLES.input,
      ...(type === 'select' ? NEU_INPUT_STYLES.select : {}),
      ...(isFocused ? NEU_INPUT_STYLES.inputFocus : {}),
      ...(invalid
        ? { boxShadow: `${NEU_INPUT_STYLES.input.boxShadow}, 0 0 0 2px rgba(255, 77, 106, 0.3)` }
        : {}),
      ...(valid
        ? { boxShadow: `${NEU_INPUT_STYLES.input.boxShadow}, 0 0 0 2px rgba(0, 200, 150, 0.3)` }
        : {}),
      ...(plaintext ? { background: 'transparent', boxShadow: 'none' } : {}),
      ...style,
    };

    const commonProps = {
      ref,
      className: cn('w-full', sizeClass, className),
      style: inputStyle,
      onFocus: e => {
        setIsFocused(true);
        props.onFocus?.(e);
      },
      onBlur: e => {
        setIsFocused(false);
        props.onBlur?.(e);
      },
      ...props,
    };

    if (type === 'select') {
      return <select {...commonProps}>{props.children}</select>;
    }

    if (type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
        />
      );
    }

    return <input type={type} {...commonProps} />;
  }
);
NeuInput.displayName = 'NeuInput';

const NeuLabel = React.forwardRef(({ children, className, htmlFor, style, ...props }, ref) => (
  <label
    ref={ref}
    htmlFor={htmlFor}
    className={cn('block mb-2', className)}
    style={{ ...NEU_INPUT_STYLES.label, ...style }}
    {...props}
  >
    {children}
  </label>
));
NeuLabel.displayName = 'NeuLabel';

const NeuFormGroup = React.forwardRef(
  ({ children, className, row = false, check = false, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'mb-4',
        row && 'flex flex-wrap items-center',
        check && 'flex items-center gap-2',
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
);
NeuFormGroup.displayName = 'NeuFormGroup';

const NeuInputGroup = React.forwardRef(
  ({ children, className, size: _size, style, ...props }, ref) => (
    <div ref={ref} className={cn('flex', className)} style={style} {...props}>
      {children}
    </div>
  )
);
NeuInputGroup.displayName = 'NeuInputGroup';

const NeuInputGroupText = React.forwardRef(({ children, className, style, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('flex items-center px-3 text-sm', className)}
    style={{
      background: 'var(--neu-bg, #e8eef5)',
      boxShadow:
        'inset 1px 1px 2px var(--neu-shadow-dark, #c4c9cf), inset -1px -1px 2px var(--neu-shadow-light, #ffffff)',
      color: 'var(--neu-text-muted, #98afc2)',
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
));
NeuInputGroupText.displayName = 'NeuInputGroupText';

export { NeuInput, NeuLabel, NeuFormGroup, NeuInputGroup, NeuInputGroupText };
