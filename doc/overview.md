# Overview

**思い出memoria** - 思い出保存アプリ。
グループ単位でブログ/メモ投稿、写真アルバム、タグ検索、いいね/コメント、旅行計画、記念日リマインド、通知を提供する。

## Goals
- 思い出（投稿・写真）を保存
- グループ単位で招待制のプライベート運用
- かわいく大人っぽいUI
- PC/スマホ両対応（レスポンシブ + ハンバーガーメニュー）

## Tech Stack
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, PWA
- Backend: Go (Echo), Clean Architecture, GORM
- DB: PostgreSQL (Railway)
- Storage: S3 (署名URL)
- Auth: Firebase Authentication (email/password)
- Web Push: Firebase Cloud Messaging (FCM)

## 外部連携
- Stripe: サブスクリプション決済
- Qiita: 投稿保存時にQiitaへ同時投稿（Premiumのみ）
- Discord/Slack: 通知先として利用

## ビジネスモデル
- Freeプラン: 広告あり、機能制限あり
- Premiumプラン: 広告なし、全機能利用可能（月額課金）
