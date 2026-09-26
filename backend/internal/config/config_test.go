package config

import "testing"

func TestLoadDefaultsAutoMigrateOnlyForLocal(t *testing.T) {
	t.Setenv("APP_ENV", "local")
	t.Setenv("AUTO_MIGRATE", "")
	if cfg := Load(); !cfg.AutoMigrate {
		t.Fatal("expected auto-migration to be enabled for local")
	}

	t.Setenv("APP_ENV", "stg")
	t.Setenv("AUTO_MIGRATE", "")
	if cfg := Load(); cfg.AutoMigrate {
		t.Fatal("expected auto-migration to be disabled by default outside local")
	}
}

func TestLoadAllowsExplicitAutoMigrateOverride(t *testing.T) {
	t.Setenv("APP_ENV", "prod")
	t.Setenv("AUTO_MIGRATE", "true")
	if cfg := Load(); !cfg.AutoMigrate {
		t.Fatal("expected explicit AUTO_MIGRATE=true to enable auto-migration")
	}

	t.Setenv("APP_ENV", "local")
	t.Setenv("AUTO_MIGRATE", "false")
	if cfg := Load(); cfg.AutoMigrate {
		t.Fatal("expected explicit AUTO_MIGRATE=false to disable auto-migration")
	}
}

func validNonLocalConfig() Config {
	return Config{
		AppEnv:              "stg",
		FirebaseProjectID:   "project",
		FirebaseClientEmail: "client@example.com",
		FirebasePrivateKey:  "private-key",
		FirebaseAPIKey:      "api-key",
		FrontendBaseURL:     "https://example.com",
		DBHost:              "localhost",
		DBUser:              "lover",
		DBPassword:          "loverpass",
		DBName:              "lover_db",
	}
}

func TestValidateDoesNotAcceptLoadedLocalDatabaseDefaults(t *testing.T) {
	for _, name := range []string{"DATABASE_URL", "DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"} {
		t.Setenv(name, "")
	}

	cfg := validNonLocalConfig()
	if err := cfg.Validate(); err == nil {
		t.Fatal("expected missing database configuration error")
	}
}

func TestValidateAcceptsIndividualDatabaseConfiguration(t *testing.T) {
	t.Setenv("DATABASE_URL", "")
	for name, value := range map[string]string{
		"DB_HOST":     "db.example.com",
		"DB_USER":     "user",
		"DB_PASSWORD": "password",
		"DB_NAME":     "database",
	} {
		t.Setenv(name, value)
	}

	if err := validNonLocalConfig().Validate(); err != nil {
		t.Fatalf("expected valid database configuration, got %v", err)
	}
}

func TestValidateAcceptsDatabaseURL(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://user:password@db.example.com/database")
	for _, name := range []string{"DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"} {
		t.Setenv(name, "")
	}

	if err := validNonLocalConfig().Validate(); err != nil {
		t.Fatalf("expected valid DATABASE_URL configuration, got %v", err)
	}
}
