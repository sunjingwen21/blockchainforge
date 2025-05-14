package main

import (
	"chainforge/config"
	"chainforge/internal/api"
	"chainforge/internal/storage"
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"os"
)

func main() {
	// 加载配置文件
	env := os.Getenv("ENV")
	var cfg *config.DatabaseConfig
	var err error
	if env == "dev" {
		cfg, err = config.LoadConfig("config-dev.yaml")
	} else {
		cfg, err = config.LoadConfig("config.yaml")
	}
	if err != nil {
		log.Fatal("加载配置文件失败:", err)
	}

	// 初始化数据库
	var db *storage.DB
	if cfg.DatabaseType == "sqlite3" {
		db, err = storage.InitDB(cfg.DatabaseType, cfg.SQLitePath, "")
	} else if cfg.DatabaseType == "mysql" {
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			cfg.MySQLUser,
			cfg.MySQLPassword,
			cfg.MySQLHost,
			cfg.MySQLPort,
			cfg.MySQLDBName)
		db, err = storage.InitDB(cfg.DatabaseType, "", dsn)
	} else {
		log.Fatal("不支持的数据库类型:", cfg.DatabaseType)
	}

	if err != nil {
		log.Fatal("初始化数据库失败:", err)
	}
	defer db.Close()

	r := gin.Default()
	api.SetupRoutes(r, db)
	if err := r.Run(":8080"); err != nil {
		log.Fatal("启动服务器失败:", err)
	}
}
