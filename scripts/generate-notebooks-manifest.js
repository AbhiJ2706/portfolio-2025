const fs = require('fs');
const path = require('path');

/**
 * Script to generate a manifest of all notebooks in the public/notebooks folder
 * This allows the React app to dynamically list and link to notebooks
 */

const notebooksDir = path.join(__dirname, '..', 'public', 'notebooks');
const manifestPath = path.join(__dirname, '..', 'src', 'notebooks-manifest.json');
const overridesPath = path.join(__dirname, '..', 'src', 'notebook-overrides.json');
const legacyDatesPath = path.join(__dirname, '..', 'src', 'notebook-dates.json');

// Load overrides if the file exists
let overrides = {};
try {
  // Try new format first
  if (fs.existsSync(overridesPath)) {
    const overridesData = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
    overrides = overridesData.notebookOverrides || {};
    console.log(`Loaded ${Object.keys(overrides).length} notebook override(s) from notebook-overrides.json`);
  } 
  // Fallback to legacy format for backward compatibility
  else if (fs.existsSync(legacyDatesPath)) {
    const datesData = JSON.parse(fs.readFileSync(legacyDatesPath, 'utf8'));
    const dateOverrides = datesData.notebookDates || {};
    // Convert legacy format to new format
    Object.keys(dateOverrides).forEach(filename => {
      overrides[filename] = {
        date: dateOverrides[filename],
        title: null,
        description: null
      };
    });
    console.log(`Loaded ${Object.keys(overrides).length} date override(s) from legacy notebook-dates.json`);
  }
} catch (error) {
  console.warn('Warning: Could not load notebook overrides:', error.message);
}

// Ensure notebooks directory exists
if (!fs.existsSync(notebooksDir)) {
  fs.mkdirSync(notebooksDir, { recursive: true });
  console.log('Created notebooks directory');
}

// Read all files in the notebooks directory
let notebooks = [];
try {
  const files = fs.readdirSync(notebooksDir);
  
  notebooks = files
    .filter(file => file.endsWith('.ipynb'))
    .map(file => {
      const filePath = path.join(notebooksDir, file);
      try {
        // Try to read the notebook to extract metadata
        const notebookContent = fs.readFileSync(filePath, 'utf8');
        const notebook = JSON.parse(notebookContent);
        
        // Get overrides for this notebook
        const notebookOverride = overrides[file] || {};
        
        // Extract title - check override first, then auto-extract
        let title;
        if (notebookOverride.title !== undefined && notebookOverride.title !== null) {
          // Use override title
          title = notebookOverride.title;
        } else {
          // Auto-extract title from metadata or use filename
          title = notebook.metadata?.title;
          
          // If no title in metadata, try to extract from first markdown cell heading
          if (!title || title === 'Python 3 (ipykernel)' || title.includes('ipykernel')) {
            const firstMarkdownCell = notebook.cells?.find(cell => {
              if (cell.cell_type !== 'markdown' || !cell.source) return false;
              if (Array.isArray(cell.source)) {
                return cell.source.some(line => line && typeof line === 'string' && line.trim().startsWith('#'));
              }
              return typeof cell.source === 'string' && cell.source.trim().startsWith('#');
            });
            if (firstMarkdownCell && firstMarkdownCell.source) {
              const source = Array.isArray(firstMarkdownCell.source) 
                ? firstMarkdownCell.source.join('') 
                : firstMarkdownCell.source;
              // Look for first # heading (can be #, ##, ###, etc.) - match across lines
              const lines = source.split('\n');
              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#')) {
                  title = trimmed.replace(/^#+\s+/, '').trim();
                  break;
                }
              }
            }
          }
          
          // Fallback to filename if still no good title
          if (!title || title === 'Python 3 (ipykernel)' || title.includes('ipykernel')) {
            title = file.replace('.ipynb', '')
                       .replace(/_/g, ' ')
                       .replace(/-/g, ' ')
                       .split(' ')
                       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                       .join(' ');
          }
        }
        
        // Get date - check override first, then use file modification date
        let lastModified;
        if (notebookOverride.date !== undefined && notebookOverride.date !== null) {
          // Use override date
          lastModified = notebookOverride.date;
        } else {
          // Use file modification date
          const stats = fs.statSync(filePath);
          lastModified = stats.mtime.toISOString();
        }
        
        // Get description - check override first, then auto-extract
        let description;
        if (notebookOverride.description !== undefined && notebookOverride.description !== null) {
          // Use override description
          description = notebookOverride.description;
        } else {
          // Auto-extract description from first markdown cell
          description = extractDescription(notebook);
        }
        
        return {
          filename: file,
          title: title,
          lastModified: lastModified,
          description: description
        };
      } catch (error) {
        // If we can't parse the notebook, just use the filename
        console.warn(`Warning: Could not parse ${file}:`, error.message);
        return {
          filename: file,
          title: file.replace('.ipynb', '').replace(/_/g, ' ').replace(/-/g, ' '),
          lastModified: new Date().toISOString(),
          description: null
        };
      }
    })
    .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)); // Sort by most recent first
} catch (error) {
  console.error('Error reading notebooks directory:', error);
  notebooks = [];
}

// Write manifest file
const manifest = {
  notebooks: notebooks,
  generatedAt: new Date().toISOString()
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Generated notebooks manifest with ${notebooks.length} notebook(s):`);
notebooks.forEach(nb => {
  console.log(`  - ${nb.filename} (${nb.title})`);
});

/**
 * Extract a description from the first markdown cell of the notebook
 */
function extractDescription(notebook) {
  if (!notebook.cells || !Array.isArray(notebook.cells)) {
    return null;
  }
  
  // Find first markdown cell
  const firstMarkdownCell = notebook.cells.find(cell => cell.cell_type === 'markdown');
  if (!firstMarkdownCell || !firstMarkdownCell.source) {
    return null;
  }
  
  // Get first paragraph (first few lines, up to 200 chars)
  const source = Array.isArray(firstMarkdownCell.source) 
    ? firstMarkdownCell.source.join('') 
    : firstMarkdownCell.source;
  
  // Remove markdown headers and get first paragraph
  const text = source
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '') // Remove italic
    .trim()
    .split('\n')
    .filter(line => line.trim().length > 0)
    .slice(0, 3) // First 3 lines
    .join(' ')
    .substring(0, 200);
  
  return text.length > 0 ? text : null;
}

