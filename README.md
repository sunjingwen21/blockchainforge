# BlockchainForge

**BlockchainForge** 是一个功能强大的区块链基础设施管理平台，旨在简化区块链全节点和 RPC 端点的部署、监控与管理，为开发者和运维团队提供高效、可靠的解决方案。

## 🧭 概述

BlockchainForge 提供直观的 Web 界面和自动化工具，支持多链环境，帮助用户快速部署区块链节点、监控同步状态并分析性能指标。无论是开发、测试还是生产环境，BlockchainForge 都能胜任。

## 🛠 技术栈

- **后端**：Go 1.22
- **前端**：React
- **数据库**：Mysql
- **容器化**：Docker
- **编排系统**：Kubernetes

## ✨ 核心功能

### 🔌 RPC 端点管理
- 添加、更新、删除区块链 RPC 端点
- 实时监控健康状态、延迟与错误率

### 🧩 全节点管理
- 自动化部署与管理区块链全节点（支持 Ethereum、Kaia 等）
- 监控节点同步状态与区块高度

### 🌐 多链支持
- 兼容主流区块链网络，支持快速扩展

### 📊 仪表盘与告警
- 可视化性能指标
- 实时告警与日志分析

## ⚙️ 环境要求

- Go：**1.22+**
- Node.js：**18.x+**
- Docker：**最新稳定版**
- Kubernetes：**1.25+**（可选，建议用于生产）
- 操作系统：Ubuntu 20.04+、macOS 12+ 或其他支持 Docker 的系统

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone git@github.com:sunjingwen21/blockchainforge.git
cd blockchainforge
```

### 2. 安装依赖

后端：
```bash
go mod tidy
```

前端：
```bash
cd frontend
npm install
```

### 3. 运行开发环境

启动后端：
```bash
go run ./cmd/server
```

启动前端：
```bash
cd frontend
npm start
```

### 4. 使用 Docker

```bash
docker-compose up -d
```

访问平台：打开浏览器，访问 http://localhost:3000

### 5. 生产环境部署

Docker：
```bash
docker-compose -f docker-compose.yml up -d
```

Kubernetes：
```bash
kubectl apply -f k8s/
```

## 🤝 贡献指南

欢迎贡献代码！请按照以下步骤：

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/你的功能`
3. 提交更改：`git commit -m "添加你的功能"`
4. 推送分支：`git push origin feature/你的功能`
5. 提交 Pull Request

## 📬 联系方式

- 📧 邮箱：sunjingwen0112@gmail.com

欢迎通过以上方式联系我，我会尽快回复您的问题和建议。
