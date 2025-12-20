import React from 'react';
import { render, screen } from '@testing-library/react';
import { DataTableRowActions, createActionsColumn, commonActions } from '../data-table-actions';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  MoreHorizontal: () => <span data-testid="more-icon">...</span>,
  Eye: () => <span data-testid="eye-icon">👁</span>,
  Edit: () => <span data-testid="edit-icon">✏</span>,
  Trash2: () => <span data-testid="trash-icon">🗑</span>,
  Copy: () => <span data-testid="copy-icon">📋</span>,
  Send: () => <span data-testid="send-icon">📤</span>,
  FileText: () => <span data-testid="file-icon">📄</span>,
  Check: () => <span data-testid="check-icon">✓</span>,
  ChevronDown: () => <span>▼</span>,
  ChevronUp: () => <span>▲</span>,
}));

describe('DataTableRowActions', () => {
  const mockRow = {
    original: { id: 1, name: 'Test Item' },
  };

  // Cleanup after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders action button with menu trigger', () => {
      render(
        <DataTableRowActions
          row={mockRow}
          onView={() => {}}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByTestId('more-icon')).toBeInTheDocument();
    });

    it('returns null when no actions are provided', () => {
      const { container } = render(
        <DataTableRowActions row={mockRow} showDefaultActions={false} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders button when onView is provided', () => {
      render(<DataTableRowActions row={mockRow} onView={() => {}} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders button when onEdit is provided', () => {
      render(<DataTableRowActions row={mockRow} onEdit={() => {}} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders button when onDelete is provided', () => {
      render(<DataTableRowActions row={mockRow} onDelete={() => {}} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders button when custom actions are provided', () => {
      render(
        <DataTableRowActions
          row={mockRow}
          showDefaultActions={false}
          actions={[{ label: 'Custom', onClick: () => {} }]}
        />
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables button when disabled prop is true', () => {
      render(
        <DataTableRowActions
          row={mockRow}
          onView={() => {}}
          disabled
        />
      );

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('button is enabled by default', () => {
      render(
        <DataTableRowActions
          row={mockRow}
          onView={() => {}}
        />
      );

      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });
});

describe('createActionsColumn', () => {
  it('creates a column definition with correct id', () => {
    const column = createActionsColumn({
      onView: () => {},
      onEdit: () => {},
    });

    expect(column.id).toBe('actions');
  });

  it('disables sorting on actions column', () => {
    const column = createActionsColumn({ onView: () => {} });
    expect(column.enableSorting).toBe(false);
  });

  it('disables hiding on actions column', () => {
    const column = createActionsColumn({ onView: () => {} });
    expect(column.enableHiding).toBe(false);
  });

  it('creates a cell renderer function', () => {
    const column = createActionsColumn({ onView: () => {} });
    expect(typeof column.cell).toBe('function');
  });

  it('sets a size for the actions column', () => {
    const column = createActionsColumn({ onView: () => {} });
    expect(column.size).toBe(50);
  });
});

describe('commonActions', () => {
  it('creates view action with correct label', () => {
    const onClick = jest.fn();
    const action = commonActions.view(onClick);

    expect(action.label).toBe('View');
    expect(action.onClick).toBe(onClick);
  });

  it('creates edit action with correct label', () => {
    const onClick = jest.fn();
    const action = commonActions.edit(onClick);

    expect(action.label).toBe('Edit');
    expect(action.onClick).toBe(onClick);
  });

  it('creates delete action with destructive flag', () => {
    const onClick = jest.fn();
    const action = commonActions.delete(onClick);

    expect(action.label).toBe('Delete');
    expect(action.destructive).toBe(true);
    expect(action.onClick).toBe(onClick);
  });

  it('creates duplicate action with correct label', () => {
    const onClick = jest.fn();
    const action = commonActions.duplicate(onClick);

    expect(action.label).toBe('Duplicate');
    expect(action.onClick).toBe(onClick);
  });

  it('creates send action with correct label', () => {
    const onClick = jest.fn();
    const action = commonActions.send(onClick);

    expect(action.label).toBe('Send');
    expect(action.onClick).toBe(onClick);
  });

  it('creates download action with correct label', () => {
    const onClick = jest.fn();
    const action = commonActions.download(onClick);

    expect(action.label).toBe('Download');
    expect(action.onClick).toBe(onClick);
  });

  it('creates separator object', () => {
    const action = commonActions.separator;
    expect(action.separator).toBe(true);
  });
});
