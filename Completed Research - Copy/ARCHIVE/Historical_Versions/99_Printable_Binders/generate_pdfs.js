/**
 * Export Markdown to Print-Ready HTML
 * 
 * This script reads all Markdown files in the 99_Printable_Binders directory
 * and converts them into a single, print-ready HTML file.
 * We are generating HTML instead of PDF directly to avoid complex local binary dependencies
 * like Puppeteer or wkhtmltopdf, which can fail across different OS environments.
 * 
 * To use this file:
 * 1. Open the generated `Printable_Binders_Master.html` in Chrome or Edge.
 * 2. Press Ctrl+P (or Cmd+P) to open the print dialog.
 * 3. Set "Destination" to "Save as PDF".
 * 4. Under "More settings", ensure "Background graphics" is checked (for styling).
 * 5. Ensure "Headers and footers" is UNCHECKED (we handle margins via CSS).
 */

const fs = require('fs');
const path = require('path');

// Simple Markdown parser (handles headers, bold, lists, and quotes)
function parseMarkdown(text) {
    let html = text;

    // Remove YAML frontmatter if it exists
    html = html.replace(/^---[\s\S]*?---\n/, '');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Bold text
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Checkboxes (Unchecked)
    html = html.replace(/^- \[ \] (.*$)/gim, '<div class="checkbox-item"><span class="box"></span>$1</div>');
    
    // Checkboxes (Checked)
    html = html.replace(/^- \[x\] (.*$)/gim, '<div class="checkbox-item"><span class="box checked"></span>$1</div>');

    // Bullet Lists (Convert remaining standard bullets that aren't checkboxes)
    html = html.replace(/^- (?!\[)(.*$)/gim, '<div class="bullet-item">• $1</div>');

    // Tables (Basic support)
    html = html.replace(/^\|(.*)\|$/gim, (match, p1) => {
        const cells = p1.split('|').map(c => `<td>${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
    });
    // Wrap consecutive table rows in table tags and remove markdown separator rows
    html = html.replace(/(<tr>.*?<\/tr>\s*)+/gs, match => {
        const cleanedMatch = match.replace(/<tr><td>:---.*?<\/tr>/g, '');
        if (!cleanedMatch.trim()) return '';
        return `<table>${cleanedMatch}</table>`;
    });

    // Paragraphs (wrap anything that isn't already an HTML tag)
    html = html.split('\n').map(line => {
        const trimmed = line.trim();
        if (trimmed === '' || trimmed.startsWith('<') || trimmed === '---') {
            return line; // Preserve empty lines and existing HTML
        }
        return `<p>${trimmed}</p>`;
    }).join('\n');

    // Horizontal Rules
    html = html.replace(/^---$/gim, '<hr>');

    return html;
}

const CSS_STYLES = `
    @page {
        size: letter;
        margin: 1in;
    }
    
    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #000; /* Force black text for ink efficiency */
        background: #fff;
        max-width: 8.5in;
        margin: 0 auto;
        padding: 20px;
    }

    /* Force Page Breaks */
    .document-page {
        page-break-after: always;
        padding-bottom: 20px;
        position: relative;
        min-height: 9.5in; /* Ensure footer pushes to bottom */
    }
    
    .document-page:last-child {
        page-break-after: avoid;
    }

    /* Prevent orphaned headers at the bottom of a page */
    h2, h3 {
        page-break-after: avoid;
        margin-top: 1.5em;
        border-bottom: 1px solid #ddd;
        padding-bottom: 5px;
    }

    h1 {
        font-size: 24pt;
        text-transform: uppercase;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
        margin-bottom: 30px;
    }

    /* Checkbox Styling */
    .checkbox-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 12px;
        page-break-inside: avoid;
    }
    
    .checkbox-item .box {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #000;
        margin-right: 12px;
        margin-top: 4px;
        flex-shrink: 0;
    }

    .bullet-item {
        margin-bottom: 8px;
        padding-left: 20px;
        text-indent: -15px;
        page-break-inside: avoid;
    }

    /* Table Styling for physical writing */
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        margin-bottom: 20px;
        page-break-inside: avoid;
    }
    
    th, td {
        border: 1px solid #000;
        padding: 12px 8px;
        text-align: left;
    }
    
    /* Make blank cells in tables large enough to write in */
    td:empty, td:contains("____") {
        min-height: 30px;
    }

    /* Callouts */
    blockquote {
        border-left: 4px solid #000;
        margin: 0 0 20px 0;
        padding: 10px 20px;
        background-color: #f9f9f9;
        font-weight: bold;
    }

    /* Header/Footer Meta data extracted from raw markdown */
    .meta-header {
        font-family: monospace;
        font-size: 10pt;
        color: #666;
        margin-bottom: 40px;
    }
    
    .meta-footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        font-family: monospace;
        font-size: 10pt;
        color: #666;
        text-align: center;
        border-top: 1px solid #ddd;
        padding-top: 10px;
    }
`;

function generateHTML() {
    const dir = 'C:\\Rental Docs\\99_Printable_Binders';
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'PRINTABLE_BINDER_INDEX.md' && f !== 'BINDER_AUDIT_REPORT.md' && f !== 'PRINTABLE_STYLE_GUIDE.md' && f !== 'BINDER_USAGE_SYSTEM.md' && f !== 'INDEX.md');

    let allContent = '';

    files.forEach((file, index) => {
        const filePath = path.join(dir, file);
        const rawText = fs.readFileSync(filePath, 'utf8');
        
        // Extract meta header and footer if they exist (the [PROPERTY...] and [ICON...] tags)
        const headerMatch = rawText.match(/^\[PROPERTY.*\]\n\[BINDER.*\]/m);
        const footerMatch = rawText.match(/^\[.*\] \| 7513 Ballydawn/m);
        
        const headerHtml = headerMatch ? `<div class="meta-header">${headerMatch[0].replace(/\n/g, '<br>')}</div>` : '';
        const footerHtml = footerMatch ? `<div class="meta-footer">${footerMatch[0]}</div>` : '';

        const parsedContent = parseMarkdown(rawText);
        
        const pageContent = `
            <div class="document-page">
                ${headerHtml}
                ${parsedContent}
                ${footerHtml}
            </div>
        `;
        
        const finalHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>${file.replace('.md', '')}</title>
        <style>${CSS_STYLES}</style>
    </head>
    <body>
        ${pageContent}
    </body>
    </html>
    `;

        const outDir = path.join(dir, 'exports');
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir);
        }

        const outFileName = file.replace('.md', '.html');
        const outputPath = path.join(outDir, outFileName);
        fs.writeFileSync(outputPath, finalHtml);
        console.log(`Successfully generated exports/${outFileName}`);
    });
}

generateHTML();