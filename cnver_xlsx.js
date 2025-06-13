const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
// Folder paths
const inputFolder = './Pune/Mulshi'; // Replace with your input folder path
const outputFolder = 'Mulshi'; // Replace with your output folder path
const MAX_TEXT_LENGTH = 32767;
// Function to truncate long text in fields
function truncateCellValues(data) {
  return data.map(row => {
    const newRow = {};
    for (const key in row) {
      if (typeof row[key] === 'string' && row[key].length > MAX_TEXT_LENGTH) {
        newRow[key] = row[key].substring(0, MAX_TEXT_LENGTH);
      } else if (Array.isArray(row[key])) {
        newRow[key] = row[key].join(', '); // Convert arrays to comma-separated strings
      } else {
        newRow[key] = row[key];
      }
    }
    return newRow;
  });
}
// Function to process a single JSON file
function processJsonFile(inputFile, outputFile) {
  try {
    console.log(`Reading JSON data from ${inputFile}...`);
    const jsonData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    // Transform data to flatten nested structures
    const formattedData = Object.entries(jsonData).flatMap(([key, value]) =>
      value.map(item => ({
        PlotKey: key, // Add the top-level key as a new column
        ...item, // Include all fields from the nested objects
      }))
    );
    console.log(`Processing data to truncate long values...`);
    const truncatedData = truncateCellValues(formattedData);
    // Convert JSON data to Excel
    console.log(`Converting data to Excel format...`);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(truncatedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    // Write to Excel file
    XLSX.writeFile(workbook, outputFile);
    console.log(`Data successfully converted to ${outputFile}`);
  } catch (error) {
    console.error(`Error processing file ${inputFile}:`, error.message);
  }
}
// Main function to process all JSON files in the folder
function processAllFiles(inputFolder, outputFolder) {
  try {
    // Ensure the output folder exists
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder);
    }
    // Read all files from the input folder
    const files = fs.readdirSync(inputFolder).filter(file => path.extname(file) === '.json');
    if (files.length === 0) {
      console.log('No JSON files found in the specified folder.');
      return;
    }
    console.log(`Found ${files.length} JSON files. Processing...`);
    files.forEach(file => {
      const inputFile = path.join(inputFolder, file);
      const outputFile = path.join(outputFolder, `${path.parse(file).name}.xlsx`);
      processJsonFile(inputFile, outputFile);
    });
    console.log('All files processed successfully.');
  } catch (error) {
    console.error('Error while processing files:', error.message);
  }
}
// Start processing
processAllFiles(inputFolder, outputFolder);
