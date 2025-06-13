// parser.js

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const errFile = path.join(__dirname, 'errors.log');
const inputFile = path.join(__dirname, 'input.txt');

// storing the required item in array
const itemsRequired = ['id', 'name', 'timestamp'];
// No of correct liner
let validLines = 0;
let isCancelled = false;

// Function to log errors to errors.log
function logError(errMsg) {
  fs.appendFileSync(errFile, errMsg + '\n');
}

const sampleData = [
    '{"id":1,"name":"Rohit"}',
    '{"name", "age", "timestamp":"2025-06-04"}', 
    '{"id":3,"timestamp":"2025-06-04"}',
    '{"id":4,"name":"Rohit","timestamp":"2025-06-01"}',
    '{"id":5,"name":"Aman","timestamp":"2025-06-02"}',
    '{"id":6,"timestamp":"2025-06-04"}',
    '{"id":7,"name":"Harshjeet","timestamp":"2025-06-02"}',
    '{"id":8,"name":"Harshjeet","timestamp":"2025-06-02"}',
    '{"id":9,"name":"Harshjeet","timestamp":"2025-06-02"}',
    '{"id":10,"dob:","timestamp":"2025-06-02"}',
    '{"id":11,"name":"Arvind","timestamp":"2025-06-03"}',
    '{"id":12,"name":"Arvind","timestamp":"2025-06-03"}',
    '{"id":13,"name":"Arvind","timestamp":"2025-06-03"}',
];
// Insert sample data by creating inputFile.txt if not exist
function generateSampleInput() {
  fs.writeFileSync(inputFile, sampleData.join('\n\n'));
}

async function fileParser() {
  if (!fs.existsSync(inputFile)) {
    generateSampleInput();
  }

  // Clearing errorfile if it had previous error in it
  if (fs.existsSync(errFile)) {
    fs.unlinkSync(errFile);
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(inputFile),
    crlfDelay: Infinity
  });

//   console.log(rl)


  const timer = setTimeout(() => {
    isCancelled = true;
    logError('Parsing process has been  cancelled due to timeout of 10 seconds');
    rl.close();
  }, 10000);

  let lineNumber = 0;

  try {
    for await (const line of rl) {
      if (isCancelled) break;

      lineNumber++;
      let parsedData;
      try {
        parsedData = JSON.parse(line);
      } catch (err) {
        logError(`Line ${lineNumber}: Invalid JSON - ${err.message} `);
        continue;
      }

      const missingItem = itemsRequired.filter((field) => !(field in parsedData));
      if (missingItem.length > 0) {
        logError(`Line ${lineNumber}: Missing field '${missingItem[0]}'`);
        continue;
      }

      validLines++;
    }
  } catch (err) {
    if (!isCancelled) {
      logError(`Error: ${err.message}`);
    }
  } finally {
    clearTimeout(timer);
    if (!isCancelled) console.log(`Valid entries: ${validLines}`);
  }
}

fileParser();
