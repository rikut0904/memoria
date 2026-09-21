package main

import (
	"log"

	"memoria/internal/config"
	"memoria/internal/di"
)

func main() {
	cfg := config.Load()
	if err := cfg.Validate(); err != nil {
		log.Fatalf("invalid configuration: %v", err)
	}

	e, err := di.BuildServer(cfg)
	if err != nil {
		log.Fatalf("failed to build server: %v", err)
	}

	if err := e.Start(":" + cfg.AppPort); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
