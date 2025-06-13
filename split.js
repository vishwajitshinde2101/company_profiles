const fs = require('fs');
const path = require('path');
// Path to the large JSON file
const inputFile = "./Pune/Junnar/all_village_data_missed_Junnar.json"
// Extract the base name (without extension) of the input file
const baseName = path.basename(inputFile, path.extname(inputFile));
// Create a new directory for the district (Bhandara_District_split)
const outputFolder = path.join(path.dirname(inputFile), `${baseName}_District_split`);
// Ensure the output folder exists
fs.mkdir(outputFolder, { recursive: true }, (err) => {
  if (err) {
    console.error('Error creating directory:', err);
    return;
  }
  // Read the large JSON file
  fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }
    try {
      // Parse the JSON data
      const jsonData = JSON.parse(data);
      // Check if the parsed JSON is an array or an object
      if (Array.isArray(jsonData)) {
        // If it's an array, split it into two halves
        const half = Math.ceil(jsonData.length / 2);
        const firstHalf = jsonData.slice(0, half);
        const secondHalf = jsonData.slice(half);
        // Write the first half to a new file inside the output folder
        const firstHalfFile = path.join(outputFolder, `${baseName}_1.json`);
        fs.writeFile(firstHalfFile, JSON.stringify(firstHalf, null, 2), (err) => {
          if (err) {
            console.error('Error writing first half:', err);
            return;
          }
          console.log(`First half saved to ${firstHalfFile}`);
        });
        // Write the second half to a new file inside the output folder
        const secondHalfFile = path.join(outputFolder, `${baseName}_2.json`);
        fs.writeFile(secondHalfFile, JSON.stringify(secondHalf, null, 2), (err) => {
          if (err) {
            console.error('Error writing second half:', err);
            return;
          }
          console.log(`Second half saved to ${secondHalfFile}`);
        });
      } else if (typeof jsonData === 'object') {
        // If it's an object, decide how to split (by keys or values)
        const keys = Object.keys(jsonData);
        const half = Math.ceil(keys.length / 2);
        const firstHalfKeys = keys.slice(0, half);
        const secondHalfKeys = keys.slice(half);
        const firstHalf = {};
        const secondHalf = {};
        // Split the object by keys
        firstHalfKeys.forEach(key => {
          firstHalf[key] = jsonData[key];
        });
        secondHalfKeys.forEach(key => {
          secondHalf[key] = jsonData[key];
        });
        // Write the first half to a new file inside the output folder
        const firstHalfFile = path.join(outputFolder, `${baseName}_1.json`);
        fs.writeFile(firstHalfFile, JSON.stringify(firstHalf, null, 2), (err) => {
          if (err) {
            console.error('Error writing first half:', err);
            return;
          }
          console.log(`First half saved to ${firstHalfFile}`);
        });
        // Write the second half to a new file inside the output folder
        const secondHalfFile = path.join(outputFolder, `${baseName}_2.json`);
        fs.writeFile(secondHalfFile, JSON.stringify(secondHalf, null, 2), (err) => {
          if (err) {
            console.error('Error writing second half:', err);
            return;
          }
          console.log(`Second half saved to ${secondHalfFile}`);
        });
      } else {
        console.error('JSON data is neither an array nor an object.');
      }
    } catch (parseErr) {
      console.error('Error parsing the JSON data:', parseErr);
    }
  });
});
