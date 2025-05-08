import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import './App.css';

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Layout className="layout">
      <Header>
        <div className="logo">BlockchainForge</div>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <Routes>
            <Route path="/" element={<div>Welcome to BlockchainForge</div>} />
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