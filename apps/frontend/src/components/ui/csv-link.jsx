import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import Papa from 'papaparse';

/**
 * CSVLink Component
 * A papaparse-based replacement for react-csv's CSVLink component.
 * Provides backward-compatible API for downloading CSV files.
 *
 * @param {Object} props
 * @param {Array} props.data - Array of objects or arrays to convert to CSV
 * @param {string} props.filename - Name of the file to download (default: 'download.csv')
 * @param {React.ReactNode} props.children - Content to render (if visible)
 * @param {string} props.className - CSS class names
 * @param {string} props.target - Link target attribute (e.g., '_blank')
 */
const CSVLink = forwardRef(({ data = [], filename = 'download.csv', children, className = '', target }, ref) => {
  const linkRef = useRef(null);

  // Handle CSV download
  const handleDownload = () => {
    if (!data || data.length === 0) {
      console.warn('CSVLink: No data provided for download');
      return;
    }

    try {
      // Convert data to CSV using papaparse
      const csv = Papa.unparse(data);

      // Create a blob from the CSV string
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      // Create a temporary download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSVLink: Error generating CSV:', error);
    }
  };

  // Expose click method via ref for backward compatibility with react-csv
  useImperativeHandle(ref, () => ({
    link: {
      click: handleDownload,
    },
  }));

  // If children are provided, render as a clickable element
  if (children) {
    return (
      <a
        ref={linkRef}
        className={className}
        onClick={handleDownload}
        style={{ cursor: 'pointer' }}
        target={target}
      >
        {children}
      </a>
    );
  }

  // Otherwise render nothing (hidden mode)
  return null;
});

CSVLink.displayName = 'CSVLink';

export { CSVLink };
