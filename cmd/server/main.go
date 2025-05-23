package main

import (
	"blockchainforge/internal/config"
	"blockchainforge/internal/api"
	"blockchainforge/internal/storage"
	"blockchainforge/internal/logger"
	"fmt"
	"github.com/gin-gonic/gin"
)

func main() {
	// 初始化日志
	logger.InitLogger()

	// 加载配置文件
	var cfg *config.DatabaseConfig
	var err error
	cfg, err = config.LoadConfig("config.yaml")
	if err != nil {
		logger.Current().Fatal("加载配置文件失败:", err)
	}
    logger.Current().Info("配置文件加载成功", cfg)
	
	// 初始化数据库
	var db *storage.DB
    if cfg.DatabaseType == "mysql" {
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			cfg.MySQLUser,
			cfg.MySQLPassword,
			cfg.MySQLHost,
			cfg.MySQLPort,
			cfg.MySQLDBName)
		db, err = storage.InitDB(cfg.DatabaseType, dsn)
	} else {
		logger.Current().Fatal("不支持的数据库类型:", cfg.DatabaseType)
	}

	if err != nil {
		logger.Current().Fatal("初始化数据库失败:", err)
	}
	defer db.Close()

	r := gin.Default()
	api.SetupRoutes(r, db)
	if err := r.Run(":8080"); err != nil {
		logger.Current().Fatal("启动服务器失败:", err)
	}
}
