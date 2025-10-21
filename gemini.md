# Gemini Project Documentation: Wake Time Calculator

This document provides a summary of the Wake Time Calculator project, including its architecture, technology stack, and development workflows.

## Project Overview

The Wake Time Calculator is a weather-aware utility for runners. It calculates optimal wake times based on a user's first meeting, planned run duration, and local weather conditions. The application is a vanilla JavaScript single-page application (SPA) that runs entirely in the browser, with no server-side backend or build step required for the core functionality.

## Technology Stack

-   **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
-   **Testing**:
    -   **End-to-End & Integration**: Playwright
    -   **Unit**: Node.js native test runner (`node:test`)
    -   **Code Coverage**: `c8`
-   **Code Quality**:
    -   **Formatting**: Prettier
    -   **Linting**: ESLint
    -   **HTML Validation**: `html-validate`
-   **Development Server**: `http-server`
-   **Package Manager**: npm
-   **CI/CD**: GitHub Actions
-   **Containerization**: Docker and Docker Compose

## Project Structure

```
/
├── src/                     # Application source code
│   ├── index.html           # Main application HTML
│   ├── css/                 # Styles
│   └── js/                  # JavaScript modules
│       ├── app/             # Application-specific logic
│       └── lib/             # Core utility libraries
├── tests/                   # Test suites
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests (Playwright)
│   ├── visual/              # Visual regression tests (Playwright)
│   └── performance/         # Performance tests (Playwright)
├── .github/                 # GitHub Actions workflows
├── docs/                    # Project documentation
└── scripts/                 # Utility scripts
```

## Key Components

-   **`src/js/lib/calculator.js`**: Contains the core logic for calculating wake times. The calculation is a simple subtraction of activity durations (prep time, run, travel, breakfast) from a target meeting time and does not involve sleep cycles.
-   **`src/js/app/main/`**: Orchestrates the application, initializes modules, and manages state.
-   **`src/js/app/ui.js`**: Manages all DOM interactions and UI updates.
-   **`src/js/app/weather/`**: Handles integration with the Open-Meteo weather API, including data fetching and analysis.
-   **`src/js/app/dawn/`**: Integrates with the SunriseSunset.io API to fetch dawn and dusk times.
-   **`src/js/app/location/`**: Manages user location via browser geolocation or manual input.
-   **`src/js/lib/storage.js`**: Handles persistence of user preferences and location data in `localStorage`.

## Development Workflow

### Prerequisites

This project requires:
- **Node.js** >= 20.19.0 (managed via `.nvmrc`)
- **npm** >= 10.0.0

If using nvm (recommended):
```bash
nvm use
```

### Installation

```bash
npm install
```

### Running Locally

A local server is required to handle ES6 module imports.

```bash
npm run serve
```

The application will be available at `http://localhost:8000/`.

### Testing

The project has a comprehensive test suite.

-   **Run all tests (Playwright)**:
    ```bash
    npm run test
    ```
-   **Run unit tests**:
    ```bash
    npm run test:unit
    ```
-   **Run unit tests in watch mode**:
    ```bash
    npm run test:unit:watch
    ```
-   **Run unit tests with coverage**:
    ```bash
    npm run test:unit:coverage
    ```
-   **Run specific Playwright test suites**:
    ```bash
    npm run test:core       # Core functionality tests
    npm run test:awareness  # Weather-aware feature tests
    npm run test:performance# Performance tests
    npm run test:visual     # Visual regression tests
    ```
-   **Update visual snapshots**:
    ```bash
    npm run test:visual:update
    ```

### Code Quality

-   **Check formatting and linting**:
    ```bash
    npm run lint
    ```
-   **Fix formatting and linting errors**:
    ```bash
    npm run lint:fix
    ```
-   **Validate HTML**:
    ```bash
    npm run validate:html
    ```
-   **Run all validation checks**:
    ```bash
    npm run validate:all
    ```

## CI/CD

GitHub Actions are configured to run on every push and pull request. The CI pipeline (`.github/workflows/ci.yml`) executes the following:

1.  Lints and validates the code (`npm run validate:all`).
2.  Runs the full Playwright test suite (`npm test`).

## Docker

The project includes Docker support for both development and production.

-   **Run development server in Docker**:
    ```bash
    docker-compose up dev
    ```
-   **Build and run production container**:
    ```bash
    make docker-run
    ```
