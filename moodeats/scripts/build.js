#!/usr/bin/env node

// Build script to combine JavaScript modules into a single file
// This creates a bundled version that works without module support

const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'dist');
const srcDir = path.join(__dirname, '..', 'src', 'js');

// Ensure dist directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Read all JavaScript files
const mealsData = fs.readFileSync(path.join(srcDir, 'meals-data.js'), 'utf8');
const nutritionData = fs.readFileSync(path.join(srcDir, 'nutrition-data.js'), 'utf8');
const storageJs = fs.readFileSync(path.join(srcDir, 'storage.js'), 'utf8');
const uiJs = fs.readFileSync(path.join(srcDir, 'ui.js'), 'utf8');
const appJs = fs.readFileSync(path.join(srcDir, 'app.js'), 'utf8');

// Remove import/export statements and combine
const bundled = `
// MoodEats Bundle - Generated from modular source files
(function() {
    'use strict';

    // ===== MEALS DATA =====
    ${mealsData.replace(/export\s*{[^}]*}/g, '').replace(/^\/\/.*$/gm, '')}

    // ===== NUTRITION DATA =====
    ${nutritionData.replace(/export\s*{[^}]*}/g, '').replace(/^\/\/.*$/gm, '')}

    // ===== STORAGE MODULE =====
    ${storageJs
        .replace(/export\s*{[^}]*}/g, '')
        .replace(/import\s*{[^}]*}\s*from\s*['"][^'"]*['"]/g, '')
        .replace(/^\/\/.*$/gm, '')}

    // ===== UI MODULE =====
    ${uiJs
        .replace(/export\s*{[^}]*}/g, '')
        .replace(/import\s*{[^}]*}\s*from\s*['"][^'"]*['"]/g, '')
        .replace(/^\/\/.*$/gm, '')}

    // ===== MAIN APP =====
    ${appJs
        .replace(/export\s*{[^}]*}/g, '')
        .replace(/import\s*{[^}]*}\s*from\s*['"][^'"]*['"]/g, '')
        .replace(/^\/\/.*$/gm, '')}
})();
`;

// Write bundled file
fs.writeFileSync(path.join(outputDir, 'moodeats-bundle.js'), bundled);

// Create index.html that uses the bundled version
const indexTemplate = fs.readFileSync(path.join(__dirname, '..', 'index-modular.html'), 'utf8');
const bundledIndex = indexTemplate
    .replace('<script type="module" src="src/js/app.js"></script>',
             '<script src="dist/moodeats-bundle.js"></script>');

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), bundledIndex);

console.log('✅ Build complete!');
console.log('📦 Bundle created at: dist/moodeats-bundle.js');
console.log('📄 Index created at: index.html');