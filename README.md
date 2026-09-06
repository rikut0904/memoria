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

### 環境

環境は `local`、`stg`、`prod` の3種類です。PRごとの `preview` 環境は使用しません。

- `local`: Docker Compose内のPostgreSQL、Firebase Emulator、LocalStackだけで動作
- `stg`: 検証用Firebase/AWS/PostgreSQL
- `prod`: 本番用Firebase/AWS/PostgreSQL

### Railway へのデプロイ

Backend を Railway にデプロイする手順は [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) を参照してください。

Railway は `DATABASE_URL` 環境変数に自動対応しています。

## セットアップ

### 環境変数

ローカル開発は `docker-compose.yml` に定義したPostgreSQL、Firebase Emulator、LocalStackを利用するため、`.env.local.example` は不要です。`make up` で起動できます。

各ディレクトリの `.env.example` はstg/prodのデプロイ先へ登録する変数一覧です。実際の秘密値はファイルへコミットせず、Railway・Vercel等の環境変数へ登録してください。

### 開発環境の起動

**起動:**
```bash
make up
```

ローカルの入口は `http://localhost:23000`、認証は `http://localhost:23001` です。Firebase Emulator UIは `http://localhost:29000`、LocalStackは `http://localhost:24566`、PostgreSQLは `localhost:25432` で確認できます。

停止は `make down` を使います。Firebase Emulator、PostgreSQL、LocalStackのデータはDocker volumeへ保存され、停止・再起動では削除されません。Firebase Emulatorは停止時に自動エクスポートします。

ローカルデータを初期化する場合だけ `make clean/all`（volume削除を含む）を使います。

### アクセス

- Frontend: http://localhost:23000
- Backend API: http://localhost:28080
- Database: localhost:25432

## 初回セットアップ

1. ローカルは `make up` で依存サービスを起動
2. Firebase Emulator UIでメール/パスワードユーザーを確認・作成
3. `backend/cmd/create-admin` で管理者ユーザーを作成
4. stg/prodのみ、各環境のFirebase/AWS/PostgreSQLと環境変数を設定

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
