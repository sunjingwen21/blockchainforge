package config

import (
	"gopkg.in/yaml.v3"
	"os"
	"strconv"
)

type DatabaseConfig struct {
	DatabaseType    string `yaml:"database_type"`
	MySQLHost       string `yaml:"mysql_host"`
	MySQLPort       int    `yaml:"mysql_port"`
	MySQLUser       string `yaml:"mysql_user"`
	MySQLPassword   string `yaml:"mysql_password"`
	MySQLDBName     string `yaml:"mysql_dbname"`
	MachinePlatform string `yaml:"machine_platform"`
	SubscriptionId string `yaml:"subscriptionId"`
	AccessKey      string `yaml:"accessKey"`
	SecretKey      string `yaml:"secretKey"`
	ClientId       string `yaml:"clientId"`
	ClientSecret   string `yaml:"clientSecret"`
	TenantId       string `json:"tenantId"`
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

	if mysql_host := os.Getenv("MYSQL_HOST"); mysql_host != "" {
		config.MySQLHost = mysql_host
	}

	if mysql_port := os.Getenv("MYSQL_PORT"); mysql_port != "" {
		if port, err := strconv.Atoi(mysql_port); err == nil {
			config.MySQLPort = port
		}
	}

	return &config, nil
}