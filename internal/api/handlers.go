package api

import (
	"blockchainforge/internal/models"
	"blockchainforge/internal/storage"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

func GetRPCs(c *gin.Context) {
	db := c.MustGet("db").(*storage.DB)
	rpcs, err := db.GetAllRPCs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, rpcs)
}

func CreateRPC(c *gin.Context) {
	var rpc models.RPC
	if err := c.ShouldBindJSON(&rpc); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db := c.MustGet("db").(*storage.DB)
	if err := db.CreateRPC(&rpc); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, rpc)
}

func DeleteRPC(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	db := c.MustGet("db").(*storage.DB)
	if err := db.DeleteRPC(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func GetNodes(c *gin.Context) {
	db := c.MustGet("db").(*storage.DB)
	nodes, err := db.GetAllNodes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, nodes)
}

func CreateNode(c *gin.Context) {
	var node models.Node
	if err := c.ShouldBindJSON(&node); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db := c.MustGet("db").(*storage.DB)
	if err := db.CreateNode(&node); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, node)
}

func DeleteNode(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	db := c.MustGet("db").(*storage.DB)
	if err := db.DeleteNode(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}