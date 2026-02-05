# 思い出memoria

大切な思い出を安全にプライベートに保存・共有できるWebアプリケーションです。

## 機能

- 👥 グループ単位でのデータ管理
- 📝 投稿機能（ブログ/メモ）
- 📸 アルバム・写真管理
- 🏷️ タグ検索
- ❤️ いいね・コメント
- 🎂 記念日管理（予定）
- ✈️ 旅行計画（スケジュール・交通・宿泊・予算）
- 🔔 通知機能（予定）
- 🔐 招待制プライベート運用
- 💳 サブスクリプション（予定）

## 技術スタック

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Firebase Authentication

### Backend
- Go 1.22
- Echo (Web Framework)
- GORM (ORM)
- PostgreSQL
- S3 (画像ストレージ)

## デプロイ

### Railway へのデプロイ

Backend を Railway にデプロイする手順は [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) を参照してください。

Railway は `DATABASE_URL` 環境変数に自動対応しています。

## セットアップ

### 必要な環境変数

1. **ルートディレクトリの `.env`** (Docker Compose用):
```bash
cp .env.example .env
# PostgreSQLとポート設定のみ
```

2. **Backend の `.env`**:
```bash
cd backend
cp .env.example .env
# Firebase、S3 などを設定
```

3. **Frontend の `.env.local`**:
```bash
cd frontend
cp .env.example .env.local
# FirebaseのフロントエンドSDK設定を入力
```

### 開発環境の起動

**Docker Composeで起動:**
```bash
docker-compose up -d
```

**または個別に起動:**

Backend:
```bash
cd backend
# 環境変数を読み込んで起動
export $(cat .env | xargs)
go run cmd/server/main.go
```

Frontend:
```bash
cd frontend
npm install
npm run dev
# .env.localは自動的に読み込まれます
```

### アクセス

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Database: localhost:5432

## 初回セットアップ

1. Firebase プロジェクトを作成
2. Firebase Authentication でメール/パスワード認証を有効化
3. サービスアカウントキーを取得
4. S3バケットを作成（または互換ストレージ）
5. 環境変数を設定
6. 管理者ユーザーを招待

## ドキュメント

詳細な仕様は `doc/` ディレクトリを参照してください。

| ファイル | 内容 |
|----------|------|
| [overview.md](./doc/overview.md) | 概要・技術スタック |
| [features.md](./doc/features.md) | 機能一覧 |
| [screens.md](./doc/screens.md) | 画面一覧 |
| [api.md](./doc/api.md) | API一覧 |
| [api-detail.md](./doc/api-detail.md) | API詳細 |
| [data-model.md](./doc/data-model.md) | データモデル |
| [db-schema.md](./doc/db-schema.md) | DBスキーマ |
| [subscription.md](./doc/subscription.md) | サブスクリプション仕様 |
| [admin-operations.md](./doc/admin-operations.md) | 管理者作業一覧 |
| [auth-and-invite.md](./doc/auth-and-invite.md) | 認証・招待 |
| [notifications.md](./doc/notifications.md) | 通知機能 |
| [pwa.md](./doc/pwa.md) | PWA |
| [storage.md](./doc/storage.md) | ストレージ |
| [architecture.md](./doc/architecture.md) | アーキテクチャ |

## ライセンス

Proprietary License - All Rights Reserved

詳細は [LICENSE](./LICENSE) を参照してください。
