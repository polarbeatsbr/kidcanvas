const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

const filesToCopy = [
    'hero_mascots.png',
    'hero_mascots.webp',
    'magician_icon.png',
    'magician_icon.webp',
    'ninja_icon.png',
    'ninja_icon.webp',
    'mascot_aprendiz.png',
    'mascot_aprendiz.webp',
    'mascot_artista.png',
    'mascot_artista.webp',
    'mascot_mago.png',
    'mascot_mago.webp',
    'mascot_lenda.png',
    'mascot_lenda.webp',
    'perigo-artista.png',
    'perigo-artista.webp',
    'perigo-casinha.png',
    'perigo-casinha.webp',
    'index.html',
    'historia.html',
    'admin.html',
    'admin-expeditions.html',
    'drawings.json',
    'creation_dates.json',
    'examples_metadata.json',
    'sitemap.xml',
    'robots.txt',
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'favicon-64x64.png',
    'og-image.jpg',
    'apple-touch-icon.png',
    'android-chrome-192.png',
    'android-chrome-512.png',
    'manifest.json',
    'sw.js',
    'painel-teste.html',
    'painel-teste2.html'
];

const publicDir = path.join(__dirname, 'public');

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

async function build() {
    try {
        // Create public directory if it doesn't exist
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
            console.log('Created public/ directory.');
        }

        // Copy each static file
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

        // Copy stickers directory
        const stickersSrc = path.join(__dirname, 'stickers');
        const stickersDest = path.join(publicDir, 'stickers');
        if (fs.existsSync(stickersSrc)) {
            copyDirRecursive(stickersSrc, stickersDest);
            console.log('Copied stickers/ directory to public/stickers/.');
        }

        // Copy WebP directories if they exist in the root folder
        const localWebpDirs = ['images-webp', 'drawings-webp', 'mascots-webp'];
        localWebpDirs.forEach(dirName => {
            const src = path.join(__dirname, dirName);
            const dest = path.join(publicDir, dirName);
            if (fs.existsSync(src)) {
                copyDirRecursive(src, dest);
                console.log(`Copied local WebP folder ${dirName}/ to public/${dirName}/.`);
            }
        });

        // Minify app.js
        console.log('Minifying JS (app.js)...');
        const jsSrcPath = path.join(__dirname, 'app.js');
        const jsDestPath = path.join(publicDir, 'app.js');
        if (fs.existsSync(jsSrcPath)) {
            const jsInput = fs.readFileSync(jsSrcPath, 'utf8');
            const jsResult = await minify(jsInput, {
                compress: { drop_console: true },
                mangle: true,
            });
            fs.writeFileSync(jsDestPath, jsResult.code, 'utf8');
            const jsBefore = Buffer.byteLength(jsInput) / 1024;
            const jsAfter = Buffer.byteLength(jsResult.code) / 1024;
            console.log(`JS: ${jsBefore.toFixed(0)}KB → ${jsAfter.toFixed(0)}KB`);
        } else {
            console.error('Error: app.js source file not found!');
        }

        // Minify style.css
        console.log('Minifying CSS (style.css)...');
        const cssSrcPath = path.join(__dirname, 'style.css');
        const cssDestPath = path.join(publicDir, 'style.css');
        if (fs.existsSync(cssSrcPath)) {
            const cssInput = fs.readFileSync(cssSrcPath, 'utf8');
            const cssResult = new CleanCSS({ level: 2 }).minify(cssInput);
            fs.writeFileSync(cssDestPath, cssResult.styles, 'utf8');
            const cssBefore = Buffer.byteLength(cssInput) / 1024;
            const cssAfter = Buffer.byteLength(cssResult.styles) / 1024;
            console.log(`CSS: ${cssBefore.toFixed(0)}KB → ${cssAfter.toFixed(0)}KB`);
        } else {
            console.error('Error: style.css source file not found!');
        }

        console.log('Build completed successfully.');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
