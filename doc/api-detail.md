# API Detail (Draft)

Base: `/api`
Auth: `Authorization: Bearer <Firebase ID Token>`
Content-Type: `application/json`

## Common Errors
- 400: invalid_request
- 401: unauthorized
- 403: forbidden
- 404: not_found
- 500: internal_error

## Invites
### POST /invites (admin)
Request
```json
{
  "email": "partner@example.com",
  "expires_in_days": 7
}
```
Response
```json
{
  "id": 1,
  "email": "partner@example.com",
  "status": "pending",
  "expires_at": "2024-01-10T00:00:00+09:00"
}
```

### GET /invites/:token
Response
```json
{
  "email": "partner@example.com",
  "status": "pending",
  "expires_at": "2024-01-10T00:00:00+09:00"
}
```

### POST /invites/:token/accept
Request
```json
{
  "display_name": "Riku"
}
```
Response
```json
{
  "user_id": 1
}
```

## Users
### GET /me
Response
```json
{
  "id": 1,
  "email": "partner@example.com",
  "display_name": "Riku",
  "role": "member"
}
```

### PATCH /me
Request
```json
{
  "display_name": "Riku"
}
```
Response
```json
{
  "id": 1,
  "display_name": "Riku"
}
```

## Albums
### GET /albums
Response
```json
[
  {
    "id": 1,
    "title": "2024 Summer",
    "description": "Beach",
    "cover_photo_id": 10,
    "created_at": "2024-01-01T12:00:00+09:00"
  }
]
```

### POST /albums
Request
```json
{
  "title": "2024 Summer",
  "description": "Beach"
}
```
Response
```json
{
  "id": 1
}
```

### GET /albums/:id
Response
```json
{
  "id": 1,
  "title": "2024 Summer",
  "description": "Beach",
  "cover_photo_id": 10
}
```

### PATCH /albums/:id
Request
```json
{
  "title": "2024 Summer",
  "description": "Beach",
  "cover_photo_id": 10
}
```

### DELETE /albums/:id
Response
```json
{
  "deleted": true
}
```

## Photos
### POST /albums/:id/photos/presign
Request
```json
{
  "content_type": "image/jpeg",
  "size_bytes": 345000
}
```
Response
```json
{
  "upload_url": "https://s3...",
  "s3_key": "albums/1/uuid.jpg"
}
```

### POST /albums/:id/photos
Request
```json
{
  "s3_key": "albums/1/uuid.jpg",
  "content_type": "image/jpeg",
  "size_bytes": 345000,
  "width": 1200,
  "height": 800
}
```
Response
```json
{
  "id": 10
}
```

### GET /albums/:id/photos
Response
```json
[
  {
    "id": 10,
    "s3_key": "albums/1/uuid.jpg",
    "width": 1200,
    "height": 800
  }
]
```

### DELETE /photos/:id
Response
```json
{
  "deleted": true
}
```

## Posts
### GET /posts
Response
```json
[
  {
    "id": 1,
    "type": "blog",
    "title": "Trip",
    "body": "Nice day",
    "published_at": "2024-01-01T12:00:00+09:00"
  }
]
```

### POST /posts
Request
```json
{
  "type": "blog",
  "title": "Trip",
  "body": "Nice day",
  "album_ids": [1, 2],
  "tag_names": ["summer", "beach"]
}
```
Response
```json
{
  "id": 1
}
```

### GET /posts/:id
Response
```json
{
  "id": 1,
  "type": "blog",
  "title": "Trip",
  "body": "Nice day",
  "album_ids": [1, 2],
  "photo_ids": [10, 11],
  "tag_names": ["summer", "beach"]
}
```

### PATCH /posts/:id
Request
```json
{
  "title": "Trip update",
  "body": "Nice day",
  "album_ids": [1],
  "tag_names": ["summer"]
}
```

### DELETE /posts/:id
Response
```json
{
  "deleted": true
}
```

## Likes/Comments
### POST /posts/:id/likes
Response
```json
{
  "liked": true
}
```

### DELETE /posts/:id/likes
Response
```json
{
  "liked": false
}
```

### POST /posts/:id/comments
Request
```json
{
  "body": "So nice"
}
```
Response
```json
{
  "id": 100
}
```

### DELETE /comments/:id
Response
```json
{
  "deleted": true
}
```

