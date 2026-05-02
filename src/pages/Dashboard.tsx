import React, { useState, useEffect } from 'react';
import ApiKeyModal from '../components/ApiKeyModal';

interface DashboardProps {
    walletAddress: string;
}

interface DeveloperData {
    id: string;
    walletAddress: string;
    email: string;
    companyName: string;
    apiKeys: Array<{
        id: string;
        name: string;
        apiKey: string;
        createdAt: number;
        requests: number;
    }>;
}

const Dashboard: React.FC<DashboardProps> = ({ walletAddress }) => {
    const [showApiModal, setShowApiModal] = useState(false);
    const [developerData, setDeveloperData] = useState<DeveloperData | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalVolume: 0, totalFees: 0, totalRequests: 0 });

    useEffect(() => {
        fetchDeveloperData();
    }, [walletAddress]);

    const fetchDeveloperData = async () => {
        try {
            // In production, fetch from your API
            // const response = await fetch(`/api/max/v1/developers/${walletAddress}`);
            // const data = await response.json();
            
            // Demo data
            setDeveloperData({
                id: 'dev_123',
                walletAddress: walletAddress,
                email: 'developer@example.com',
                companyName: 'My Awesome App',
                apiKeys: [
                    { id: 'key_1', name: 'Production Key', apiKey: 'max_abc123...', createdAt: Date.now(), requests: 1234 },
                    { id: 'key_2', name: 'Development Key', apiKey: 'max_def456...', createdAt: Date.now(), requests: 567 }
                ]
            });
            setStats({ totalVolume: 125000, totalFees: 12.5, totalRequests: 1801 });
        } catch (error) {
            console.error('Failed to fetch developer data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateApiKey = async (name: string, rateLimit: number) => {
        try {
            const response = await fetch('/api/max/v1/developers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress, name, rateLimit })
            });
            const data = await response.json();
            if (data.success) {
                alert(`API Key Created!\n\nKey: ${data.apiKey}\nSecret: ${data.apiSecret}\n\nSave this secret - you won't see it again!`);
                fetchDeveloperData();
            }
        } catch (error) {
            console.error('Failed to create API key:', error);
        }
        setShowApiModal(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Welcome back!</h1>
                <p className="text-gray-400">Manage your MAX Router integration</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="text-sm text-gray-400 mb-1">Total Volume</div>
                    <div className="text-2xl font-bold text-primary">${stats.totalVolume.toLocaleString()}</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="text-sm text-gray-400 mb-1">Fees Collected</div>
                    <div className="text-2xl font-bold text-green-400">${stats.totalFees.toLocaleString()}</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="text-sm text-gray-400 mb-1">API Requests</div>
                    <div className="text-2xl font-bold text-primary">{stats.totalRequests.toLocaleString()}</div>
                </div>
            </div>

            {/* API Keys Section */}
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">API Keys</h2>
                    <button onClick={() => setShowApiModal(true)} className="px-4 py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-[#e8d58a] transition">
                        + Create API Key
                    </button>
                </div>
                
                {developerData?.apiKeys.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No API keys yet. Create your first key to get started.</p>
                ) : (
                    <div className="space-y-4">
                        {developerData?.apiKeys.map((key) => (
                            <div key={key.id} className="border border-border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="font-semibold">{key.name}</div>
                                    <div className="text-sm font-mono text-gray-400">{key.apiKey}</div>
                                    <div className="text-xs text-gray-500 mt-1">Created: {new Date(key.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-sm text-gray-400">Requests</div>
                                        <div className="font-semibold">{key.requests.toLocaleString()}</div>
                                    </div>
                                    <button className="text-red-400 hover:text-red-300 text-sm">Revoke</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Start Section */}
            <div className="bg-darker border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
                <div className="space-y-3">
                    <code className="block bg-black/50 p-3 rounded-lg text-sm text-gray-300">
                        curl -X GET "https://fixorium.com.pk/api/max/v1/quote?inputMint=So111...&outputMint=EPjFW...&amount=1000000" \
                        <br />  -H "X-API-Key: YOUR_API_KEY"
                    </code>
                    <a href="/max/docs" className="text-primary hover:text-[#e8d58a] text-sm inline-block">Read full documentation →</a>
                </div>
            </div>

            {/* API Key Modal */}
            {showApiModal && (
                <ApiKeyModal onClose={() => setShowApiModal(false)} onCreate={handleCreateApiKey} />
            )}
        </div>
    );
};

export default Dashboard;
