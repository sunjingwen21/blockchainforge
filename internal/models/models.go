/*
Author: jw
用途: 定义 BlockChainForge 的数据模型，包括 RPC 和节点的数据结构
*/
package models

type RPC struct {
	ID      int    `json:"id"`
	URL     string `json:"url"`
	ChainID int    `json:"chain_id"`
	Status  string `json:"status"`
}

type Node struct {
	ID         int    `json:"id"`
	Chain      string `json:"chain"`
	Status     string `json:"status"`
	SyncStatus string `json:"sync_status"`
} 