package persistence

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"path"
	"sort"
	"strconv"
	"strings"

	"gorm.io/gorm"
)

// migrationFiles is embedded so the migration command does not depend on the
// repository checkout being present at runtime.
//
//go:embed migrations/*.sql
var migrationFiles embed.FS

type migration struct {
	version int64
	name    string
	path    string
}

func RunMigrations(db *gorm.DB) error {
	if err := db.Exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version BIGINT PRIMARY KEY,
			name TEXT NOT NULL,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`).Error; err != nil {
		return fmt.Errorf("create schema_migrations: %w", err)
	}

	migrations, err := loadMigrations()
	if err != nil {
		return err
	}
	for _, item := range migrations {
		var applied int64
		if err := db.Raw("SELECT COUNT(*) FROM schema_migrations WHERE version = ?", item.version).Scan(&applied).Error; err != nil {
			return fmt.Errorf("check migration %s: %w", item.name, err)
		}
		if applied > 0 {
			continue
		}

		sql, err := fs.ReadFile(migrationFiles, item.path)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", item.name, err)
		}
		if err := db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Exec(string(sql)).Error; err != nil {
				return fmt.Errorf("execute migration %s: %w", item.name, err)
			}
			return tx.Exec(
				"INSERT INTO schema_migrations (version, name) VALUES (?, ?)",
				item.version,
				item.name,
			).Error
		}); err != nil {
			return err
		}
		log.Printf("Applied migration %s", item.name)
	}
	return nil
}

func loadMigrations() ([]migration, error) {
	paths, err := fs.Glob(migrationFiles, "migrations/*.sql")
	if err != nil {
		return nil, fmt.Errorf("list migrations: %w", err)
	}
	migrations := make([]migration, 0, len(paths))
	for _, migrationPath := range paths {
		name := path.Base(migrationPath)
		versionText := strings.SplitN(name, "_", 2)[0]
		version, err := strconv.ParseInt(versionText, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("invalid migration filename %s: %w", name, err)
		}
		migrations = append(migrations, migration{version: version, name: name, path: migrationPath})
	}
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].version < migrations[j].version
	})
	return migrations, nil
}
