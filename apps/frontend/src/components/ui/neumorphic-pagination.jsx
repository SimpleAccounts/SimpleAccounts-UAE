import { ChevronLeft, ChevronRight } from 'lucide-react';

// Corporate theme constants
const theme = {
  bg: '#f8f9fa',
  bgWhite: '#ffffff',
  primary: '#2064d8',
  primaryHover: '#1a56b8',
  textPrimary: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  borderHover: '#d1d5db',
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Generate page numbers array with ellipsis
function getPageNumbers(currentPage, totalPages) {
  const pages = [];

  if (totalPages <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }
  }

  return pages;
}

export function NeumorphicPagination({ table, totalCount }) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const totalRows = totalCount ?? table.getFilteredRowModel().rows.length;
  const currentPage = pageIndex + 1; // 1-indexed for display

  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  const pages = getPageNumbers(currentPage, pageCount);

  const buttonBase = {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: 500,
    fontSize: '14px',
  };

  const buttonNormal = {
    ...buttonBase,
    background: theme.bgWhite,
    border: `1px solid ${theme.border}`,
    color: theme.textSecondary,
  };

  const buttonActive = {
    ...buttonBase,
    background: theme.primary,
    border: `1px solid ${theme.primary}`,
    color: 'white',
  };

  const buttonDisabled = {
    ...buttonBase,
    background: theme.bg,
    border: `1px solid ${theme.border}`,
    color: theme.textMuted,
    opacity: 0.5,
    cursor: 'not-allowed',
  };

  const selectStyle = {
    background: theme.bgWhite,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    padding: '8px 12px',
    paddingRight: '32px',
    fontSize: '14px',
    fontWeight: 500,
    color: theme.textSecondary,
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234b5563' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div className="flex items-center justify-between px-2 py-4 flex-wrap gap-3">
      {/* Results info */}
      <div style={{ color: theme.textMuted, fontSize: '14px' }}>
        {table.getFilteredSelectedRowModel().rows.length > 0 ? (
          <>
            {table.getFilteredSelectedRowModel().rows.length} of {totalRows} row(s) selected
          </>
        ) : (
          <>
            Showing {startRow} to {endRow} of {totalRows} results
          </>
        )}
      </div>

      {/* Pagination controls and page size selector */}
      <div className="flex items-center gap-4">
        {/* Records per page selector */}
        <div className="flex items-center gap-2">
          <span style={{ color: theme.textMuted, fontSize: '14px' }}>Show</span>
          <select
            value={pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value));
            }}
            style={selectStyle}
            onFocus={e => (e.target.style.borderColor = theme.primary)}
            onBlur={e => (e.target.style.borderColor = theme.border)}
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span style={{ color: theme.textMuted, fontSize: '14px' }}>per page</span>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            style={table.getCanPreviousPage() ? buttonNormal : buttonDisabled}
            onMouseEnter={e => {
              if (table.getCanPreviousPage()) {
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.color = theme.primary;
              }
            }}
            onMouseLeave={e => {
              if (table.getCanPreviousPage()) {
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.color = theme.textSecondary;
              }
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Page numbers */}
          {pages.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && table.setPageIndex(page - 1)}
              disabled={page === '...'}
              style={
                page === currentPage
                  ? buttonActive
                  : page === '...'
                    ? {
                        ...buttonNormal,
                        cursor: 'default',
                        border: 'none',
                        background: 'transparent',
                      }
                    : buttonNormal
              }
              onMouseEnter={e => {
                if (page !== '...' && page !== currentPage) {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.color = theme.primary;
                }
              }}
              onMouseLeave={e => {
                if (page !== '...' && page !== currentPage) {
                  e.currentTarget.style.borderColor = theme.border;
                  e.currentTarget.style.color = theme.textSecondary;
                }
              }}
            >
              {page}
            </button>
          ))}

          {/* Next button */}
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            style={table.getCanNextPage() ? buttonNormal : buttonDisabled}
            onMouseEnter={e => {
              if (table.getCanNextPage()) {
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.color = theme.primary;
              }
            }}
            onMouseLeave={e => {
              if (table.getCanNextPage()) {
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.color = theme.textSecondary;
              }
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
