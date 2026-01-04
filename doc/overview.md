# Overview

恋人向けの思い出保存アプリ（Web）。
ブログ/メモ投稿、写真アルバム、タグ検索、いいね/コメント、旅行計画、記念日リマインド、通知を提供する。

## Goals
- 思い出（投稿・写真）を安全に保存
- 招待制でプライベート運用
- かわいく大人っぽいUI
- PC/スマホ両対応

## Tech Stack
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, PWA
- Backend: Go (Echo), Clean Architecture, GORM
- DB: PostgreSQL (Railway)
- Storage: S3 (署名URL)
- Auth: Firebase Authentication (email/password)
- Web Push: Firebase Cloud Messaging (FCM)
