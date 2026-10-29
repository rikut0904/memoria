-- Baseline schema for databases created before the explicit migration runner.
-- Every statement is idempotent so this is safe for existing deployments.

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    firebase_uid TEXT NOT NULL,
    email TEXT NOT NULL,
    display_name TEXT,
    role TEXT NOT NULL,
    last_access_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users (firebase_uid);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_last_access_at ON users (last_access_at);

CREATE TABLE IF NOT EXISTS groups (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name TEXT NOT NULL,
    created_by BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS group_members (
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role TEXT NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS invites (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    group_id BIGINT NOT NULL,
    email TEXT NOT NULL,
    token TEXT NOT NULL,
    status TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    expires_at TIMESTAMPTZ NOT NULL,
    invited_by BIGINT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_invites_token ON invites (token);
CREATE INDEX IF NOT EXISTS idx_invites_group_id ON invites (group_id);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites (email);

CREATE TABLE IF NOT EXISTS albums (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    group_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_photo_id BIGINT,
    created_by BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_albums_group_id ON albums (group_id);

CREATE TABLE IF NOT EXISTS photos (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    group_id BIGINT NOT NULL,
    album_id BIGINT NOT NULL,
    s3_key TEXT NOT NULL,
    content_type TEXT,
    size_bytes BIGINT,
    width BIGINT,
    height BIGINT,
    uploaded_by BIGINT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_photos_s3_key ON photos (s3_key);
CREATE INDEX IF NOT EXISTS idx_photos_group_id ON photos (group_id);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos (album_id);

CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    group_id BIGINT NOT NULL,
    type TEXT NOT NULL,
    title TEXT,
    body TEXT NOT NULL,
    author_id BIGINT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_posts_group_id ON posts (group_id);

CREATE TABLE IF NOT EXISTS album_posts (
    album_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (album_id, post_id)
);

CREATE TABLE IF NOT EXISTS tags (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name ON tags (name);

CREATE TABLE IF NOT EXISTS post_tags (
    post_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS post_photos (
    post_id BIGINT NOT NULL,
    photo_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (post_id, photo_id)
);

CREATE TABLE IF NOT EXISTS post_likes (
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    body TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments (post_id);

CREATE TABLE IF NOT EXISTS notification_settings (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL,
    category TEXT NOT NULL,
    enabled BOOLEAN NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings (user_id);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    read_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);

CREATE TABLE IF NOT EXISTS web_push_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL,
    endpoint TEXT NOT NULL,
    auth TEXT NOT NULL,
    p256dh TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_web_push_subscriptions_user_id ON web_push_subscriptions (user_id);

CREATE TABLE IF NOT EXISTS trips (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    group_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    note TEXT,
    created_by BIGINT NOT NULL,
    notify_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_trips_group_id ON trips (group_id);

CREATE TABLE IF NOT EXISTS trip_itineraries (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trip_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    location TEXT,
    note TEXT
);
CREATE INDEX IF NOT EXISTS idx_trip_itineraries_trip_id ON trip_itineraries (trip_id);

CREATE TABLE IF NOT EXISTS trip_wishlists (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trip_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    location TEXT,
    note TEXT,
    priority BIGINT
);
CREATE INDEX IF NOT EXISTS idx_trip_wishlists_trip_id ON trip_wishlists (trip_id);

CREATE TABLE IF NOT EXISTS trip_expenses (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trip_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount BIGINT NOT NULL,
    currency TEXT NOT NULL,
    is_actual BOOLEAN NOT NULL,
    note TEXT
);
CREATE INDEX IF NOT EXISTS idx_trip_expenses_trip_id ON trip_expenses (trip_id);

CREATE TABLE IF NOT EXISTS trip_albums (
    trip_id BIGINT NOT NULL,
    album_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (trip_id, album_id)
);

CREATE TABLE IF NOT EXISTS trip_posts (
    trip_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (trip_id, post_id)
);

CREATE TABLE IF NOT EXISTS trip_schedule_items (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trip_id BIGINT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    content TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_trip_schedule_items_trip_id ON trip_schedule_items (trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_schedule_items_date ON trip_schedule_items (date);

CREATE TABLE IF NOT EXISTS trip_transports (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trip_id BIGINT NOT NULL,
    mode TEXT NOT NULL,
    date TEXT NOT NULL,
    from_location TEXT,
    to_location TEXT,
    note TEXT,
    departure_time TEXT,
    arrival_time TEXT,
    route_name TEXT,
    train_name TEXT,
    ferry_name TEXT,
    flight_number TEXT,
    airline TEXT,
    terminal TEXT,
    company_name TEXT,
    pickup_location TEXT,
    dropoff_location TEXT,
    rental_url TEXT,
    distance_km DOUBLE PRECISION,
    fuel_efficiency_km_per_l DOUBLE PRECISION,
    gasoline_price_yen_per_l DOUBLE PRECISION,
    gasoline_cost_yen BIGINT,
    highway_cost_yen BIGINT,
    rental_fee_yen BIGINT,
    fare_yen BIGINT
);
CREATE INDEX IF NOT EXISTS idx_trip_transports_trip_id ON trip_transports (trip_id);

CREATE TABLE IF NOT EXISTS trip_lodgings (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trip_id BIGINT NOT NULL,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    reservation_url TEXT,
    address TEXT,
    check_in TEXT,
    check_out TEXT,
    reservation_number TEXT,
    cost_yen BIGINT
);
CREATE INDEX IF NOT EXISTS idx_trip_lodgings_trip_id ON trip_lodgings (trip_id);

CREATE TABLE IF NOT EXISTS trip_budget_items (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trip_id BIGINT NOT NULL,
    name TEXT NOT NULL,
    cost_yen BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_trip_budget_items_trip_id ON trip_budget_items (trip_id);
