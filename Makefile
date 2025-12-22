SHELL := /usr/bin/bash
.DEFAULT_GOAL := help

BUNDLE := bundle
JEKYLL := $(BUNDLE) exec jekyll
HOST ?= 0.0.0.0
PORT ?= 4000
GEM_BIN := $(shell /usr/bin/ruby -e 'require "rubygems"; print Gem.user_dir + "/bin"')

help: ## Show this help
	@echo "Available targets:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) | awk -F':|##' '{printf "  %-20s %s\n", $$1, $$3}'

install-deps: ## Install system packages (Ruby, build tools)
	sudo apt update
	sudo apt install -y ruby-full build-essential zlib1g-dev

bundle-setup: ## Install bundler and project gems to vendor/
	gem install --user-install bundler && \
	export PATH="$(GEM_BIN):$${PATH}" && \
	bundle config set path 'vendor/bundle' && \
	bundle install

webrick: ## Add webrick if serve complains about missing webrick
	PATH="$(GEM_BIN):$${PATH}" $(BUNDLE) add webrick

serve: ## Serve with live-reload at http://$(HOST):$(PORT)
	PATH="$(GEM_BIN):$$PATH" $(JEKYLL) serve --livereload --host $(HOST) --port $(PORT)

serve-poll: ## Serve with force polling (useful in VMs/WSL)
	PATH="$(GEM_BIN):$$PATH" $(JEKYLL) serve --livereload --host $(HOST) --port $(PORT) --force_polling

build: ## Build site into _site
	PATH="$(GEM_BIN):$$PATH" $(JEKYLL) build

build-prod: ## Production build
	PATH="$(GEM_BIN):$$PATH" JEKYLL_ENV=production $(JEKYLL) build

clean: ## Clean generated files
	PATH="$(GEM_BIN):$$PATH" $(JEKYLL) clean
	rm -rf vendor/bundle

doctor: ## Check site for common problems
	PATH="$(GEM_BIN):$$PATH" $(JEKYLL) doctor

update: ## Update gems
	PATH="$(GEM_BIN):$$PATH" $(BUNDLE) update

open: ## Open the cheating page in browser
	xdg-open http://localhost:$(PORT)/cheating.html || true

quickstart: install-deps bundle-setup serve ## Install all and serve

# ============== React Tests ==============

test: ## Run all React tests once
	cd muqawamah-react && npm run test:run

test-watch: ## Run React tests in watch mode
	cd muqawamah-react && npm run test:watch

test-coverage: ## Run React tests with coverage report
	cd muqawamah-react && npm run test:coverage

unittest: ## Run unit tests only
	cd muqawamah-react && npx vitest run src/__tests__/unit/

integration: ## Run integration tests only
	cd muqawamah-react && npx vitest run src/__tests__/integration/

test-supabase: ## Run Supabase connection tests (requires network)
	cd muqawamah-react && npm run test:supabase

precommit: ## Run tests and build (pre-push check)
	cd muqawamah-react && SKIP_SUPABASE_TESTS=true npm run test:run && npm run build

.PHONY: help install-deps bundle-setup webrick serve serve-poll build build-prod clean doctor update open quickstart test test-watch test-coverage unittest integration test-supabase precommit 