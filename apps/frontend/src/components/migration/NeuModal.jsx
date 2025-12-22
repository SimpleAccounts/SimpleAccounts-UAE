/**
 * NeuModal - Neumorphic Modal Components
 * Migration wrapper: reactstrap Modal API → shadcn/ui Dialog with neumorphic styling
 *
 * Usage (drop-in replacement for reactstrap Modal):
 *   import { NeuModal as Modal, NeuModalHeader as ModalHeader, NeuModalBody as ModalBody } from 'components/migration';
 *   <Modal isOpen={isOpen} toggle={toggle}>
 *     <ModalHeader toggle={toggle}>Title</ModalHeader>
 *     <ModalBody>Content</ModalBody>
 *     <ModalFooter>
 *       <Button onClick={toggle}>Close</Button>
 *     </ModalFooter>
 *   </Modal>
 */
import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Neumorphic modal styles
const NEU_MODAL_STYLES = {
  content: {
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      '8px 8px 16px var(--neu-shadow-dark, #c4c9cf), -8px -8px 16px var(--neu-shadow-light, #ffffff)',
    border: 'none',
    borderRadius: '20px',
  },
  header: {
    borderBottom: '1px solid rgba(200, 210, 220, 0.3)',
    color: 'var(--neu-text-primary, #1e3a5f)',
  },
  body: {
    color: 'var(--neu-text-secondary, #3d5a80)',
  },
  footer: {
    borderTop: '1px solid rgba(200, 210, 220, 0.3)',
  },
  closeButton: {
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      '2px 2px 4px var(--neu-shadow-dark, #c4c9cf), -2px -2px 4px var(--neu-shadow-light, #ffffff)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

// Size mappings
const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const NeuModal = ({ children, isOpen, toggle, size = 'md', centered = true, className, ...props }) => {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={toggle}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] p-0 duration-200',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            SIZE_CLASSES[size] || SIZE_CLASSES.md,
            className
          )}
          style={NEU_MODAL_STYLES.content}
          {...props}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
NeuModal.displayName = 'NeuModal';

const NeuModalHeader = React.forwardRef(
  ({ children, className, toggle, closeAriaLabel = 'Close', style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between px-6 py-4', className)}
      style={{ ...NEU_MODAL_STYLES.header, ...style }}
      {...props}
    >
      <DialogPrimitive.Title className="text-lg font-bold m-0">{children}</DialogPrimitive.Title>
      {toggle && (
        <button
          type="button"
          onClick={toggle}
          aria-label={closeAriaLabel}
          style={NEU_MODAL_STYLES.closeButton}
        >
          <X className="h-4 w-4" style={{ color: 'var(--neu-text-muted, #98afc2)' }} />
        </button>
      )}
    </div>
  )
);
NeuModalHeader.displayName = 'NeuModalHeader';

const NeuModalBody = React.forwardRef(({ children, className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('px-6 py-4', className)}
    style={{ ...NEU_MODAL_STYLES.body, ...style }}
    {...props}
  >
    {children}
  </div>
));
NeuModalBody.displayName = 'NeuModalBody';

const NeuModalFooter = React.forwardRef(({ children, className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-end gap-2 px-6 py-4', className)}
    style={{ ...NEU_MODAL_STYLES.footer, ...style }}
    {...props}
  >
    {children}
  </div>
));
NeuModalFooter.displayName = 'NeuModalFooter';

export { NeuModal, NeuModalHeader, NeuModalBody, NeuModalFooter };
