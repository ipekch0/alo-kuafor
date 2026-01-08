const fs = require('fs');
const path = require('path');

// Directories to process
const DIRS = [
    path.join(__dirname, '..', 'src'),
    path.join(__dirname, '..', 'server', 'src'),
    path.join(__dirname, '..', 'server') // Be careful with node_modules here
];

const EXTENSIONS = ['.js', '.jsx', '.css', '.html'];

// Regex to match comments
// 1. /* Multi-line */
// 2. // Single line (careful with http://)
// Note: This regex is decent but not perfect for strings containing comment markers.
const COMMENT_REGEX = /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm;

function removeComments(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Apply regex
        // The regex captures the character before // in group 1 to preserve it (unless it's start of line)
        const newContent = content.replace(COMMENT_REGEX, (match, group1) => {
            if (match.startsWith('/*')) return ''; // Block comment -> empty
            return group1 || ''; // Line comment -> return the char before // (or empty if start of line)
        });

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Cleaned: ${filePath}`);
        }
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
    }
}

function processDir(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (item === 'node_modules' || item === '.git' || item === 'dist') continue;
            processDir(fullPath);
        } else if (stat.isFile()) {
            const ext = path.extname(item);
            if (EXTENSIONS.includes(ext) && item !== 'remove-comments.js') {
                removeComments(fullPath);
            }
        }
    }
}

console.log('Starting comment removal...');
DIRS.forEach(d => {
    console.log(`Processing directory: ${d}`);
    processDir(d);
});
console.log('Cleanup complete.');
