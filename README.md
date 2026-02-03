# Memoria - 思い出保存アプリ

大切な思い出を安全にプライベートに保存・共有できるWebアプリケーションです。

## 機能

- 📝 投稿機能（ブログ/メモ）
- 📸 アルバム・写真管理
- 🏷️ タグ検索
- ❤️ いいね・コメント
- 🎂 記念日管理
- ✈️ 旅行計画
- 🔐 招待制プライベート運用

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
# Firebase、S3、管理者メールなどを設定
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

## ライセンス

Private - 個人使用のみ
