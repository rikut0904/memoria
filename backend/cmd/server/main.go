package main

import (
	"log"

	"memoria/internal/config"
	"memoria/internal/di"
)

func main() {
	cfg := config.Load()

	e, err := di.BuildServer(cfg)
	if err != nil {
		log.Fatalf("failed to build server: %v", err)
	}

	if err := e.Start(":" + cfg.AppPort); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
