#!/usr/bin/env node

// Simple build script that concatenates all JS into one file
// This creates a working bundle for GitHub Pages

const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'dist');
const srcDir = path.join(__dirname, '..', 'src', 'js');

// Ensure dist directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Read the modular HTML
const indexModular = fs.readFileSync(path.join(__dirname, '..', 'index-modular.html'), 'utf8');

// Read all JavaScript files and combine them
const mealsData = fs.readFileSync(path.join(srcDir, 'meals-data.js'), 'utf8')
    .replace(/export\s*{[^}]*};?/g, '')
    .replace(/^\/\/.*$/gm, '');

const nutritionData = fs.readFileSync(path.join(srcDir, 'nutrition-data.js'), 'utf8')
    .replace(/export\s*{[^}]*};?/g, '')
    .replace(/^\/\/.*$/gm, '');

const storageJs = fs.readFileSync(path.join(srcDir, 'storage.js'), 'utf8')
    .replace(/export\s*{[^}]*};?/g, '')
    .replace(/import\s*{[^}]*}\s*from\s*['""][^'"]*['""];?/g, '')
    .replace(/^\/\/.*$/gm, '');

const uiJs = fs.readFileSync(path.join(srcDir, 'ui.js'), 'utf8')
    .replace(/export\s*{[^}]*};?/g, '')
    .replace(/import\s*{[^}]*}\s*from\s*['""][^'"]*['""];?/g, '')
    .replace(/^\/\/.*$/gm, '');

const appJs = fs.readFileSync(path.join(srcDir, 'app.js'), 'utf8')
    .replace(/export\s*{[^}]*};?/g, '')
    .replace(/import\s*{[^}]*}\s*from\s*['""][^'"]*['""];?/g, '')
    .replace(/^\/\/.*$/gm, '')
    // Remove the DOMContentLoaded listener since we'll add our own
    .replace(/document\.addEventListener\('DOMContentLoaded'[\s\S]*?\}\);/g, '');

// Create the bundle with proper initialization
const bundle = `// MoodEats Bundle - Auto-generated
// DO NOT EDIT - Generated from src/js/* files

(function() {
    'use strict';

    // ===== MEALS DATA =====
    ${mealsData}

    // ===== NUTRITION DATA =====
    ${nutritionData}

    // ===== STORAGE FUNCTIONS =====
    ${storageJs}

    // ===== UI FUNCTIONS =====
    ${uiJs}

    // ===== MAIN APPLICATION =====
    ${appJs}

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Initializing MoodEats...');
            if (typeof setCurrentDate === 'function') {
                setCurrentDate();
            }
            if (typeof initializeApp === 'function') {
                initializeApp();
            }
        });
    } else {
        console.log('Initializing MoodEats (DOM ready)...');
        if (typeof setCurrentDate === 'function') {
            setCurrentDate();
        }
        if (typeof initializeApp === 'function') {
            initializeApp();
        }
    }
})();
`;

// Write the bundle
fs.writeFileSync(path.join(outputDir, 'moodeats-bundle.js'), bundle);

// Create production index.html
const productionIndex = indexModular
    .replace('<script type="module" src="src/js/app.js"></script>',
             '<script src="dist/moodeats-bundle.js"></script>');

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), productionIndex);

// Also copy to repository root for GitHub Pages
fs.writeFileSync(path.join(__dirname, '..', '..', 'index.html'), productionIndex);
fs.writeFileSync(path.join(__dirname, '..', '..', 'dist', 'moodeats-bundle.js'), bundle);

console.log('✅ Build complete!');
console.log('📦 Bundle: dist/moodeats-bundle.js');
console.log('📄 Index: index.html');
console.log('🌐 Root files updated for GitHub Pages');