## Notifications
### GET /notifications
Response
```json
[
  {
    "id": 1,
    "category": "new_post",
    "title": "New post",
    "body": "Trip",
    "read_at": null
  }
]
```

### PATCH /notifications/:id/read
Response
```json
{
  "read": true
}
```

### GET /notification-settings
Response
```json
[
  { "category": "new_post", "enabled": true },
  { "category": "new_comment", "enabled": true },
  { "category": "anniversary", "enabled": true },
  { "category": "trip", "enabled": true }
]
```

### PUT /notification-settings
Request
```json
[
  { "category": "new_post", "enabled": true },
  { "category": "new_comment", "enabled": true },
  { "category": "anniversary", "enabled": true },
  { "category": "trip", "enabled": true }
]
```
Response
```json
{
  "updated": true
}
```

### POST /web-push/subscriptions
Request
```json
{
  "endpoint": "https://fcm...",
  "auth": "...",
  "p256dh": "..."
}
```
Response
```json
{
  "id": 1
}
```

### DELETE /web-push/subscriptions/:id
Response
```json
{
  "deleted": true
}
```

## Anniversaries
### GET /anniversaries
Response
```json
[
  {
    "id": 1,
    "title": "Anniversary",
    "date": "2024-06-01T00:00:00+09:00",
    "remind_days_before": 7,
    "remind_at": "2024-05-25T09:00:00+09:00"
  }
]
```

### POST /anniversaries
Request
```json
{
  "title": "Anniversary",
  "date": "2024-06-01",
  "remind_days_before": 7,
  "remind_at": "2024-05-25T09:00:00+09:00",
  "note": "Cafe"
}
```
Response
```json
{
  "id": 1
}
```

### PATCH /anniversaries/:id
Request
```json
{
  "title": "Anniversary",
  "remind_at": "2024-05-25T09:00:00+09:00"
}
```

### DELETE /anniversaries/:id
Response
```json
{
  "deleted": true
}
```

## Trips
### GET /trips
Response
```json
[
  {
    "id": 1,
    "title": "Okinawa",
    "start_at": "2024-08-01T10:00:00+09:00",
    "end_at": "2024-08-05T18:00:00+09:00",
    "notify_at": "2024-07-25T09:00:00+09:00"
  }
]
```

### POST /trips
Request
```json
{
  "title": "Okinawa",
  "start_at": "2024-08-01T10:00:00+09:00",
  "end_at": "2024-08-05T18:00:00+09:00",
  "note": "Summer",
  "notify_at": "2024-07-25T09:00:00+09:00"
}
```
Response
```json
{
  "id": 1
}
```

### PATCH /trips/:id
Request
```json
{
  "title": "Okinawa",
  "notify_at": "2024-07-25T09:00:00+09:00"
}
```

### DELETE /trips/:id
Response
```json
{
  "deleted": true
}
```

## Trip Itineraries
### POST /trips/:id/itineraries
Request
```json
{
  "title": "Flight",
  "start_at": "2024-08-01T10:00:00+09:00",
  "end_at": "2024-08-01T12:00:00+09:00",
  "location": "Haneda",
  "note": ""
}
```
Response
```json
{
  "id": 1
}
```

### PATCH /itineraries/:id
Request
```json
{
  "title": "Flight",
  "start_at": "2024-08-01T10:00:00+09:00",
  "end_at": "2024-08-01T12:00:00+09:00"
}
```

### DELETE /itineraries/:id
Response
```json
{
  "deleted": true
}
```

## Trip Wishlist
### POST /trips/:id/wishlists
Request
```json
{
  "title": "Aquarium",
  "location": "Naha",
  "note": ""
}
```
Response
```json
{
  "id": 1
}
```

### PATCH /wishlists/:id
Request
```json
{
  "title": "Aquarium",
  "priority": 2
}
```

### DELETE /wishlists/:id
Response
```json
{
  "deleted": true
}
```

## Trip Expenses
### POST /trips/:id/expenses
Request
```json
{
  "title": "Hotel",
  "category": "stay",
  "amount": 30000,
  "currency": "JPY",
  "is_actual": false,
  "note": ""
}
```
Response
```json
{
  "id": 1
}
```

### PATCH /expenses/:id
Request
```json
{
  "amount": 32000,
  "is_actual": true
}
```

### DELETE /expenses/:id
Response
```json
{
  "deleted": true
}
```
