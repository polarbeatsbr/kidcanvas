const fs = require('fs');
const path = require('path');

const filesToCopy = [
    'style.css',
    'app.js',
    'hero_mascots.jpg',
    'magician_icon.png',
    'ninja_icon.png',
    'mascot_aprendiz.png',
    'mascot_artista.png',
    'mascot_mago.png',
    'mascot_lenda.png',
    'index.html',
    'historia.html',
    'admin.html',
    'drawings.json',
    'creation_dates.json',
    'examples_metadata.json',
    'sitemap.xml',
    'robots.txt',
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'favicon-64x64.png'
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

    // Helper to recursively copy directories
    const copyDirRecursive = (src, dest) => {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        const entries = fs.readdirSync(src, { withFileTypes: true });
        entries.forEach(entry => {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            if (entry.isDirectory()) {
                copyDirRecursive(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    };

    // Copy stickers directory
    const stickersSrc = path.join(__dirname, 'stickers');
    const stickersDest = path.join(publicDir, 'stickers');
    if (fs.existsSync(stickersSrc)) {
        copyDirRecursive(stickersSrc, stickersDest);
        console.log('Copied stickers/ directory to public/stickers/.');
    }

    console.log('Build completed successfully.');
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
}
