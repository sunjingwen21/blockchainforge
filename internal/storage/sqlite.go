package storage

import (
	"chainforge/internal/models"
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/mattn/go-sqlite3"
)

type DB struct {
	*sql.DB
}

func InitDB(dbType, sqlitePath, mysqlDSN string) (*DB, error) {
	var db *sql.DB
	var err error

	if dbType == "sqlite3" {
		db, err = sql.Open("sqlite3", sqlitePath)
	} else if dbType == "mysql" {
		db, err = sql.Open("mysql", mysqlDSN)
	} else {
		return nil, fmt.Errorf("unsupported database type: %s", dbType)
	}

	if err != nil {
		return nil, err
	}

	// 创建表（兼容 SQLite 和 MySQL）
	createRPCsTable := `
		CREATE TABLE IF NOT EXISTS rpcs (
			id INTEGER PRIMARY KEY AUTO_INCREMENT,
			url TEXT NOT NULL,
			chain_id TEXT NOT NULL,
			status TEXT NOT NULL
		)`
	createNodesTable := `
		CREATE TABLE IF NOT EXISTS nodes (
			id INTEGER PRIMARY KEY AUTO_INCREMENT,
			chain TEXT NOT NULL,
			status TEXT NOT NULL,
			sync_status TEXT NOT NULL
		)`

	if dbType == "sqlite3" {
		// SQLite 使用 AUTOINCREMENT
		createRPCsTable = createRPCsTable
		createNodesTable = createNodesTable
	} else if dbType == "mysql" {
		// MySQL 使用 AUTO_INCREMENT
		createRPCsTable = createRPCsTable
		createNodesTable = createNodesTable
	}

	_, err = db.Exec(createRPCsTable)
	if err != nil {
		return nil, err
	}
	_, err = db.Exec(createNodesTable)
	if err != nil {
		return nil, err
	}

	// 插入测试数据（可选）
	_, err = db.Exec(`
		INSERT IGNORE INTO rpcs (url, chain_id, status) VALUES ('http://example.com', '1', '活跃');
		INSERT IGNORE INTO rpcs (url, chain_id, status) VALUES ('http://example2.com', '2', '离线');
		INSERT IGNORE INTO nodes (chain, status, sync_status) VALUES ('Ethereum', '运行中', '已同步');
		INSERT IGNORE INTO nodes (chain, status, sync_status) VALUES ('Bitcoin', '已停止', '未同步');
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