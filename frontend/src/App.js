import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Chart from 'chart.js/auto';
import './App.css';

const menuItems = [
    { key: 'dashboard', icon: '📊', label: '仪表盘' },
    { key: 'rpcs', icon: '🔗', label: 'RPC 管理' },
    { key: 'nodes', icon: '🗄️', label: '全节点管理' },
];

const statusColors = {
    '运行中': '#52c41a',
    '已停止': '#f5222d',
    '错误': '#faad14',
};
const syncColors = {
    '已同步': '#1890ff',
    '同步中': '#faad14',
    '未同步': '#f5222d',
};

const App = () => {
    const [page, setPage] = useState('dashboard');
    const [rpcs, setRPCs] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [newNode, setNewNode] = useState({ ip: '', port: '', chain: '', status: '运行中', sync_status: '已同步' });
    const [isLoading, setIsLoading] = useState(false);
    const [addNodeModal, setAddNodeModal] = useState(false);
    const [createNodeModal, setCreateNodeModal] = useState(false);
    const [createNodeForm, setCreateNodeForm] = useState({ cloud: '', machineType: '' });
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        fetchRPCs();
        fetchNodes();
    }, []);

    useEffect(() => {
        if (page === 'dashboard' && chartRef.current) {
            drawChart();
        }
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [page, rpcs, nodes]);

    // 更新接口路径，符合后端提供的 API 路由
    const fetchRPCs = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/rpcs');
            console.log("Fetched RPCs:", response.data);  // 输出数据，检查其格式
            setRPCs(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('获取 RPC 列表失败:', error);
            toast.error('无法获取 RPC 列表，请检查后端或网络');
            setRPCs([]);  // 初始化为空数组
        } finally {
            setIsLoading(false);
        }
    };

    const fetchNodes = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/nodes');
            console.log("Fetched Nodes:", response.data);  // 输出数据，检查其格式
            setNodes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('获取节点列表失败:', error);
            toast.error('无法获取节点列表，请检查后端或网络');
            setNodes([]);  // 初始化为空数组
        } finally {
            setIsLoading(false);
        }
    };

    const addNode = async () => {
        // 校验
        if (!newNode.ip.trim() || !newNode.port.trim() || !newNode.chain.trim()) {
            toast.error('请填写IP、端口号和链');
            return;
        }
        setIsLoading(true);
        try {
            await axios.post('/api/nodes', newNode);
            setNewNode({ ip: '', port: '', chain: '', status: '运行中', sync_status: '已同步' });
            setAddNodeModal(false);
            fetchNodes();
            toast.success('节点添加成功');
        } catch (error) {
            toast.error('添加节点失败');
        } finally {
            setIsLoading(false);
        }
    };

    const createNode = async () => {
        if (!createNodeForm.cloud.trim() || !createNodeForm.machineType.trim()) {
            toast.error('请填写云和机器类型');
            return;
        }
        setIsLoading(true);
        try {
            // 这里可以调用后端API创建节点（如有）
            setCreateNodeModal(false);
            setCreateNodeForm({ cloud: '', machineType: '' });
            toast.success('节点创建请求已提交');
        } catch (error) {
            toast.error('创建节点失败');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteNode = async (id) => {
        setIsLoading(true);
        try {
            await axios.delete(`/api/nodes/${id}`);
            fetchNodes();
            toast.success('节点删除成功');
        } catch (error) {
            console.error('删除节点失败:', error);
            toast.error('删除节点失败');
        } finally {
            setIsLoading(false);
        }
    };

    const drawChart = () => {
        const rpcStatusCount = { 活跃: 0, 离线: 0, 故障: 0 };
        const nodeStatusCount = { 运行中: 0, 已停止: 0, 错误: 0 };

        // 确保 rpcs 和 nodes 是数组类型
        if (Array.isArray(rpcs)) {
            rpcs.forEach(rpc => rpcStatusCount[rpc.status] = (rpcStatusCount[rpc.status] || 0) + 1);
        }

        if (Array.isArray(nodes)) {
            nodes.forEach(node => nodeStatusCount[node.status] = (nodeStatusCount[node.status] || 0) + 1);
        }

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['活跃', '离线', '故障', '运行中', '已停止', '错误'],
                datasets: [
                    {
                        label: 'RPC 状态',
                        data: [rpcStatusCount['活跃'], rpcStatusCount['离线'], rpcStatusCount['故障'], 0, 0, 0],
                        backgroundColor: 'rgba(59, 130, 246, 0.6)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: '节点状态',
                        data: [0, 0, 0, nodeStatusCount['运行中'], nodeStatusCount['已停止'], nodeStatusCount['错误']],
                        backgroundColor: 'rgba(16, 185, 129, 0.6)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '数量',
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: '状态',
                        },
                    },
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: '状态分布图',
                    },
                },
            },
        });
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
            {/* Sider */}
            <aside style={{ width: 220, background: '#1a2233', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0 24px 0', boxShadow: '2px 0 8px #f0f1f2' }}>
                <div style={{ height: 64, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, letterSpacing: 1, borderBottom: '1px solid #232b3b', marginBottom: 8 }}>
                    <span style={{ color: '#fff' }}>BlockChainForge</span>
                </div>
                <nav style={{ width: '100%' }}>
                    {menuItems.map(item => (
                        <div
                            key={item.key}
                            onClick={() => setPage(item.key)}
                            style={{
                                display: 'flex', alignItems: 'center', cursor: 'pointer',
                                padding: '0 32px', height: 48, fontSize: 16, fontWeight: 500,
                                background: page === item.key ? '#232b3b' : 'none',
                                color: page === item.key ? '#40a9ff' : '#fff',
                                borderLeft: page === item.key ? '4px solid #40a9ff' : '4px solid transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            <span style={{ fontSize: 20, marginRight: 12 }}>{item.icon}</span>
                            {item.label}
                        </div>
                    ))}
                </nav>
            </aside>
            {/* Content */}
            <main style={{ flex: 1, minHeight: '100vh', background: '#f5f6fa', padding: '32px 40px' }}>
                {isLoading && <div style={{ textAlign: 'center', color: '#4b5563' }}>加载中...</div>}
                {page === 'dashboard' && (
                    <div style={{ background: '#fff', borderRadius: 8, padding: 32, boxShadow: '0 2px 8px #f0f1f2' }}>
                        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>仪表盘</h2>
                        <div style={{ height: 400, width: '100%' }}>
                            <canvas ref={chartRef}></canvas>
                        </div>
                    </div>
                )}
                {page === 'nodes' && (
                    <div style={{ background: '#fff', borderRadius: 8, padding: 32, boxShadow: '0 2px 8px #f0f1f2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <span style={{ fontSize: 22, fontWeight: 600 }}>全节点管理</span>
                            <div>
                                <button
                                    onClick={() => setAddNodeModal(true)}
                                    style={{ background: '#40a9ff', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 500, cursor: 'pointer', marginRight: 12 }}
                                    disabled={isLoading}
                                >添加节点</button>
                                <button
                                    onClick={() => setCreateNodeModal(true)}
                                    style={{ background: '#52c41a', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 500, cursor: 'pointer' }}
                                    disabled={isLoading}
                                >创建节点</button>
                            </div>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                            <thead>
                                <tr style={{ background: '#f5f6fa' }}>
                                    <th style={{ padding: 10, borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>ID</th>
                                    <th style={{ padding: 10, borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>IP</th>
                                    <th style={{ padding: 10, borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>端口号</th>
                                    <th style={{ padding: 10, borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>链</th>
                                    <th style={{ padding: 10, borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>状态</th>
                                    <th style={{ padding: 10, borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>同步状态</th>
                                    <th style={{ padding: 10, borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {nodes.length === 0 ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', color: '#aaa', padding: 32 }}>暂无节点数据</td></tr>
                                ) : (
                                    nodes.map(node => (
                                        <tr key={node.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: 10 }}>{node.id}</td>
                                            <td style={{ padding: 10 }}>{node.ip || '-'}</td>
                                            <td style={{ padding: 10 }}>{node.port || '-'}</td>
                                            <td style={{ padding: 10 }}>{node.chain}</td>
                                            <td style={{ padding: 10 }}>
                                                <span style={{ display: 'inline-block', minWidth: 60, color: '#fff', background: statusColors[node.status] || '#d9d9d9', borderRadius: 4, padding: '2px 10px', textAlign: 'center' }}>{node.status}</span>
                                            </td>
                                            <td style={{ padding: 10 }}>
                                                <span style={{ display: 'inline-block', minWidth: 60, color: '#fff', background: syncColors[node.sync_status] || '#d9d9d9', borderRadius: 4, padding: '2px 10px', textAlign: 'center' }}>{node.sync_status}</span>
                                            </td>
                                            <td style={{ padding: 10 }}>
                                                <button
                                                    onClick={() => deleteNode(node.id)}
                                                    style={{ background: '#f5222d', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 14px', fontWeight: 500, cursor: 'pointer' }}
                                                    disabled={isLoading}
                                                >删除</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {/* 添加节点弹窗 */}
                        {addNodeModal && (
                            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 320, boxShadow: '0 2px 8px #f0f1f2', position: 'relative' }}>
                                    <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>添加节点</h3>
                                    <div style={{ marginBottom: 16 }}>
                                        <input
                                            type="text"
                                            placeholder="IP"
                                            value={newNode.ip}
                                            onChange={e => setNewNode({ ...newNode, ip: e.target.value })}
                                            style={{ width: '100%', marginBottom: 12, padding: '8px 12px', borderRadius: 4, border: '1px solid #d9d9d9' }}
                                            disabled={isLoading}
                                        />
                                        <input
                                            type="text"
                                            placeholder="端口号"
                                            value={newNode.port}
                                            onChange={e => setNewNode({ ...newNode, port: e.target.value })}
                                            style={{ width: '100%', marginBottom: 12, padding: '8px 12px', borderRadius: 4, border: '1px solid #d9d9d9' }}
                                            disabled={isLoading}
                                        />
                                        <input
                                            type="text"
                                            placeholder="链（如 Ethereum）"
                                            value={newNode.chain}
                                            onChange={e => setNewNode({ ...newNode, chain: e.target.value })}
                                            style={{ width: '100%', marginBottom: 12, padding: '8px 12px', borderRadius: 4, border: '1px solid #d9d9d9' }}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => setAddNodeModal(false)}
                                            style={{ marginRight: 12, background: '#f0f0f0', color: '#333', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 500, cursor: 'pointer' }}
                                            disabled={isLoading}
                                        >取消</button>
                                        <button
                                            onClick={addNode}
                                            style={{ background: '#40a9ff', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 500, cursor: 'pointer' }}
                                            disabled={isLoading}
                                        >确定</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* 创建节点弹窗 */}
                        {createNodeModal && (
                            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 320, boxShadow: '0 2px 8px #f0f1f2', position: 'relative' }}>
                                    <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>创建节点</h3>
                                    <div style={{ marginBottom: 16 }}>
                                        <input
                                            type="text"
                                            placeholder="云"
                                            value={createNodeForm.cloud}
                                            onChange={e => setCreateNodeForm({ ...createNodeForm, cloud: e.target.value })}
                                            style={{ width: '100%', marginBottom: 12, padding: '8px 12px', borderRadius: 4, border: '1px solid #d9d9d9' }}
                                            disabled={isLoading}
                                        />
                                        <input
                                            type="text"
                                            placeholder="机器类型"
                                            value={createNodeForm.machineType}
                                            onChange={e => setCreateNodeForm({ ...createNodeForm, machineType: e.target.value })}
                                            style={{ width: '100%', marginBottom: 12, padding: '8px 12px', borderRadius: 4, border: '1px solid #d9d9d9' }}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => setCreateNodeModal(false)}
                                            style={{ marginRight: 12, background: '#f0f0f0', color: '#333', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 500, cursor: 'pointer' }}
                                            disabled={isLoading}
                                        >取消</button>
                                        <button
                                            onClick={createNode}
                                            style={{ background: '#52c41a', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 500, cursor: 'pointer' }}
                                            disabled={isLoading}
                                        >确定</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {page === 'rpcs' && (
                    <div style={{ background: '#fff', borderRadius: 8, padding: 32, boxShadow: '0 2px 8px #f0f1f2' }}>
                        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>RPC 管理</h2>
                        {/* 你可以在这里继续美化 RPC 管理页面 */}
                        <div style={{ color: '#aaa', textAlign: 'center', padding: 64 }}>敬请期待...</div>
                    </div>
                )}
            </main>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default App;