NEXTJS_PROJECTS := frontend auth admin info contact help

# ============================================================
# Docker操作
# ============================================================

.PHONY: up down logs build ps install

up: ## 全サービス起動
	docker compose up --build

down: ## 全サービス停止
	docker compose down

logs: ## 全ログ表示
	docker compose logs -f

install: ## 全 Next.js プロジェクトの npm install
	@for proj in $(NEXTJS_PROJECTS); do \
		echo "=== npm install: $$proj ==="; \
		(cd $$proj && npm install); \
	done

build: 
	docker compose build

ps: ## コンテナ状態確認
	docker compose ps

# ============================================================
# 個別起動
# ============================================================

.PHONY: up-frontend up-backend up-auth up-admin up-info up-contact up-help

up-backend:
	docker compose up --build backend

up-frontend:
	docker compose up --build frontend backend

up-auth:
	docker compose up --build auth backend

up-admin:
	docker compose up --build admin backend

up-info:
	docker compose up --build info backend

up-contact:
	docker compose up --build contact backend

up-help:
	docker compose up --build help backend

# ============================================================
# build
# ============================================================
.PHONY: build-frontend build-backend build-auth build-admin build-info build-contact build-help

build-frontend:
	cd frontend && npm run build

build-backend:
	cd backend && go build ./...

build-auth:
	cd auth && npm run build

build-admin:
	cd admin && npm run build

build-info:
	cd info && npm run build

build-contact:
	cd contact && npm run build

build-help:
	cd help && npm run build

# ============================================================
# install
# ============================================================

.PHONY: install-frontend install-backend install-auth install-admin install-info install-contact install-help

install-frontend:
	cd frontend && npm install

install-backend:
	cd backend && go mod tidy

install-auth:
	cd auth && npm install

install-admin:
	cd admin && npm install

install-info:
	cd info && npm install

install-contact:
	cd contact && npm install

install-help:
	cd help && npm install

# ============================================================
# Lint
# ============================================================

.PHONY: lint lint-frontend lint-backend lint-auth lint-admin lint-info lint-contact lint-help

lint: lint-frontend lint-backend lint-auth lint-admin lint-info lint-help lint-contact ## 全プロジェクト lint

lint-frontend:
	cd frontend && npm run lint

lint-backend:
	cd backend && go vet ./...

lint-auth:
	cd auth && npm run lint

lint-admin:
	cd admin && npm run lint

lint-info:
	cd info && npm run lint

lint-contact:
	cd contact && npm run lint

lint-help:
	cd help && npm run lint

# ============================================================
# Format
# ============================================================

.PHONY: fmt fmt-frontend fmt-backend fmt-auth fmt-admin fmt-info fmt-contact fmt-help

fmt: fmt-frontend fmt-backend fmt-auth fmt-admin fmt-info fmt-help fmt-contact ## 全プロジェクト format

fmt-frontend:
	cd frontend && npx prettier --write .

fmt-backend:
	cd backend && gofmt -w .

fmt-auth:
	cd auth && npx prettier --write .

fmt-admin:
	cd admin && npx prettier --write .

fmt-info:
	cd info && npx prettier --write .

fmt-contact:
	cd contact && npx prettier --write .

fmt-help:
	cd help && npx prettier --write .

# ============================================================
# TypeScript 型チェック
# ============================================================

.PHONY: typecheck type-frontend type-backend type-auth type-admin type-info type-contact type-help

type: ## 全 Next.js プロジェクトで型チェック
	@for proj in $(NEXTJS_PROJECTS); do \
		echo "=== typecheck: $$proj ==="; \
		(cd $$proj && npx tsc --noEmit); \
	done

type-frontend:
	cd frontend && npx tsc --noEmit

type-backend:
	cd backend && go vet ./...

type-auth:
	cd auth && npx tsc --noEmit

type-admin:
	cd admin && npx tsc --noEmit

type-info:
	cd info && npx tsc --noEmit

type-contact:
	cd contact && npx tsc --noEmit

type-help:
	cd help && npx tsc --noEmit

# ============================================================
# Test
# ============================================================

.PHONY: test test-backend

test: test-backend ## 全テスト

test-backend:
	cd backend && go test ./...

# ============================================================
# クリーン
# ============================================================

.PHONY: clean

clean: clean-frontend clean-backend clean-auth clean-admin clean-info clean-contact clean-help ## .next/ node_modules/ package-lock.json 削除

clean-frontend:
	cd frontend && rm -rf .next node_modules package-lock.json

clean-backend:
	cd backend && rm -rf .next node_modules package-lock.json

clean-auth:
	cd auth && rm -rf .next node_modules package-lock.json

clean-admin:
	cd admin && rm -rf .next node_modules package-lock.json

clean-info:
	cd info && rm -rf .next node_modules package-lock.json

clean-contact:
	cd contact && rm -rf .next node_modules package-lock.json

clean-help:
	cd help && rm -rf .next node_modules package-lock.json

# ============================================================
# 開発用コマンド
# ============================================================

.PHONY: dev dev-frontend dev-backend dev-auth dev-admin dev-info dev-contact dev-help

dev: dev-frontend dev-backend dev-auth dev-admin dev-info dev-contact dev-help ## 全プロジェクト開発

dev-frontend:
	make clean-frontend
	make install-frontend
	make build-frontend
	make lint-frontend
	make type-frontend
	make fmt-frontend

dev-backend:
	make clean-backend
	make build-backend
	make lint-backend
	make type-backend
	make fmt-backend
	make test-backend

dev-auth:
	make clean-auth
	make install-auth
	make build-auth
	make lint-auth
	make type-auth
	make fmt-auth

dev-admin:
	make clean-admin
	make install-admin
	make build-admin
	make lint-admin
	make type-admin
	make fmt-admin

dev-info:
	make clean-info
	make install-info
	make build-info
	make lint-info
	make type-info
	make fmt-info

dev-contact:
	make clean-contact
	make install-contact
	make build-contact
	make lint-contact
	make type-contact
	make fmt-contact

dev-help:
	make clean-help
	make install-help
	make build-help
	make lint-help
	make type-help
	make fmt-help

# ============================================================
# ヘルプ
# ============================================================

.PHONY: help

help: ## Makefile のターゲット一覧
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
