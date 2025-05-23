package storage

import (
	"blockchainforge/internal/models"
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
)

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

	return &DB{db}, nil
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

