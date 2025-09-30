# Development Setup Guide

This document explains how to set up your development environment for the Wake Time Calculator project.

## Prerequisites

- Node.js 18+ (for development tools)
- Python 3+ (for development server)
- Git (for version control)
- Modern browser (Chrome, Firefox, Safari, or Edge)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/njrun1804/wake-time-calculator.git
cd wake-time-calculator

# Install development dependencies
npm install

# Start development server
npm run serve

# Open in browser
# Navigate to http://localhost:8000
```

## Development Tools

### Code Editor
- VS Code recommended
- Install extensions:
  - Prettier (for code formatting)
  - ESLint (optional, for code quality)
  - HTML CSS Support
  - JavaScript (ES6) code snippets

### Browser DevTools
- Use Chrome DevTools or Firefox Developer Tools
- Essential panels:
  - Console (for debugging)
  - Network (for API monitoring)
  - Application (for Local Storage inspection)
  - Performance (for optimization)

## Project Scripts

```bash
# Development server (required for ES6 modules)
npm run serve              # Python HTTP server on port 8000

# Testing
npm test                   # Run all Playwright tests
npm run test:unit         # Unit tests only
npm run test:core         # Core functionality tests
npm run test:awareness    # Weather awareness tests
npm run test:performance  # Performance benchmarks
npm run test:ci          # CI test suite

# Code Quality
npm run lint              # Check formatting
npm run format            # Auto-format code
npm run validate:html     # Validate HTML
npm run validate:all      # All validations

# Git Hooks (automatic)
npm run prepare           # Install Husky hooks
```

## Development Workflow

### 1. Making Changes
```bash
# Create feature branch
git checkout -b feature/your-feature

# Start dev server
npm run serve

# Make changes and test locally
# Browser auto-reloads on file save
```

### 2. Testing Your Changes
```bash
# Run relevant tests
npm run test:unit         # For logic changes
npm test                  # For UI changes

# Check code quality
npm run lint
npm run validate:html
```

### 3. Committing Changes
```bash
# Stage changes
git add .

# Commit (Husky runs pre-commit hooks)
git commit -m "feat: your feature description"

# Push (Husky runs pre-push hooks)
git push origin feature/your-feature
```

## File Structure

```
wake-time-calculator/
├── index.html           # Main application
├── css/main.css        # Styles
├── js/
│   ├── app/            # Application modules
│   └── lib/            # Utility libraries
├── tests/              # Test suites
├── scripts/            # Helper scripts
└── docs/               # Documentation
```

## API Configuration

The application uses free, no-key-required APIs:
- **Open-Meteo**: Weather data
- **SunriseSunset.io**: Dawn/dusk times

No API keys or environment variables needed!

## Browser Support

Ensure testing on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Common Development Tasks

### Add New Feature
1. Create module in `js/app/`
2. Import in `main.js`
3. Add UI to `index.html`
4. Write tests in `tests/`
5. Update documentation

### Debug Issues
1. Check browser console for errors
2. Inspect Network tab for API calls
3. Review Local Storage data
4. Run relevant test suite
5. Use browser debugger

### Optimize Performance
1. Run performance tests: `npm run test:performance`
2. Use browser Performance tab
3. Check network waterfall
4. Minimize reflows/repaints
5. Optimize API calls with caching

## Troubleshooting

### ES6 Module Errors
- **Problem**: "Failed to load module script"
- **Solution**: Use HTTP server, not file:// URLs
- **Run**: `npm run serve` or `python3 -m http.server 8000`

### CORS Issues
- **Problem**: "CORS policy blocked"
- **Solution**: Use proper HTTP server
- **Note**: APIs work from localhost

### Test Failures
- **Problem**: Playwright tests fail
- **Solution**: Install browsers: `npx playwright install`
- **Check**: Node version 18+

### Formatting Issues
- **Problem**: Pre-commit hooks fail
- **Solution**: Run `npm run format`
- **Configure**: VS Code to format on save

## Git Hooks

Husky automatically runs:
- **Pre-commit**: Prettier formatting via lint-staged
- **Pre-push**: Format check + unit tests

To skip hooks (emergency only):
```bash
git commit --no-verify
git push --no-verify
```

## CI/CD Pipeline

GitHub Actions runs:
- Format checking
- HTML validation
- Full test suite
- Performance tests
- Script sanity checks

## Best Practices

1. **Test First**: Write tests before features
2. **Small Commits**: Make focused, atomic commits
3. **Clear Messages**: Use conventional commit format
4. **Update Docs**: Keep documentation current
5. **Review Coverage**: Maintain test coverage
6. **Performance**: Monitor load times
7. **Accessibility**: Test with screen readers
8. **Mobile First**: Design for mobile devices

## Resources

- [Project README](../README.md)
- [CLAUDE.md](../CLAUDE.md) - Detailed architecture docs
- [Migration Guide](../MIGRATION.md) - Project history
- [MDN Web Docs](https://developer.mozilla.org/) - Web standards
- [Playwright Docs](https://playwright.dev/) - Testing framework