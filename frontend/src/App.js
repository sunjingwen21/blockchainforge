import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ApiOutlined,
  DatabaseOutlined,
  ClusterOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import './App.css';

const { Header, Content, Footer } = Layout;

const menuItems = [
  { label: <Link to="/">仪表盘</Link>, key: '/', icon: <DashboardOutlined /> },
  { label: <Link to="/rpc">RPC 端点管理</Link>, key: '/rpc', icon: <ApiOutlined /> },
  { label: <Link to="/nodes">全节点管理</Link>, key: '/nodes', icon: <DatabaseOutlined /> },
  { label: <Link to="/chains">多链支持</Link>, key: '/chains', icon: <ClusterOutlined /> },
  { label: <Link to="/about">关于</Link>, key: '/about', icon: <InfoCircleOutlined /> },
];

function Dashboard() {
  return <h2>仪表盘：可视化性能指标、实时告警和日志分析</h2>;
}

// 这里先留空，下一步实现RPC端点管理页面
function RpcEndpoints() {
  return <div id="rpc-endpoints-page"></div>;
}
function FullNodes() {
  return <h2>全节点管理：自动化部署与管理区块链全节点，监控节点同步状态与区块高度</h2>;
}
function MultiChain() {
  return <h2>多链支持：兼容主流区块链网络，支持快速扩展</h2>;
}
function About() {
  return (
    <div>
      <h2>关于 BlockchainForge</h2>
      <p>区块链基础设施管理平台，简化节点和 RPC 端点的部署、监控与管理。</p>
      <p>联系方式：sunjingwen0112@gmail.com</p>
    </div>
  );
}

function App() {
  const location = useLocation();
  return (
    <Layout className="layout">
      <Header style={{ padding: 0 }}>
        <div className="header-flex">
          <div className="logo">BlockchainForge</div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname === '/' ? '/' : location.pathname]}
            items={menuItems}
            style={{ lineHeight: '64px', borderBottom: 'none' }}
          />
        </div>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rpc" element={<RpcEndpoints />} />
            <Route path="/nodes" element={<FullNodes />} />
            <Route path="/chains" element={<MultiChain />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        BlockchainForge ©{new Date().getFullYear()} Created by Sun Jingwen
      </Footer>
    </Layout>
  );
}

export default App; 