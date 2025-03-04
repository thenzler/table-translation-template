const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const Handlebars = require('handlebars');

// Register Handlebars helper
Handlebars.registerHelper('add', function(a, b) {
  return a + b;
});

// Function to parse XML file
async function parseXmlFile(filePath) {
  try {
    const xmlData = fs.readFileSync(filePath, 'utf8');
    const parser = new xml2js.Parser({ 
      explicitArray: false,
      mergeAttrs: true
    });
    
    return await parser.parseStringPromise(xmlData);
  } catch (error) {
    console.error('Error parsing XML file:', error);
    throw error;
  }
}

// Function to prepare data for the template
function prepareTemplateData(xmlData) {
  const tables = [];
  
  // Check if we have tables in the document
  if (!xmlData.document || !xmlData.document.tables || !xmlData.document.tables.table) {
    console.warn('No tables found in the XML');
    return { tables };
  }
  
  // Get tables from XML
  const xmlTables = Array.isArray(xmlData.document.tables.table) 
    ? xmlData.document.tables.table 
    : [xmlData.document.tables.table];
  
  // Group tables by pairs (original and translated)
  for (let i = 0; i < xmlTables.length; i += 2) {
    if (i + 1 >= xmlTables.length) {
      console.warn(`Table at index ${i} doesn't have a translation pair`);
      continue;
    }
    
    const originalTable = xmlTables[i];
    const translatedTable = xmlTables[i + 1];
    
    // Process columns
    const originalCols = processColumns(originalTable.cols.col);
    const translatedCols = processColumns(translatedTable.cols.col);
    
    // Process rows
    const originalRows = processRows(originalTable.rows.row);
    const translatedRows = processRows(translatedTable.rows.row);
    
    // Mark translation status
    markTranslationStatus(originalCols, translatedCols);
    markRowsTranslationStatus(originalRows, translatedRows);
    
    tables.push({
      original: {
        cols: originalCols,
        rows: originalRows
      },
      translated: {
        cols: translatedCols,
        rows: translatedRows
      }
    });
  }
  
  return { tables };
}

// Process column data
function processColumns(cols) {
  if (!cols) return [];
  
  const colArray = Array.isArray(cols) ? cols : [cols];
  return colArray.map(col => {
    return {
      id: col.id,
      content: col._,
      isTranslated: true // Default, will be updated later
    };
  });
}

// Process row data
function processRows(rows) {
  if (!rows) return [];
  
  const rowArray = Array.isArray(rows) ? rows : [rows];
  return rowArray.map(row => {
    const cols = Array.isArray(row.col) ? row.col : [row.col];
    return {
      id: row.id,
      cols: cols.map(col => {
        return {
          id: col.id,
          content: col._,
          isTranslated: true // Default, will be updated later
        };
      })
    };
  });
}

// Mark columns as translated or not
function markTranslationStatus(originalCols, translatedCols) {
  translatedCols.forEach((translatedCol, index) => {
    if (index < originalCols.length) {
      const originalCol = originalCols[index];
      translatedCol.isTranslated = translatedCol.content !== originalCol.content;
    }
  });
}

// Mark cells as translated or not
function markRowsTranslationStatus(originalRows, translatedRows) {
  translatedRows.forEach((translatedRow, rowIndex) => {
    if (rowIndex < originalRows.length) {
      const originalRow = originalRows[rowIndex];
      
      translatedRow.cols.forEach((translatedCell, colIndex) => {
        if (colIndex < originalRow.cols.length) {
          const originalCell = originalRow.cols[colIndex];
          translatedCell.isTranslated = translatedCell.content !== originalCell.content;
          translatedCell.isDifferent = translatedCell.isTranslated;
        }
      });
    }
  });
}

// Main function to generate HTML
async function generateHtml(xmlFilePath, templateFilePath, outputFilePath) {
  try {
    // Parse XML
    const xmlData = await parseXmlFile(xmlFilePath);
    
    // Prepare data for template
    const templateData = prepareTemplateData(xmlData);
    
    // Read template
    const templateSource = fs.readFileSync(templateFilePath, 'utf8');
    const template = Handlebars.compile(templateSource);
    
    // Generate HTML
    const html = template(templateData);
    
    // Write to output file
    fs.writeFileSync(outputFilePath, html);
    
    console.log(`HTML successfully generated at: ${outputFilePath}`);
  } catch (error) {
    console.error('Error generating HTML:', error);
  }
}

// If running as script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node generate.js <xml-file> <template-file> <output-file>');
    process.exit(1);
  }
  
  const [xmlFile, templateFile, outputFile] = args;
  generateHtml(xmlFile, templateFile, outputFile);
}

module.exports = {
  generateHtml,
  parseXmlFile,
  prepareTemplateData
};
