type CsvRow = Record<string, string | number | boolean | null | undefined>;

export function downloadAsCsv(data: CsvRow[], filename: string): void {
  if (!data || data.length === 0) {
    console.error("No data available to download.");
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Convert data to CSV string
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row => 
      headers.map(fieldName => {
        const field = row[fieldName];
        // Handle null/undefined and escape commas and quotes
        if (field === null || field === undefined) {
          return '';
        }
        let stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          stringField = `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      }).join(',')
    )
  ];
  
  const csvString = csvRows.join('\n');
  
  // Create a Blob and trigger download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
} 