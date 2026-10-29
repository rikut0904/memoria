package main

import (
	"log"

	"memoria/internal/adapter/persistence"
	"memoria/internal/config"
)

func main() {
	cfg := config.Load()
	if err := cfg.ValidateDatabase(); err != nil {
		log.Fatalf("invalid database configuration: %v", err)
	}
	db, err := persistence.NewMigrationDB(cfg)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	if err := persistence.RunMigrations(db); err != nil {
		log.Fatalf("database migration failed: %v", err)
	}
	log.Println("Database migrations completed")
}
