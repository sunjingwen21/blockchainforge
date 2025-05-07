BlockchainForge
BlockchainForge 是一个功能强大的区块链基础设施管理平台，旨在简化区块链全节点和 RPC 端点的部署、监控和管理，为开发者和运维团队提供高效、可靠的解决方案。
概述
BlockchainForge 提供直观的 Web 界面和自动化工具，支持多链环境，帮助用户快速部署区块链节点、监控同步状态和分析性能指标。无论是开发、测试还是生产场景，BlockchainForge 都能满足需求。
技术栈

后端：Go 1.22
前端：React
数据库：SQLite
容器化：Docker
编排：Kubernetes

核心功能

RPC 端点管理：
添加、更新、删除区块链 RPC 端点。
实时监控端点健康状态、延迟和错误率。


全节点管理：
自动化部署和管理区块链全节点（如 Ethereum、Kaia）。
监控节点同步状态和区块高度。


多链支持：
兼容主流区块链网络，易于扩展。


仪表盘与告警：
可视化性能指标，实时告警和日志分析。



环境要求

Go：1.22 或更高版本
Node.js：18.x 或更高版本
Docker：最新稳定版
Kubernetes：1.25 或更高版本（生产环境可选）
操作系统：Ubuntu 20.04+、macOS 12+ 或其他支持 Docker 的系统

快速开始
1. 克隆仓库
git clone git@github.com:sunjingwen21/blockchainforge.git
cd blockchainforge

2. 安装依赖

后端：go mod tidy


前端：cd frontend
npm install



3. 运行开发环境

启动后端：go run ./cmd/server


启动前端：cd frontend
npm start



4. 使用 Docker
docker-compose up -d

5. 访问平台
打开浏览器，访问 http://localhost:3000。
生产环境部署

Docker：docker-compose -f docker-compose.prod.yml up -d


Kubernetes：kubectl apply -f k8s/



贡献指南
欢迎贡献代码！请按照以下步骤：

Fork 本仓库。
创建特性分支：git checkout -b feature/你的功能


提交更改：git commit -m "添加你的功能"


推送分支：git push origin feature/你的功能


提交 Pull Request。

