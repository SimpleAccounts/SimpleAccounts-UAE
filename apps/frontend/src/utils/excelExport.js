/**
 * Excel Export Utility
 *
 * This module provides xlsx-compatible API using exceljs as the underlying library.
 * It's a drop-in replacement for the xlsx package to resolve security vulnerabilities
 * (GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9).
 */
import ExcelJS from 'exceljs';

/**
 * Convert JSON array to worksheet-ready data
 * @param {Array} jsonData - Array of objects to convert
 * @returns {Object} Worksheet data with headers and rows
 */
function jsonToSheetData(jsonData) {
  if (!jsonData || jsonData.length === 0) {
    return { headers: [], rows: [] };
  }
  const headers = Object.keys(jsonData[0]);
  const rows = jsonData.map(item => headers.map(header => item[header]));
  return { headers, rows };
}

/**
 * Convert HTML table element to worksheet-ready data
 * @param {HTMLElement} tableElement - HTML table element
 * @returns {Object} Worksheet data with headers and rows
 */
function tableToSheetData(tableElement) {
  const rows = [];
  const tableRows = tableElement.querySelectorAll('tr');

  tableRows.forEach((tr) => {
    const rowData = [];
    const cells = tr.querySelectorAll('th, td');
    cells.forEach((cell) => {
      // Get text content and try to convert to number if applicable
      let value = cell.textContent.trim();
      const numValue = parseFloat(value.replace(/,/g, ''));
      if (!isNaN(numValue) && value !== '') {
        value = numValue;
      }
      rowData.push(value);
    });
    if (rowData.length > 0) {
      rows.push(rowData);
    }
  });

  // First row is typically headers
  const headers = rows.length > 0 ? rows[0] : [];
  const dataRows = rows.slice(1);

  return { headers, rows: dataRows, allRows: rows };
}

/**
 * Create a new workbook
 * @returns {Object} Workbook object
 */
function createWorkbook() {
  return {
    _workbook: new ExcelJS.Workbook(),
    _sheets: [],
    Sheets: {},
    SheetNames: []
  };
}

/**
 * Add a sheet to a workbook
 * @param {Object} workbook - Workbook object
 * @param {Object} sheetData - Sheet data from jsonToSheetData or tableToSheetData
 * @param {string} sheetName - Name of the sheet
 */
function addSheetToWorkbook(workbook, sheetData, sheetName) {
  const worksheet = workbook._workbook.addWorksheet(sheetName);

  if (sheetData.headers && sheetData.headers.length > 0) {
    worksheet.addRow(sheetData.headers);
  }

  const rows = sheetData.rows || sheetData.allRows || [];
  rows.forEach(row => {
    worksheet.addRow(row);
  });

  workbook._sheets.push({ name: sheetName, worksheet });
  workbook.SheetNames.push(sheetName);
  workbook.Sheets[sheetName] = sheetData;
}

/**
 * Write workbook to file (triggers download in browser)
 * @param {Object} workbook - Workbook object
 * @param {string} filename - Filename for download
 */
async function writeFile(workbook, filename) {
  const buffer = await workbook._workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Write workbook to base64 string
 * @param {Object} workbook - Workbook object
 * @param {Object} options - Write options
 * @returns {Promise<string>} Base64 encoded string
 */
async function writeToBase64(workbook) {
  const buffer = await workbook._workbook.xlsx.writeBuffer();
  const base64 = btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  return base64;
}

/**
 * Write workbook to CSV format
 * @param {Object} workbook - Workbook object
 * @param {string} filename - Filename for download
 */
async function writeCSV(workbook, filename) {
  const csvBuffer = await workbook._workbook.csv.writeBuffer();
  const blob = new Blob([csvBuffer], { type: 'text/csv;charset=utf-8;' });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Export xlsx-compatible API
const ExcelExport = {
  utils: {
    /**
     * Convert JSON array to sheet data (xlsx-compatible)
     */
    json_to_sheet: function(jsonData) {
      return jsonToSheetData(jsonData);
    },

    /**
     * Create new workbook (xlsx-compatible)
     */
    book_new: function() {
      return createWorkbook();
    },

    /**
     * Append sheet to workbook (xlsx-compatible)
     */
    book_append_sheet: function(workbook, sheetData, sheetName) {
      addSheetToWorkbook(workbook, sheetData, sheetName);
    },

    /**
     * Convert HTML table to workbook (xlsx-compatible)
     */
    table_to_book: function(tableElement, options = {}) {
      const workbook = createWorkbook();
      const sheetData = tableToSheetData(tableElement);
      const sheetName = options.sheet || 'Sheet1';
      addSheetToWorkbook(workbook, sheetData, sheetName);
      return workbook;
    }
  },

  /**
   * Write workbook to file (xlsx-compatible)
   * Handles both .xlsx and .csv based on filename
   */
  writeFile: function(workbook, filename) {
    if (filename.endsWith('.csv')) {
      return writeCSV(workbook, filename);
    }
    return writeFile(workbook, filename);
  },

  /**
   * Write workbook to buffer/base64 (xlsx-compatible)
   */
  write: function(workbook, options = {}) {
    if (options.type === 'base64') {
      return writeToBase64(workbook);
    }
    // Return buffer for other types
    return workbook._workbook.xlsx.writeBuffer();
  }
};

export default ExcelExport;
