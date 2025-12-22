/**
 * NeuCard - Neumorphic Card Components
 * Migration wrapper: reactstrap Card API → neumorphic styling
 *
 * Usage (drop-in replacement for reactstrap Card):
 *   import { NeuCard as Card, NeuCardBody as CardBody, NeuCardHeader as CardHeader } from 'components/migration';
 *   <Card>
 *     <CardHeader>Title</CardHeader>
 *     <CardBody>Content</CardBody>
 *   </Card>
 */
import React from 'react';
import { cn } from '@/lib/utils';

// Neumorphic card styles
const NEU_CARD_STYLES = {
  card: {
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      '6px 6px 12px var(--neu-shadow-dark, #c4c9cf), -6px -6px 12px var(--neu-shadow-light, #ffffff)',
    border: 'none',
    borderRadius: '16px',
  },
  header: {
    background: 'transparent',
    borderBottom: '1px solid rgba(200, 210, 220, 0.3)',
    color: 'var(--neu-primary, #1e6eff)',
    fontWeight: 700,
  },
  body: {
    background: 'transparent',
  },
  footer: {
    background: 'transparent',
    borderTop: '1px solid rgba(200, 210, 220, 0.3)',
  },
};

const NeuCard = React.forwardRef(({ children, className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mb-4', className)}
    style={{ ...NEU_CARD_STYLES.card, ...style }}
    {...props}
  >
    {children}
  </div>
));
NeuCard.displayName = 'NeuCard';

const NeuCardHeader = React.forwardRef(({ children, className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('px-5 py-4', className)}
    style={{ ...NEU_CARD_STYLES.header, ...style }}
    {...props}
  >
    {children}
  </div>
));
NeuCardHeader.displayName = 'NeuCardHeader';

const NeuCardBody = React.forwardRef(({ children, className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-5', className)}
    style={{ ...NEU_CARD_STYLES.body, ...style }}
    {...props}
  >
    {children}
  </div>
));
NeuCardBody.displayName = 'NeuCardBody';

const NeuCardFooter = React.forwardRef(({ children, className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('px-5 py-4', className)}
    style={{ ...NEU_CARD_STYLES.footer, ...style }}
    {...props}
  >
    {children}
  </div>
));
NeuCardFooter.displayName = 'NeuCardFooter';

const NeuCardTitle = React.forwardRef(({ children, className, tag: Tag = 'h5', style, ...props }, ref) => (
  <Tag
    ref={ref}
    className={cn('mb-2 font-semibold', className)}
    style={{ color: 'var(--neu-text-primary, #1e3a5f)', ...style }}
    {...props}
  >
    {children}
  </Tag>
));
NeuCardTitle.displayName = 'NeuCardTitle';

const NeuCardText = React.forwardRef(({ children, className, style, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('mb-0', className)}
    style={{ color: 'var(--neu-text-secondary, #3d5a80)', ...style }}
    {...props}
  >
    {children}
  </p>
));
NeuCardText.displayName = 'NeuCardText';

export { NeuCard, NeuCardHeader, NeuCardBody, NeuCardFooter, NeuCardTitle, NeuCardText };
