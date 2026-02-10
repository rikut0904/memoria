NEXTJS_PROJECTS := frontend auth admin help info contact
DEFAULT_SERVICES := backend frontend auth admin help info contact

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

build: install ## 全サービスビルド（起動なし）
	docker compose build

ps: ## コンテナ状態確認
	docker compose ps

# ============================================================
# 個別起動
# ============================================================

.PHONY: up-frontend up-auth up-admin up-help up-info up-contact up-backend

up-frontend:
	docker compose up --build frontend

up-auth:
	docker compose up --build auth

up-admin:
	docker compose up --build admin

up-help:
	docker compose up --build help

up-info:
	docker compose up --build info

up-contact:
	docker compose up --build contact

up-backend:
	docker compose up --build backend

# ============================================================
# Lint
# ============================================================

.PHONY: lint lint-frontend lint-auth lint-admin lint-help lint-info lint-contact lint-backend

lint: lint-frontend lint-auth lint-admin lint-help lint-info lint-contact lint-backend ## 全プロジェクト lint

lint-frontend:
	cd frontend && npm run lint

lint-auth:
	cd auth && npm run lint

lint-admin:
	cd admin && npm run lint

lint-help:
	cd help && npm run lint

lint-info:
	cd info && npm run lint

lint-contact:
	cd contact && npm run lint

lint-backend:
	cd backend && go vet ./...

# ============================================================
# Format
# ============================================================

.PHONY: fmt fmt-frontend fmt-auth fmt-admin fmt-help fmt-info fmt-contact fmt-backend

fmt: fmt-frontend fmt-auth fmt-admin fmt-help fmt-info fmt-contact fmt-backend ## 全プロジェクト format

fmt-frontend:
	cd frontend && npx prettier --write .

fmt-auth:
	cd auth && npx prettier --write .

fmt-admin:
	cd admin && npx prettier --write .

fmt-help:
	cd help && npx prettier --write .

fmt-info:
	cd info && npx prettier --write .

fmt-contact:
	cd contact && npx prettier --write .

fmt-backend:
	cd backend && gofmt -w .

# ============================================================
# TypeScript 型チェック
# ============================================================

.PHONY: typecheck

type: ## 全 Next.js プロジェクトで型チェック
	@for proj in $(NEXTJS_PROJECTS); do \
		echo "=== typecheck: $$proj ==="; \
		(cd $$proj && npx tsc --noEmit); \
	done

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

clean: ## .next/ node_modules/ package-lock.json 削除
	@for proj in $(NEXTJS_PROJECTS); do \
		echo "=== clean: $$proj ==="; \
		rm -rf $$proj/.next $$proj/node_modules $$proj/package-lock.json; \
	done

# ============================================================
# ヘルプ
# ============================================================

.PHONY: help

help: ## Makefile のターゲット一覧
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
