package main

import (
	"chainforge/config"
	"chainforge/internal/api"
	"chainforge/internal/storage"
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
)

func main() {
	// 加载配置文件
	cfg, err := config.LoadConfig("config.yaml")
	if err != nil {
		log.Fatal("加载配置文件失败:", err)
	}

	// 初始化数据库
	var db *storage.DB
	if cfg.Database.Type == "sqlite3" {
		db, err = storage.InitDB(cfg.Database.Type, cfg.Database.SQLite.Path, "")
	} else if cfg.Database.Type == "mysql" {
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			cfg.Database.MySQL.User,
			cfg.Database.MySQL.Password,
			cfg.Database.MySQL.Host,
			cfg.Database.MySQL.Port,
			cfg.Database.MySQL.DBName)
		db, err = storage.InitDB(cfg.Database.Type, "", dsn)
	} else {
		log.Fatal("不支持的数据库类型:", cfg.Database.Type)
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
