package config

import (
	"fmt"
	"log"
	"net/url"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv      string
	AppPort     string
	AutoMigrate bool

	// Database config (parsed from DATABASE_URL or individual env vars)
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	FirebaseProjectID        string
	FirebaseClientEmail      string
	FirebasePrivateKey       string
	FirebaseAPIKey           string
	FirebaseAuthEmulatorHost string

	FrontendBaseURL           string
	LocalEmailVerificationURL string
	AllowedOrigins            string
	AllowedOriginSuffixes     string
	CookieDomain              string
	EnableLocalStorageAuth    bool
	SESFromEmail              string
	SESInviteTemplatePath     string
	AWSRegion                 string
	S3Bucket                  string
	S3Endpoint                string
	S3AccessKey               string
	S3SecretKey               string
	AWSEndpoint               string
}

func Load() Config {
	// Load .env file if it exists (ignore error if not found)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}
	appEnv := getEnv("APP_ENV", "local")
	autoMigrate := appEnv == "local"
	if raw := os.Getenv("AUTO_MIGRATE"); raw != "" {
		autoMigrate = raw != "false"
	}

	cfg := Config{
		AppEnv:      appEnv,
		AppPort:     getEnv("APP_PORT", "8080"),
		AutoMigrate: autoMigrate,

		FirebaseProjectID:        getEnv("FIREBASE_PROJECT_ID", ""),
		FirebaseClientEmail:      getEnv("FIREBASE_CLIENT_EMAIL", ""),
		FirebasePrivateKey:       normalizePrivateKey(getEnv("FIREBASE_PRIVATE_KEY", "")),
		FirebaseAPIKey:           getEnv("FIREBASE_API_KEY", ""),
		FirebaseAuthEmulatorHost: getEnv("FIREBASE_AUTH_EMULATOR_HOST", ""),

		FrontendBaseURL:           getEnv("FRONTEND_BASE_URL", ""),
		LocalEmailVerificationURL: getEnv("LOCAL_EMAIL_VERIFICATION_URL", ""),
		AllowedOrigins:            getEnv("ALLOWED_ORIGINS", ""),
		AllowedOriginSuffixes:     getEnv("ALLOWED_ORIGIN_SUFFIXES", ""),
		CookieDomain:              getEnv("COOKIE_DOMAIN", ""),
		EnableLocalStorageAuth:    appEnv == "local",
		SESFromEmail:              getEnv("SES_FROM_EMAIL", "no-reply@rikut0904.site"),
		SESInviteTemplatePath:     getEnv("SES_INVITE_TEMPLATE_PATH", ""),
		AWSRegion:                 getEnv("AWS_REGION", "ap-northeast-1"),
		S3Bucket:                  getEnv("S3_BUCKET", ""),
		S3Endpoint:                getEnv("S3_ENDPOINT", ""),
		S3AccessKey:               getEnv("S3_ACCESS_KEY", ""),
		S3SecretKey:               getEnv("S3_SECRET_KEY", ""),
		AWSEndpoint:               getEnv("AWS_ENDPOINT", ""),
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

// Validate checks settings that must be present outside local development.
func (c Config) Validate() error {
	if c.AppEnv != "local" && c.AppEnv != "stg" && c.AppEnv != "prod" {
		return fmt.Errorf("APP_ENV must be one of local, stg, or prod (got %q)", c.AppEnv)
	}
	if c.AppEnv == "local" {
		return nil
	}

	missing := make([]string, 0)
	for name, value := range map[string]string{
		"FIREBASE_PROJECT_ID":   c.FirebaseProjectID,
		"FIREBASE_CLIENT_EMAIL": c.FirebaseClientEmail,
		"FIREBASE_PRIVATE_KEY":  c.FirebasePrivateKey,
		"FIREBASE_API_KEY":      c.FirebaseAPIKey,
		"FRONTEND_BASE_URL":     c.FrontendBaseURL,
	} {
		if strings.TrimSpace(value) == "" {
			missing = append(missing, name)
		}
	}
	if strings.TrimSpace(os.Getenv("DATABASE_URL")) == "" {
		for _, name := range []string{"DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"} {
			if strings.TrimSpace(os.Getenv(name)) == "" {
				missing = append(missing, name)
			}
		}
	}
	if len(missing) > 0 {
		return fmt.Errorf("required configuration is missing for %s: %s", c.AppEnv, strings.Join(missing, ", "))
	}
	return nil
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
