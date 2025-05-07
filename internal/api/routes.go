/*
Author: jw
用途: 配置 ChainForge 的 API 路由，定义 RPC 和节点管理的端点
*/
package api

import (
	"chainforge/internal/storage"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, db *storage.DB) {
	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})
	api := r.Group("/api")
	{
		api.GET("/rpcs", GetRPCs)
		api.POST("/rpcs", CreateRPC)
		api.DELETE("/rpcs/:id", DeleteRPC)
		api.GET("/nodes", GetNodes)
		api.POST("/nodes", CreateNode)
		api.DELETE("/nodes/:id", DeleteNode)
	}
} 