# Architecture

## Repo Structure
- frontend/
- backend/
- doc/

## Docker
- frontend: Next.js
- backend: Go + Echo
- db: Postgres

## Backend (Clean Architecture)
- domain: エンティティ
- usecase: ビジネスロジック
- adapter: HTTP/DB/外部サービス
- di: 依存注入

## Security
- Firebase Authで認証
- 管理者は `create-admin` コマンドで登録
- 招待制
- S3はプライベート、署名URLでアップロード

## PWA
- manifest + service worker
- アプリ風の起動体験
- キャッシュで安定性向上
