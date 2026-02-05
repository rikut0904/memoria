# Data Model

## Users & Groups
- users: id, firebase_uid, email, display_name, role, last_access_at, created_at, updated_at
- groups: id, name, created_by, created_at, updated_at
- group_members: group_id, user_id, role(manager/member), joined_at
- invites: id, group_id, email, token, status, role, expires_at, invited_by, created_at, updated_at

## Albums/Photos/Posts
- albums: id, group_id, title, description, cover_photo_id, created_by, created_at, updated_at
- photos: id, group_id, album_id, s3_key, content_type, size_bytes, width, height, uploaded_by, created_at, updated_at
- posts: id, group_id, type, title, body, author_id, published_at, created_at, updated_at
- album_posts: album_id, post_id, created_at
- post_photos: post_id, photo_id, created_at
- tags: id, name, created_at, updated_at
- post_tags: post_id, tag_id, created_at
- post_likes: post_id, user_id, created_at
- post_comments: id, post_id, user_id, body, created_at, updated_at

## Subscription
- subscriptions: id, user_id, stripe_customer_id, stripe_subscription_id, plan(free/premium), status(active/canceled/past_due/incomplete), current_period_end, cancel_at_period_end, created_at, updated_at

## Notifications
- notification_settings: id, user_id, category, enabled, created_at, updated_at
- notifications: id, user_id, category, title, body, read_at, created_at, updated_at
- web_push_subscriptions: id, user_id, endpoint, auth, p256dh, created_at, updated_at

## Anniversaries
- anniversaries: id, group_id, title, date, remind_days_before, remind_at, note, created_by

## Trips
- trips: id, group_id, title, start_at, end_at, note, created_by, notify_at, created_at, updated_at
- trip_albums: trip_id, album_id, created_at
- trip_posts: trip_id, post_id, created_at

### Trip Schedule
- trip_schedule_items: id, trip_id, date(YYYY-MM-DD), time(HH:MM), content, created_at, updated_at

### Trip Transports
- trip_transports: id, trip_id, mode, date, from_location, to_location, note, departure_time, arrival_time, route_name, train_name, ferry_name, flight_number, airline, terminal, company_name, pickup_location, dropoff_location, rental_url, distance_km, fuel_efficiency_km_per_l, gasoline_price_yen_per_l, gasoline_cost_yen, highway_cost_yen, rental_fee_yen, fare_yen, created_at, updated_at
  - mode: car, rental, train, shinkansen, ferry, flight, bus

### Trip Lodgings
- trip_lodgings: id, trip_id, date, name, reservation_url, address, check_in, check_out, reservation_number, cost_yen, created_at, updated_at

### Trip Budget
- trip_budget_items: id, trip_id, name, cost_yen, created_at, updated_at

### Legacy（旧仕様、未使用の可能性あり）
- trip_itineraries: id, trip_id, title, start_at, end_at, location, note
- trip_wishlists: id, trip_id, title, location, note, priority
- trip_expenses: id, trip_id, title, category, amount, currency, is_actual, note
