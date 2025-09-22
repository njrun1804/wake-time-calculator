#!/usr/bin/env node

// Build script for the simplified browse-only version

const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'dist');
const srcDir = path.join(__dirname, '..', 'src', 'js');

// Ensure dist directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Read JavaScript files
const mealsData = fs.readFileSync(path.join(srcDir, 'meals-data.js'), 'utf8')
    .replace(/export\s*{[^}]*};?/g, '')
    .replace(/^\/\/.*$/gm, '');

const nutritionData = fs.readFileSync(path.join(srcDir, 'nutrition-data.js'), 'utf8')
    .replace(/export\s*{[^}]*};?/g, '')
    .replace(/^\/\/.*$/gm, '');

const appJs = fs.readFileSync(path.join(srcDir, 'app-simple.js'), 'utf8')
    .replace(/export\s*{[^}]*};?/g, '')
    .replace(/import\s*{[^}]*}\s*from\s*['""][^'"]*['""];?/g, '')
    .replace(/^\/\/.*$/gm, '');

// Create the bundle
const bundle = `// MoodEats Browse-Only Bundle
// Generated from src/js/* files

(function() {
    'use strict';

    // ===== MEALS DATA =====
    ${mealsData}

    // ===== NUTRITION DATA =====
    ${nutritionData}

    // ===== MAIN APPLICATION =====
    ${appJs}

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Initializing MoodEats Browse...');
            if (typeof initializeApp === 'function') {
                initializeApp();
            }
        });
    } else {
        console.log('Initializing MoodEats Browse (DOM ready)...');
        if (typeof initializeApp === 'function') {
            initializeApp();
        }
    }
})();
`;

// Write the bundle
fs.writeFileSync(path.join(outputDir, 'moodeats-simple.js'), bundle);

// Update main index.html
fs.copyFileSync(path.join(__dirname, '..', 'index-simple.html'), path.join(__dirname, '..', 'index.html'));

// Also copy to repository root for GitHub Pages
fs.writeFileSync(path.join(__dirname, '..', '..', 'index.html'), fs.readFileSync(path.join(__dirname, '..', 'index.html')));
fs.writeFileSync(path.join(__dirname, '..', '..', 'dist', 'moodeats-simple.js'), bundle);

// Copy CSS if it exists
const cssDir = path.join(__dirname, '..', 'src', 'css');
if (fs.existsSync(cssDir)) {
    const rootSrcDir = path.join(__dirname, '..', '..', 'src');
    if (!fs.existsSync(rootSrcDir)) {
        fs.mkdirSync(rootSrcDir, { recursive: true });
    }
    const rootCssDir = path.join(rootSrcDir, 'css');
    if (!fs.existsSync(rootCssDir)) {
        fs.mkdirSync(rootCssDir, { recursive: true });
    }

    const cssFile = path.join(cssDir, 'styles.css');
    if (fs.existsSync(cssFile)) {
        fs.copyFileSync(cssFile, path.join(rootCssDir, 'styles.css'));
    }
}

console.log('✅ Build complete!');
console.log('📦 Bundle: dist/moodeats-simple.js');
console.log('📄 Index: index.html');
console.log('🌐 Simplified browse-only version ready for GitHub Pages');