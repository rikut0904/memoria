# Subscription

## Status
- 未実装

## Overview
Stripeを利用したサブスクリプション機能。
無料プランと有料プラン（Premium）を提供し、広告非表示や機能制限解除を行う。

## Plans

| プラン | 料金 | 説明 |
|--------|------|------|
| **Free** | ¥0 | 広告あり、機能制限あり |
| **Premium** | ¥300〜500/月（要検討） | 広告なし、全機能利用可能 |

## Feature Limits

| 機能 | Free | Premium |
|------|------|---------|
| 広告表示 | あり | なし |
| グループ作成数 | 1個 | 無制限 |
| アルバム作成数 | 3個/グループ | 無制限 |
| 写真アップロード容量 | 100MB/月 | 無制限 |
| 旅行プラン作成数 | 2個/グループ | 無制限 |
| 記念日登録数 | 5個 | 無制限 |
| Qiita連携 | ❌ | ✅ |

※制限値は要検討

## Stripe Integration

### 使用するStripe機能
- **Checkout**: 決済ページ（Stripeホスト）
- **Customer Portal**: プラン変更・解約・支払い方法変更
- **Webhooks**: イベント通知（支払い成功/失敗、解約等）
- **Billing**: サブスクリプション管理

### Webhook Events
| Event | 処理内容 |
|-------|----------|
| `checkout.session.completed` | サブスク開始、DBにsubscription作成 |
| `invoice.paid` | 支払い成功、period_end更新 |
| `invoice.payment_failed` | 支払い失敗、status更新、通知 |
| `customer.subscription.updated` | プラン変更、status更新 |
| `customer.subscription.deleted` | 解約完了、status更新 |

## User Flow

### 新規登録〜Premium加入
1. ユーザー登録（Freeプランで開始）
2. アプリ内で「Premiumにアップグレード」ボタン
3. Stripe Checkoutへリダイレクト
4. 決済完了 → Webhook受信 → DB更新
5. アプリに戻る（Premium適用済み）

### プラン変更・解約
1. アプリ内で「プラン管理」ボタン
2. Stripe Customer Portalへリダイレクト
3. プラン変更 or 解約
4. Webhook受信 → DB更新
5. アプリに戻る

### 支払い失敗時
1. Stripe側でリトライ（設定による）
2. 失敗継続 → Webhook受信
3. ユーザーにメール/アプリ内通知
4. 猶予期間後、Freeプランに降格

## API

### Subscription APIs
- `GET /me/subscription` - 自分のサブスク状況取得
- `POST /subscriptions/checkout` - Checkoutセッション作成
- `POST /subscriptions/portal` - Customer Portalセッション作成
- `POST /webhooks/stripe` - Webhook受信エンドポイント

### Response Example
```json
GET /me/subscription
{
  "plan": "premium",
  "status": "active",
  "current_period_end": "2026-03-05T00:00:00Z",
  "cancel_at_period_end": false
}
```
