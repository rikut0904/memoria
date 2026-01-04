# API (Draft)

Base: `/api`
Auth: Firebase ID Token (Bearer)

## Health
- GET `/health`

## Auth / Invite
- POST `/invites` (admin) 招待メール送信
- GET `/invites/:token` 招待トークン検証
- POST `/invites/:token/accept` 招待承認

## Users
- GET `/me` 自分の情報
- PATCH `/me` 表示名更新

## Albums
- GET `/albums`
- POST `/albums`
- GET `/albums/:id`
- PATCH `/albums/:id`
- DELETE `/albums/:id`

## Photos
- POST `/albums/:id/photos/presign` 署名URL取得
- POST `/albums/:id/photos` メタデータ登録
- GET `/albums/:id/photos`
- DELETE `/photos/:id`

## Posts
- GET `/posts`
- POST `/posts`
- GET `/posts/:id`
- PATCH `/posts/:id`
- DELETE `/posts/:id`

## Post Relations
- POST `/posts/:id/albums` アルバム紐付け
- DELETE `/posts/:id/albums/:albumId` 紐付け解除
- POST `/posts/:id/photos` 写真紐付け
- DELETE `/posts/:id/photos/:photoId`

## Tags
- GET `/tags`

## Likes/Comments
- POST `/posts/:id/likes`
- DELETE `/posts/:id/likes`
- POST `/posts/:id/comments`
- DELETE `/comments/:id`

## Notifications
- GET `/notifications`
- PATCH `/notifications/:id/read`
- GET `/notification-settings`
- PUT `/notification-settings`
- POST `/web-push/subscriptions`
- DELETE `/web-push/subscriptions/:id`

## Anniversaries
- GET `/anniversaries`
- POST `/anniversaries`
- PATCH `/anniversaries/:id`
- DELETE `/anniversaries/:id`

## Trips
- GET `/trips`
- POST `/trips`
- GET `/trips/:id`
- PATCH `/trips/:id`
- DELETE `/trips/:id`

## Trip Itineraries
- POST `/trips/:id/itineraries`
- PATCH `/itineraries/:id`
- DELETE `/itineraries/:id`

## Trip Wishlist
- POST `/trips/:id/wishlists`
- PATCH `/wishlists/:id`
- DELETE `/wishlists/:id`

## Trip Expenses
- POST `/trips/:id/expenses`
- PATCH `/expenses/:id`
- DELETE `/expenses/:id`
