package storage

import (
	"blockchainforge/internal/models"
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
)

type DB struct {
	*sql.DB
}

// 检查表是否存在
func (db *DB) tableExists(tableName string) (bool, error) {
	query := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM information_schema.tables 
		WHERE table_schema = DATABASE()
		AND table_name = '%s'`, tableName)
	
	var count int
	err := db.QueryRow(query).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func InitDB(dbType, mysqlDSN string) (*DB, error) {
	var db *sql.DB
	var err error

	if dbType == "mysql" {
		db, err = sql.Open("mysql", mysqlDSN)
	} else {
		return nil, fmt.Errorf("unsupported database type: %s", dbType)
	}

	if err != nil {
		return nil, err
	}

	dbInstance := &DB{db}

	// 检查表是否存在
	rpcsExists, err := dbInstance.tableExists("rpcs")
	if err != nil {
		return nil, fmt.Errorf("检查rpcs表失败: %v", err)
	}

	nodesExists, err := dbInstance.tableExists("nodes")
	if err != nil {
		return nil, fmt.Errorf("检查nodes表失败: %v", err)
	}

	// 创建表
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

	if !rpcsExists {
		_, err = db.Exec(createRPCsTable)
		if err != nil {
			return nil, fmt.Errorf("创建rpcs表失败: %v", err)
		}
	}

	if !nodesExists {
		_, err = db.Exec(createNodesTable)
		if err != nil {
			return nil, fmt.Errorf("创建nodes表失败: %v", err)
		}
	}

	// 插入测试数据（每个语句单独执行）
	insertStatements := []string{
		"INSERT IGNORE INTO rpcs (url, chain_id, status) VALUES ('http://example.com', '1', '活跃')",
		"INSERT IGNORE INTO rpcs (url, chain_id, status) VALUES ('http://example2.com', '2', '离线')",
		"INSERT IGNORE INTO nodes (chain, status, sync_status) VALUES ('Ethereum', '运行中', '已同步')",
		"INSERT IGNORE INTO nodes (chain, status, sync_status) VALUES ('Bitcoin', '已停止', '未同步')",
	}

	for _, stmt := range insertStatements {
		_, err = db.Exec(stmt)
		if err != nil {
			return nil, err
		}
	}

	return dbInstance, nil
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