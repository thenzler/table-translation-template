# Table Translation Template

A simple and effective system for displaying tables with their translations side by side. This tool helps you visualize and compare original content with its translations, making it easy to identify what has been translated and what hasn't.

## Features

- Side-by-side comparison of original and translated tables
- Visual highlighting of untranslated content
- Responsive design that works on desktop and mobile
- Automatic detection of identical content (potentially untranslated)
- Easy to customize and extend

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- npm or yarn

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/thenzler/table-translation-template.git
   cd table-translation-template
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Usage

1. Prepare your XML data file following the structure in `sample-data.xml`:
   ```xml
   <document>
     <tables>
       <table id="original">
         <!-- Original table structure -->
       </table>
       <table id="translated">
         <!-- Translated table structure -->
       </table>
     </tables>
   </document>
   ```

2. Run the generation script:
   ```
   node generate.js your-data.xml template.hbs output.html
   ```

   Or use the npm script with the sample data:
   ```
   npm run generate
   ```

3. Open the generated HTML file in your browser to view the comparison.

## Customization

### Modifying the Template

The `template.hbs` file uses Handlebars syntax and can be customized to change the appearance and behavior of the comparison:

- Edit the CSS in the `<style>` section to change colors, spacing, etc.
- Modify the HTML structure to change the layout
- Add or remove JavaScript functionality as needed

### Custom Data Structure

If your XML data has a different structure, you'll need to modify the parsing logic in `generate.js`. Look for the `prepareTemplateData` function and adjust it to match your data format.

## Example Output

When you run the generator with the sample data, you'll see:

- Tables displayed side by side (original and translated)
- Column headers showing what fields have been translated
- Table cells with different colors indicating:
  - Regular cells (translated content)
  - Red background (not translated - identical to original)
  - Yellow background (translated but potentially needs review)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Converting Your Template

If you're currently using a different template syntax (like the one in your example with `${doc.root.table[0].row}`), you'll need to adapt your data to the XML format used by this tool. The primary differences are:

1. This tool uses a more structured XML approach
2. Tables are explicitly paired (original and translated)
3. Translation status is automatically detected

The template provided will handle the display logic for you, highlighting what's translated and what isn't.
