package config

import (
	"gopkg.in/yaml.v3"
	"os"
)

type DatabaseConfig struct {
	Type  string         `yaml:"type"`
	SQLite SQLiteConfig  `yaml:"sqlite"`
	MySQL  MySQLConfig   `yaml:"mysql"`
}

type SQLiteConfig struct {
	Path string `yaml:"path"`
}

type MySQLConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	DBName   string `yaml:"dbname"`
}

type Config struct {
	Database DatabaseConfig `yaml:"database"`
}

func LoadConfig(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	// 优先使用环境变量 DB_PATH（与 docker-compose.yml 兼容）
	if dbPath := os.Getenv("DB_PATH"); dbPath != "" {
		config.Database.SQLite.Path = dbPath
	}

	return &config, nil
}