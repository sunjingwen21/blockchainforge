import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Chart from 'chart.js/auto';

const App = () => {
    const [page, setPage] = useState('dashboard');
    const [rpcs, setRPCs] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [newRPC, setNewRPC] = useState({ url: '', chain_id: '', status: '活跃' });
    const [newNode, setNewNode] = useState({ chain: '', status: '运行中', sync_status: '已同步' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

    const fetchRPCs = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/rpc/api/rpcs');
            setRPCs(response.data || []);
        } catch (error) {
            console.error('获取 RPC 列表失败:', error);
            toast.error('无法获取 RPC 列表，请检查后端或网络');
            setRPCs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchNodes = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/rpc/api/nodes');
            setNodes(response.data || []);
        } catch (error) {
            console.error('获取节点列表失败:', error);
            toast.error('无法获取节点列表，请检查后端或网络');
            setNodes([]);
        } finally {
            setIsLoading(false);
        }
    };

    const addRPC = async () => {
        const sanitizedRPC = {
            url: newRPC.url.trim(),
            chain_id: newRPC.chain_id.trim(),
            status: newRPC.status,
        };
        if (!sanitizedRPC.url || !sanitizedRPC.chain_id) {
            toast.error('请填写 RPC 地址和链 ID');
            return;
        }
        if (!sanitizedRPC.url.startsWith('http')) {
            toast.error('RPC 地址必须以 http 或 https 开头');
            return;
        }
        setIsLoading(true);
        try {
            await axios.post('/rpc/api/rpcs', sanitizedRPC);
            setNewRPC({ url: '', chain_id: '', status: '活跃' });
            fetchRPCs();
            toast.success('RPC 添加成功');
        } catch (error) {
            console.error('添加 RPC 失败:', error);
            toast.error('添加 RPC 失败');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteRPC = async (id) => {
        setIsLoading(true);
        try {
            await axios.delete(`/rpc/api/rpcs/${id}`);
            fetchRPCs();
            toast.success('RPC 删除成功');
        } catch (error) {
            console.error('删除 RPC 失败:', error);
            toast.error('删除 RPC 失败');
        } finally {
            setIsLoading(false);
        }
    };

    const addNode = async () => {
        const sanitizedNode = {
            chain: newNode.chain.trim(),
            status: newNode.status,
            sync_status: newNode.sync_status,
        };
        if (!sanitizedNode.chain) {
            toast.error('请填写链名称');
            return;
        }
        setIsLoading(true);
        try {
            await axios.post('/rpc/api/nodes', sanitizedNode);
            setNewNode({ chain: '', status: '运行中', sync_status: '已同步' });
            fetchNodes();
            toast.success('节点添加成功');
        } catch (error) {
            console.error('添加节点失败:', error);
            toast.error('添加节点失败');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteNode = async (id) => {
        setIsLoading(true);
        try {
            await axios.delete(`/rpc/api/nodes/${id}`);
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
        rpcs.forEach(rpc => rpcStatusCount[rpc.status] = (rpcStatusCount[rpc.status] || 0) + 1);
        nodes.forEach(node => nodeStatusCount[node.status] = (nodeStatusCount[node.status] || 0) + 1);

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
        <div className="flex min-h-screen">
            <div
                className={`fixed inset-y-0 left-0 w-64 max-w-xs sidebar transform ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } md:static md:transform-none md:w-1/5 transition-transform duration-200 z-50`}
            >
                <h1 className="text-2xl font-bold mb-6" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                    BlockChainForge
                </h1>
                <ul>
                    <li
                        className={`cursor-pointer rounded ${page === 'dashboard' ? 'active' : ''}`}
                        onClick={() => {
                            setPage('dashboard');
                            setIsSidebarOpen(false);
                        }}
                    >
                        仪表盘
                    </li>
                    <li
                        className={`cursor-pointer rounded ${page === 'rpcs' ? 'active' : ''}`}
                        onClick={() => {
                            setPage('rpcs');
                            setIsSidebarOpen(false);
                        }}
                    >
                        RPC 管理
                    </li>
                    <li
                        className={`cursor-pointer rounded ${page === 'nodes' ? 'active' : ''}`}
                        onClick={() => {
                            setPage('nodes');
                            setIsSidebarOpen(false);
                        }}
                    >
                        全节点管理
                    </li>
                </ul>
                <div className="mt-6">
                        <tbody>
                        <tr>
                            <td>RPC</td>
                            <td>{rpcs.length}</td>
                            <td>
                                {Object.entries(rpcs.reduce((acc, rpc) => {
                                    acc[rpc.status] = (acc[rpc.status] || 0) + 1;
                                    return acc;
                                }, {})).map(([status, count]) => `${status}: ${count}`).join(', ')}
                            </td>
                        </tr>
                        <tr>
                            <td>节点</td>
                            <td>{nodes.length}</td>
                            <td>
                                {Object.entries(nodes.reduce((acc, node) => {
                                    acc[node.status] = (acc[node.status] || 0) + 1;
                                    return acc;
                                }, {})).map(([status, count]) => `${status}: ${count}`).join(', ')}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="content">
                <button
                    className="md:hidden p-2 bg-gray-800 text-white rounded mb-4 min-w-[100px]"
                    style={{ backgroundColor: '#2d3748', color: 'white', padding: '8px', borderRadius: '4px', marginBottom: '16px', minWidth: '100px' }}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    {isSidebarOpen ? '关闭菜单' : '打开菜单'}
                </button>
                {isLoading && <div style={{ textAlign: 'center', color: '#4b5563' }}>加载中...</div>}
                {page === 'dashboard' && (
                    <div>
                        <h2 className="text-xl font-bold mb-4" style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>
                            仪表盘
                        </h2>
                        <div>
                            <div style={{ height: '400px', width: '100%' }}>
                                <canvas ref={chartRef}></canvas>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default App;