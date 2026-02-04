# DB Schema (draft)

## Users
- users: id, firebase_uid, email, display_name, role, created_at, updated_at
- groups: id, name, created_by, created_at, updated_at
- group_members: group_id, user_id, role, joined_at
- invites: id, group_id, email, token, status, role, expires_at, invited_by

## Albums/Photos/Posts
- albums: id, group_id, title, description, cover_photo_id, created_by
- photos: id, group_id, album_id, s3_key, content_type, size_bytes, width, height, uploaded_by
- posts: id, group_id, type, title, body, author_id, published_at
- album_posts: album_id, post_id, created_at
- post_photos: post_id, photo_id, created_at
- tags: id, name
- post_tags: post_id, tag_id, created_at
- post_likes: post_id, user_id, created_at
- post_comments: id, post_id, user_id, body, created_at, updated_at

## Notifications
- notification_settings: id, user_id, category, enabled
- notifications: id, user_id, category, title, body, read_at
- web_push_subscriptions: id, user_id, endpoint, auth, p256dh

## Anniversaries
- anniversaries: id, group_id, title, date, remind_days_before, remind_at, note, created_by

## Trips
- trips: id, group_id, title, start_at, end_at, note, created_by, notify_at
- trip_itineraries: id, trip_id, title, start_at, end_at, location, note
- trip_wishlists: id, trip_id, title, location, note, priority
- trip_expenses: id, trip_id, title, category, amount, currency, is_actual, note
