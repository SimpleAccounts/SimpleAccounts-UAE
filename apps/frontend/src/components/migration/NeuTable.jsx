/**
 * NeuTable - Neumorphic Table Components
 * Migration wrapper: reactstrap Table API → neumorphic styling
 *
 * Usage (drop-in replacement for reactstrap Table):
 *   import { NeuTable as Table } from 'components/migration';
 *   <Table striped hover>
 *     <thead><tr><th>Column</th></tr></thead>
 *     <tbody><tr><td>Data</td></tr></tbody>
 *   </Table>
 */
import React from 'react';
import { cn } from '@/lib/utils';

// Neumorphic table styles
const NEU_TABLE_STYLES = {
  wrapper: {
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      '6px 6px 12px var(--neu-shadow-dark, #c4c9cf), -6px -6px 12px var(--neu-shadow-light, #ffffff)',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  table: {
    background: 'transparent',
    borderCollapse: 'separate',
    borderSpacing: 0,
  },
  th: {
    background: 'rgba(30, 110, 255, 0.05)',
    color: 'var(--neu-primary, #1e6eff)',
    fontWeight: 600,
    borderBottom: '2px solid rgba(200, 210, 220, 0.3)',
  },
  td: {
    color: 'var(--neu-text-secondary, #3d5a80)',
    borderTop: '1px solid rgba(200, 210, 220, 0.2)',
  },
  trHover: {
    background: 'rgba(30, 110, 255, 0.03)',
  },
  trStriped: {
    background: 'rgba(200, 210, 220, 0.05)',
  },
};

const NeuTable = React.forwardRef(
  (
    {
      children,
      className,
      striped = false,
      hover = false,
      bordered = false,
      borderless = false,
      responsive = false,
      size,
      style,
      ...props
    },
    ref
  ) => {
    const tableContent = (
      <table
        ref={ref}
        className={cn('w-full text-sm', size === 'sm' && 'text-xs', className)}
        style={{ ...NEU_TABLE_STYLES.table, ...style }}
        {...props}
      >
        {React.Children.map(children, child => {
          if (!React.isValidElement(child)) return child;

          // Add striped/hover context to tbody
          if (child.type === 'tbody') {
            return React.cloneElement(child, {
              children: React.Children.map(child.props.children, (row, index) => {
                if (!React.isValidElement(row)) return row;

                const rowStyle = {
                  ...(striped && index % 2 === 1 ? NEU_TABLE_STYLES.trStriped : {}),
                };

                return React.cloneElement(row, {
                  style: { ...rowStyle, ...row.props.style },
                  className: cn(hover && 'hover:bg-[rgba(30,110,255,0.03)]', row.props.className),
                });
              }),
            });
          }

          return child;
        })}
      </table>
    );

    if (responsive) {
      return (
        <div style={NEU_TABLE_STYLES.wrapper}>
          <div className="overflow-x-auto">{tableContent}</div>
        </div>
      );
    }

    return <div style={NEU_TABLE_STYLES.wrapper}>{tableContent}</div>;
  }
);
NeuTable.displayName = 'NeuTable';

// Styled th component
const NeuTh = React.forwardRef(({ children, className, style, ...props }, ref) => (
  <th
    ref={ref}
    className={cn('px-4 py-3 text-left align-middle', className)}
    style={{ ...NEU_TABLE_STYLES.th, ...style }}
    {...props}
  >
    {children}
  </th>
));
NeuTh.displayName = 'NeuTh';

// Styled td component
const NeuTd = React.forwardRef(({ children, className, style, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('px-4 py-3 align-middle', className)}
    style={{ ...NEU_TABLE_STYLES.td, ...style }}
    {...props}
  >
    {children}
  </td>
));
NeuTd.displayName = 'NeuTd';

export { NeuTable, NeuTh, NeuTd };
