.PHONY: help install serve test test-unit test-core test-watch coverage format validate docker-build docker-run docker-dev docker-test docker-logs docker-stop clean clean-cache deps-check deps-audit docs ci quick optimize-git

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

serve: ## Start development server
	npm run serve

test: ## Run all tests
	npm test

test-unit: ## Run unit tests only
	npm run test:unit

test-core: ## Run core integration tests
	npm run test:core

test-watch: ## Watch unit tests for changes
	npm run test:unit:watch

watch: test-watch ## Alias for test-watch

coverage: ## Generate code coverage report
	npm run test:unit:coverage
	@echo "📊 Coverage report: file://$(PWD)/coverage/index.html"

format: ## Format code
	npm run format

lint-fix: ## Fix linting issues automatically
	npm run lint:fix

validate: ## Run all validations
	npm run validate:all

docker-build: ## Build Docker production image
	docker build -t wake-time-calculator:latest .

docker-run: docker-build ## Run production Docker container
	docker run -d -p 8080:80 --name wake-time-calculator wake-time-calculator:latest
	@echo "App running at http://localhost:8080"

docker-dev: ## Run development server in Docker
	docker-compose up dev

docker-test: ## Run all tests in Docker
	docker-compose up playwright --abort-on-container-exit
	docker-compose down

docker-logs: ## View Docker container logs
	docker-compose logs -f

docker-stop: ## Stop and remove Docker containers
	docker-compose down
	-docker stop wake-time-calculator 2>/dev/null
	-docker rm wake-time-calculator 2>/dev/null

clean: ## Clean temporary files and caches
	rm -rf node_modules
	rm -rf playwright-report
	rm -rf test-results
	rm -rf coverage
	rm -rf .vscode/chrome-debug
	find . -name ".DS_Store" -delete

clean-cache: ## Quick clean of test artifacts only
	npm run clean:cache

deps-check: ## Check for outdated packages
	@echo "🔍 Checking for outdated packages..."
	@npm outdated || true

deps-audit: ## Check for security vulnerabilities
	@echo "🔒 Checking for security vulnerabilities..."
	@npm audit

# docs: ## Generate API documentation (jsdoc dependencies removed)
#	@echo "⚠️  API documentation generation has been removed"

ci: ## Run full CI suite locally
	@echo "🔄 Running full CI pipeline..."
	@npm run validate:all
	@npm run test:ci
	@echo "✅ CI checks passed!"

quick: ## Quick validation (no tests)
	@echo "⚡ Running quick checks..."
	@npm run lint
	@npm run validate:html
	@echo "✅ Quick checks passed!"

optimize-git: ## Optimize git repository for performance
	@echo "🔧 Optimizing git repository..."
	@git gc --aggressive --prune=now
	@git repack -Ad
	@git prune
	@echo "✅ Git optimization complete!"