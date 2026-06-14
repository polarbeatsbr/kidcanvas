const fs = require('fs');
const path = require('path');

const filesToCopy = [
    'style.css',
    'app.js',
    'hero_mascots.jpg',
    'index.html',
    'drawings.json',
    'creation_dates.json'
];

const publicDir = path.join(__dirname, 'public');

try {
    // Create public directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
        console.log('Created public/ directory.');
    }

    // Copy each file
    filesToCopy.forEach(file => {
        const src = path.join(__dirname, file);
        const dest = path.join(publicDir, file);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            console.log(`Copied ${file} to public/.`);
        } else {
            console.warn(`Warning: Source file ${file} does not exist.`);
        }
    });

    console.log('Build completed successfully.');
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
}
