package config

import (
	"log"
	"net/url"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv  string
	AppPort string

	// Database config (parsed from DATABASE_URL or individual env vars)
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	FirebaseProjectID   string
	FirebaseClientEmail string
	FirebasePrivateKey  string
	FirebaseAPIKey      string

	AdminEmails string

	FrontendBaseURL string
	SESFromEmail    string
	SESInviteTemplatePath string
	AWSRegion   string
	S3Bucket    string
	S3Endpoint  string
	S3AccessKey string
	S3SecretKey string
}

func Load() Config {
	// Load .env file if it exists (ignore error if not found)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	cfg := Config{
		AppEnv:  getEnv("APP_ENV", "local"),
		AppPort: getEnv("APP_PORT", "8080"),

		FirebaseProjectID:   getEnv("FIREBASE_PROJECT_ID", ""),
		FirebaseClientEmail: getEnv("FIREBASE_CLIENT_EMAIL", ""),
		FirebasePrivateKey:  normalizePrivateKey(getEnv("FIREBASE_PRIVATE_KEY", "")),
		FirebaseAPIKey:      getEnv("FIREBASE_API_KEY", ""),

		AdminEmails: getEnv("ADMIN_EMAILS", ""),

		FrontendBaseURL: getEnv("FRONTEND_BASE_URL", ""),
		SESFromEmail:    getEnv("SES_FROM_EMAIL", "no-reply@rikut0904.site"),
		SESInviteTemplatePath: getEnv("SES_INVITE_TEMPLATE_PATH", ""),
		AWSRegion:   getEnv("AWS_REGION", "ap-northeast-1"),
		S3Bucket:    getEnv("S3_BUCKET", ""),
		S3Endpoint:  getEnv("S3_ENDPOINT", ""),
		S3AccessKey: getEnv("S3_ACCESS_KEY", ""),
		S3SecretKey: getEnv("S3_SECRET_KEY", ""),
	}

	// Parse DATABASE_URL if available (Railway, Heroku style)
	if databaseURL := os.Getenv("DATABASE_URL"); databaseURL != "" {
		parseDatabaseURL(databaseURL, &cfg)
	} else {
		// Use individual environment variables
		cfg.DBHost = getEnv("DB_HOST", "localhost")
		cfg.DBPort = getEnv("DB_PORT", "5432")
		cfg.DBUser = getEnv("DB_USER", "lover")
		cfg.DBPassword = getEnv("DB_PASSWORD", "loverpass")
		cfg.DBName = getEnv("DB_NAME", "lover_db")
		cfg.DBSSLMode = getEnv("DB_SSLMODE", "disable")
	}

	return cfg
}

func normalizePrivateKey(raw string) string {
	if raw == "" {
		return raw
	}
	trimmed := strings.Trim(raw, "\"")
	trimmed = strings.Trim(trimmed, "'")
	return strings.ReplaceAll(trimmed, "\\n", "\n")
}

func parseDatabaseURL(databaseURL string, cfg *Config) {
	u, err := url.Parse(databaseURL)
	if err != nil {
		log.Printf("Failed to parse DATABASE_URL: %v", err)
		return
	}

	cfg.DBHost = u.Hostname()
	cfg.DBPort = u.Port()
	if cfg.DBPort == "" {
		cfg.DBPort = "5432"
	}

	cfg.DBUser = u.User.Username()
	password, _ := u.User.Password()
	cfg.DBPassword = password

	cfg.DBName = strings.TrimPrefix(u.Path, "/")

	// Check for SSL mode in query parameters
	query := u.Query()
	if sslMode := query.Get("sslmode"); sslMode != "" {
		cfg.DBSSLMode = sslMode
	} else {
		// Railway uses SSL by default
		cfg.DBSSLMode = "require"
	}

	log.Printf("Database config loaded from DATABASE_URL: host=%s port=%s dbname=%s sslmode=%s",
		cfg.DBHost, cfg.DBPort, cfg.DBName, cfg.DBSSLMode)
}

func getEnv(key, fallback string) string {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	return val
}
