/*
Author: jw
用途: 实现 ChainForge 的 SQLite 数据库操作，包括初始化和 RPC/节点的增删查
*/
package storage

import (
	"chainforge/internal/models"
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
)

type DB struct {
	*sql.DB
}

func InitDB(path string) (*DB, error) {
	db, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, err
	}
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS rpcs (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			url TEXT NOT NULL,
			chain_id INTEGER NOT NULL,
			status TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS nodes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			chain TEXT NOT NULL,
			status TEXT NOT NULL,
			sync_status TEXT NOT NULL
		);
	`)
	if err != nil {
		return nil, err
	}
	return &DB{db}, nil
}

func (db *DB) GetAllRPCs() ([]models.RPC, error) {
	rows, err := db.Query("SELECT id, url, chain_id, status FROM rpcs")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var rpcs []models.RPC
	for rows.Next() {
		var rpc models.RPC
		if err := rows.Scan(&rpc.ID, &rpc.URL, &rpc.ChainID, &rpc.Status); err != nil {
			return nil, err
		}
		rpcs = append(rpcs, rpc)
	}
	return rpcs, nil
}

func (db *DB) CreateRPC(rpc *models.RPC) error {
	res, err := db.Exec("INSERT INTO rpcs (url, chain_id, status) VALUES (?, ?, ?)",
		rpc.URL, rpc.ChainID, rpc.Status)
	if err != nil {
		return err
	}
	id, _ := res.LastInsertId()
	rpc.ID = int(id)
	return nil
}

func (db *DB) DeleteRPC(id int) error {
	_, err := db.Exec("DELETE FROM rpcs WHERE id = ?", id)
	return err
}

func (db *DB) GetAllNodes() ([]models.Node, error) {
	rows, err := db.Query("SELECT id, chain, status, sync_status FROM nodes")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var nodes []models.Node
	for rows.Next() {
		var node models.Node
		if err := rows.Scan(&node.ID, &node.Chain, &node.Status, &node.SyncStatus); err != nil {
			return nil, err
		}
		nodes = append(nodes, node)
	}
	return nodes, nil
}

func (db *DB) CreateNode(node *models.Node) error {
	res, err := db.Exec("INSERT INTO nodes (chain, status, sync_status) VALUES (?, ?, ?)",
		node.Chain, node.Status, node.SyncStatus)
	if err != nil {
		return err
	}
	id, _ := res.LastInsertId()
	node.ID = int(id)
	return nil
}

func (db *DB) DeleteNode(id int) error {
	_, err := db.Exec("DELETE FROM nodes WHERE id = ?", id)
	return err
} 