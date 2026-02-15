/**
 * Triggers a browser download of CSV data with the specified filename
 * @param csvData - The CSV content as a string
 * @param filename - The desired filename (should end with .csv)
 */
export function downloadCsv(csvData: string, filename: string): void {
  // Ensure filename ends with .csv
  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  // Create a Blob with UTF-8 encoding and proper MIME type
  const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });

  // Create a temporary download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  link.style.visibility = 'hidden';

  // Append to body, click, and cleanup
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Release the object URL
  URL.revokeObjectURL(url);
}
