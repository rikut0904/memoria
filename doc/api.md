# API (Draft)

Base: `/api`
Auth: Firebase ID Token (Bearer) + X-Group-ID ヘッダー（グループスコープAPI）

## Health
- GET `/health`

## Auth
- POST `/login` ログイン
- POST `/signup` 新規登録
- POST `/logout` ログアウト
- POST `/refresh` トークンリフレッシュ

## Invites（公開）
- GET `/invites/:token` 招待トークン検証
- POST `/invites/:token/signup` 招待経由で新規登録

## Users
- GET `/me` 自分の情報
- PATCH `/me` 表示名更新

## Invites（認証後）
- POST `/invites/:token/accept` 招待承認
- POST `/invites/:token/decline` 招待拒否

## Groups
- GET `/groups` 自分が所属するグループ一覧
- POST `/groups` グループ作成
- GET `/groups/:id/members` グループメンバー一覧

## Group Invites（グループスコープ）
- POST `/invites` 招待メール送信
- GET `/invites` グループの招待一覧
- DELETE `/invites/:id` 招待削除

## Albums（グループスコープ）
- GET `/albums`
- POST `/albums`
- GET `/albums/:id`
- PATCH `/albums/:id`
- DELETE `/albums/:id`

## Photos（グループスコープ）
- GET `/albums/:id/photos`
- POST `/albums/:id/photos/presign` 署名URL取得
- POST `/albums/:id/photos` メタデータ登録
- DELETE `/photos/:id`

## Posts（グループスコープ）
- GET `/posts`
- POST `/posts`
- GET `/posts/:id`
- PATCH `/posts/:id`
- DELETE `/posts/:id`

## Post Relations（グループスコープ）
- POST `/posts/:id/albums` アルバム紐付け
- DELETE `/posts/:id/albums/:albumId` 紐付け解除
- POST `/posts/:id/photos` 写真紐付け
- DELETE `/posts/:id/photos/:photoId`

## Tags（グループスコープ）
- GET `/tags`

## Likes/Comments（グループスコープ）
- POST `/posts/:id/likes`
- DELETE `/posts/:id/likes`
- GET `/posts/:id/comments`
- POST `/posts/:id/comments`
- DELETE `/comments/:id`

## Trips（グループスコープ）
- GET `/trips`
- POST `/trips`
- GET `/trips/:id`
- PATCH `/trips/:id`
- DELETE `/trips/:id`

## Trip Schedule（グループスコープ）
- GET `/trips/:id/schedule`
- PUT `/trips/:id/schedule`

## Trip Transports（グループスコープ）
- GET `/trips/:id/transports`
- PUT `/trips/:id/transports`

## Trip Lodgings（グループスコープ）
- GET `/trips/:id/lodgings`
- PUT `/trips/:id/lodgings`

## Trip Budget（グループスコープ）
- GET `/trips/:id/budget`
- PUT `/trips/:id/budget`

## Admin（システム管理者のみ）
- GET `/users` ユーザー一覧
- GET `/users/:id` ユーザー詳細
- PATCH `/users/:id/role` ロール変更
- DELETE `/users/:id` ユーザー削除

### Notifications
- GET `/notifications`
- PATCH `/notifications/:id/read`
- GET `/notification-settings`
- PUT `/notification-settings`
- POST `/web-push/subscriptions`
- DELETE `/web-push/subscriptions/:id`

### Anniversaries
- GET `/anniversaries`
- POST `/anniversaries`
- PATCH `/anniversaries/:id`
- DELETE `/anniversaries/:id`

### Subscription
- GET `/me/subscription` 自分のサブスク状況
- POST `/subscriptions/checkout` Checkoutセッション作成
- POST `/subscriptions/portal` Customer Portalセッション作成
- POST `/webhooks/stripe` Stripe Webhook受信
