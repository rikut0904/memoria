CREATE TABLE IF NOT EXISTS signup_profiles (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    firebase_uid TEXT NOT NULL,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT ''
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_signup_profiles_firebase_uid
    ON signup_profiles (firebase_uid);

CREATE UNIQUE INDEX IF NOT EXISTS idx_signup_profiles_email
    ON signup_profiles (email);
