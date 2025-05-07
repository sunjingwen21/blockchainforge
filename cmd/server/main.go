/*
Author: jw
用途: ChainForge 主程序入口，启动 Gin Web 服务器并初始化数据库
*/
package main

import (
	"chainforge/internal/api"
	"chainforge/internal/storage"
	"github.com/gin-gonic/gin"
	"log"
)

func main() {
	db, err := storage.InitDB("chainforge.db")
	if err != nil {
		log.Fatal("初始化数据库失败:", err)
	}
	defer db.Close()
	r := gin.Default()
	r.Static("/web", "./web")
	api.SetupRoutes(r, db)
	if err := r.Run(":8080"); err != nil {
		log.Fatal("启动服务器失败:", err)
	}
}