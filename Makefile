.PHONY: help install serve test format validate docker-build docker-run docker-dev clean

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

format: ## Format code
	npm run format

validate: ## Run all validations
	npm run validate:all

docker-build: ## Build Docker production image
	docker build -t wake-time-calculator:latest .

docker-run: docker-build ## Run production Docker container
	docker run -d -p 8080:80 --name wake-time-calculator wake-time-calculator:latest
	@echo "App running at http://localhost:8080"

docker-dev: ## Run development server in Docker
	docker-compose up dev

docker-stop: ## Stop and remove Docker containers
	docker-compose down
	-docker stop wake-time-calculator 2>/dev/null
	-docker rm wake-time-calculator 2>/dev/null

clean: ## Clean temporary files and caches
	rm -rf node_modules
	rm -rf playwright-report
	rm -rf test-results
	rm -rf .vscode/chrome-debug
	find . -name ".DS_Store" -delete