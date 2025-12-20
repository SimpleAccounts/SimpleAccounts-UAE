import { MoreHorizontal, Eye, Edit, Trash2, Copy, Send, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Standard action column cell component for DataTable
 * Provides a consistent dropdown menu for row actions.
 *
 * @example
 * // Basic usage with standard actions
 * const columns = [
 *   // ... other columns
 *   {
 *     id: 'actions',
 *     cell: ({ row }) => (
 *       <DataTableRowActions
 *         row={row}
 *         onView={() => navigate(`/detail/${row.original.id}`)}
 *         onEdit={() => navigate(`/edit/${row.original.id}`)}
 *         onDelete={() => handleDelete(row.original.id)}
 *       />
 *     ),
 *   },
 * ];
 *
 * @example
 * // Custom actions
 * <DataTableRowActions
 *   row={row}
 *   actions={[
 *     { label: 'Send Invoice', icon: Send, onClick: () => sendInvoice(row.original) },
 *     { label: 'Download PDF', icon: FileText, onClick: () => downloadPdf(row.original) },
 *   ]}
 * />
 */
export function DataTableRowActions({
  row,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  actions = [],
  label = 'Actions',
  showDefaultActions = true,
  disabled = false,
}) {
  const hasDefaultActions = showDefaultActions && (onView || onEdit || onDelete || onDuplicate);
  const hasCustomActions = actions.length > 0;

  if (!hasDefaultActions && !hasCustomActions) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-muted"
          disabled={disabled}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Default actions */}
        {showDefaultActions && (
          <>
            {onView && (
              <DropdownMenuItem onClick={() => onView(row.original)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onDuplicate && (
              <DropdownMenuItem onClick={() => onDuplicate(row.original)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(row.original)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
            {hasCustomActions && <DropdownMenuSeparator />}
          </>
        )}

        {/* Custom actions */}
        {actions.map((action, index) => {
          // Support separator items
          if (action.separator) {
            return <DropdownMenuSeparator key={`sep-${index}`} />;
          }

          const Icon = action.icon;
          const isDisabled =
            typeof action.disabled === 'function'
              ? action.disabled(row.original)
              : action.disabled;
          const isHidden =
            typeof action.hidden === 'function'
              ? action.hidden(row.original)
              : action.hidden;

          if (isHidden) {
            return null;
          }

          return (
            <DropdownMenuItem
              key={action.label || index}
              onClick={() => action.onClick?.(row.original)}
              disabled={isDisabled}
              className={action.destructive ? 'text-destructive focus:text-destructive' : ''}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Helper to create an actions column definition
 *
 * @example
 * const columns = [
 *   // ... other columns
 *   createActionsColumn({
 *     onView: (row) => navigate(`/view/${row.id}`),
 *     onEdit: (row) => navigate(`/edit/${row.id}`),
 *     onDelete: (row) => handleDelete(row.id),
 *   }),
 * ];
 */
export function createActionsColumn(options = {}) {
  return {
    id: 'actions',
    header: '',
    cell: ({ row }) => <DataTableRowActions row={row} {...options} />,
    enableSorting: false,
    enableHiding: false,
    size: 50,
  };
}

/**
 * Commonly used action configurations
 */
export const commonActions = {
  view: (onClick) => ({
    label: 'View',
    icon: Eye,
    onClick,
  }),
  edit: (onClick) => ({
    label: 'Edit',
    icon: Edit,
    onClick,
  }),
  delete: (onClick) => ({
    label: 'Delete',
    icon: Trash2,
    onClick,
    destructive: true,
  }),
  duplicate: (onClick) => ({
    label: 'Duplicate',
    icon: Copy,
    onClick,
  }),
  send: (onClick) => ({
    label: 'Send',
    icon: Send,
    onClick,
  }),
  download: (onClick) => ({
    label: 'Download',
    icon: FileText,
    onClick,
  }),
  separator: { separator: true },
};
