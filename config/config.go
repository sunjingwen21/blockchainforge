package config

import (
	"gopkg.in/yaml.v3"
	"os"
)

type DatabaseConfig struct {
	DatabaseType    string `yaml:"database_type"`
	SQLitePath      string `yaml:"sqlite_path"`
	MySQLHost       string `yaml:"mysql_host"`
	MySQLPort       int    `yaml:"mysql_port"`
	MySQLUser       string `yaml:"mysql_user"`
	MySQLPassword   string `yaml:"mysql_password"`
	MySQLDBName     string `yaml:"mysql_dbname"`
	MachinePlatform string `yaml:"machine_platform"`
}

func LoadConfig(path string) (*DatabaseConfig, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var config DatabaseConfig
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	// 优先使用环境变量 DB_PATH（与 docker-compose.yml 兼容）
	if dbPath := os.Getenv("DB_PATH"); dbPath != "" {
		config.SQLitePath = dbPath
	}

	return &config, nil
}