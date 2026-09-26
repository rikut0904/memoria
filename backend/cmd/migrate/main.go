package main

import (
	"log"
	"os"

	"memoria/internal/adapter/persistence"
	"memoria/internal/config"
)

func main() {
	cfg := config.Load()
	if cfg.AppEnv != "local" && cfg.AppEnv != "stg" && cfg.AppEnv != "prod" {
		log.Fatalf("invalid APP_ENV: %q", cfg.AppEnv)
	}
	if cfg.AppEnv != "local" && os.Getenv("DATABASE_URL") == "" {
		log.Fatal("DATABASE_URL is required for stg and prod migrations")
	}

	db, err := persistence.ConnectDB(cfg)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	if err := persistence.Migrate(db); err != nil {
		log.Fatal(err)
	}
}
