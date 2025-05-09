import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
    const [page, setPage] = useState('dashboard');
    const [rpcs, setRPCs] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [newRPC, setNewRPC] = useState({ url: '', chain_id: '', status: '活跃' });
    const [newNode, setNewNode] = useState({ chain: '', status: '运行中', sync_status: '已同步' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const canvasRef = useRef(null);

    useEffect(() => {
        fetchRPCs();
        fetchNodes();
    }, []);

    useEffect(() => {
        if (page === 'dashboard' && canvasRef.current) {
            drawChart();
        }
    }, [page, rpcs, nodes]);

    const fetchRPCs = async () => {
        setIsLoading(true);
        try {
            console.log('Sending request to /rpc/api/rpcs');
            const response = await axios.get('/rpc/api/rpcs');
            console.log('RPCs Response:', response.data);
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
            console.log('Sending request to /rpc/api/nodes');
            const response = await axios.get('/rpc/api/nodes');
            console.log('Nodes Response:', response.data);
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
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const rpcStatusCount = { 活跃: 0, 离线: 0, 故障: 0 };
        const nodeStatusCount = { 运行中: 0, 已停止: 0, 错误: 0 };
        rpcs.forEach(rpc => rpcStatusCount[rpc.status] = (rpcStatusCount[rpc.status] || 0) + 1);
        nodes.forEach(node => nodeStatusCount[node.status] = (nodeStatusCount[node.status] || 0) + 1);

        const barWidth = 50;
        const spacing = 20;
        const startX = 30;
        let x = startX;

        ctx.fillStyle = '#3b82f6';
        Object.entries(rpcStatusCount).forEach(([status, count], index) => {
            const height = count * 20;
            ctx.fillRect(x, canvas.height - height - 30, barWidth, height);
            ctx.fillStyle = '#000';
            ctx.fillText(status, x, canvas.height - 10);
            ctx.fillText(count, x + barWidth / 2 - 5, canvas.height - height - 40);
            x += barWidth + spacing;
        });

        x += 50;
        ctx.fillStyle = '#10b981';
        Object.entries(nodeStatusCount).forEach(([status, count], index) => {
            const height = count * 20;
            ctx.fillRect(x, canvas.height - height - 30, barWidth, height);
            ctx.fillStyle = '#000';
            ctx.fillText(status, x, canvas.height - 10);
            ctx.fillText(count, x + barWidth / 2 - 5, canvas.height - height - 40);
            x += barWidth + spacing;
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
                        <div className="mb-4">
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>统计数据</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>类型</th>
                                        <th>总数</th>
                                        <th>状态分布</th>
                                    </tr>
                                </thead>
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
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>状态分布图</h3>
                            <canvas ref={canvasRef} width="800" height="300"></canvas>
                        </div>
                    </div>
                )}
                {page === 'rpcs' && (
                    <div>
                        <h2 className="text-xl font-bold mb-4" style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>
                            RPC 管理
                        </h2>
                        <div className="mb-4 flex flex-wrap gap-2" style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            <input
                                type="text"
                                placeholder="RPC 地址"
                                value={newRPC.url}
                                onChange={(e) => setNewRPC({ ...newRPC, url: e.target.value })}
                                className="input-field"
                                disabled={isLoading}
                            />
                            <input
                                type="number"
                                placeholder="链 ID"
                                value={newRPC.chain_id}
                                onChange={(e) => setNewRPC({ ...newRPC, chain_id: e.target.value })}
                                className="input-field"
                                style={{ width: '96px' }}
                                disabled={isLoading}
                            />
                            <select
                                value={newRPC.status}
                                onChange={(e) => setNewRPC({ ...newRPC, status: e.target.value })}
                                className="select-field"
                                disabled={isLoading}
                            >
                                <option value="活跃">活跃</option>
                                <option value="离线">离线</option>
                                <option value="故障">故障</option>
                            </select>
                            <button
                                onClick={addRPC}
                                className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400 min-w-[100px]"
                                style={{ backgroundColor: '#3b82f6', color: 'white', padding: '8px', borderRadius: '4px', minWidth: '100px' }}
                                disabled={isLoading}
                            >
                                添加 RPC
                            </button>
                        </div>
                        <div className="overflow-x-auto" style={{ overflowX: 'auto' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>地址</th>
                                        <th>链 ID</th>
                                        <th>状态</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rpcs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '8px', textAlign: 'center', color: '#6b7280' }}>
                                                暂无 RPC 数据
                                            </td>
                                        </tr>
                                    ) : (
                                        rpcs.map(rpc => (
                                            <tr key={rpc.id}>
                                                <td>{rpc.id}</td>
                                                <td>{rpc.url}</td>
                                                <td>{rpc.chain_id}</td>
                                                <td>{rpc.status}</td>
                                                <td>
                                                    <button
                                                        onClick={() => deleteRPC(rpc.id)}
                                                        className="bg-red-500 text-white p-1 rounded disabled:bg-gray-400 min-w-[60px]"
                                                        style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px', borderRadius: '4px', minWidth: '60px' }}
                                                        disabled={isLoading}
                                                    >
                                                        删除
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {page === 'nodes' && (
                    <div>
                        <h2 className="text-xl font-bold mb-4" style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>
                            全节点管理
                        </h2>
                        <div className="mb-4 flex flex-wrap gap-2" style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            <input
                                type="text"
                                placeholder="链（如 Ethereum）"
                                value={newNode.chain}
                                onChange={(e) => setNewNode({ ...newNode, chain: e.target.value })}
                                className="input-field"
                                disabled={isLoading}
                            />
                            <select
                                value={newNode.status}
                                onChange={(e) => setNewNode({ ...newNode, status: e.target.value })}
                                className="select-field"
                                disabled={isLoading}
                            >
                                <option value="运行中">运行中</option>
                                <option value="已停止">已停止</option>
                                <option value="错误">错误</option>
                            </select>
                            <select
                                value={newNode.sync_status}
                                onChange={(e) => setNewNode({ ...newNode, sync_status: e.target.value })}
                                className="select-field"
                                disabled={isLoading}
                            >
                                <option value="已同步">已同步</option>
                                <option value="同步中">同步中</option>
                                <option value="未同步">未同步</option>
                            </select>
                            <button
                                onClick={addNode}
                                className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400 min-w-[100px]"
                                style={{ backgroundColor: '#3b82f6', color: 'white', padding: '8px', borderRadius: '4px', minWidth: '100px' }}
                                disabled={isLoading}
                            >
                                添加节点
                            </button>
                        </div>
                        <div className="overflow-x-auto" style={{ overflowX: 'auto' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>链</th>
                                        <th>状态</th>
                                        <th>同步状态</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nodes.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '8px', textAlign: 'center', color: '#6b7280' }}>
                                                暂无节点数据
                                            </td>
                                        </tr>
                                    ) : (
                                        nodes.map(node => (
                                            <tr key={node.id}>
                                                <td>{node.id}</td>
                                                <td>{node.chain}</td>
                                                <td>{node.status}</td>
                                                <td>{node.sync_status}</td>
                                                <td>
                                                    <button
                                                        onClick={() => deleteNode(node.id)}
                                                        className="bg-red-500 text-white p-1 rounded disabled:bg-gray-400 min-w-[60px]"
                                                        style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px', borderRadius: '4px', minWidth: '60px' }}
                                                        disabled={isLoading}
                                                    >
                                                        删除
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default App;