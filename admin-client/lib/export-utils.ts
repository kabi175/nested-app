/**
 * Utility functions for exporting data
 */

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) {
    return '';
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create CSV header row
  const headerRow = csvHeaders.join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return csvHeaders.map(header => {
      const value = item[header];
      // Handle values with commas, quotes, or newlines
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    // Create download link
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Export data to CSV file
 */
export function exportToCSV(data: any[], filename: string, headers?: string[]): void {
  if (data.length === 0) {
    throw new Error('No data to export');
  }
  
  const csv = convertToCSV(data, headers);
  downloadCSV(csv, `${filename}.csv`);
}

