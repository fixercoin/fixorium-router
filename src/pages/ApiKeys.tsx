import React, { useState, useEffect } from 'react';

interface ApiKey {
    id: string;
    name: string;
    apiKey: string;
    apiSecret: string;
    createdAt: number;
    usage: number;
    status: 'active' | 'revoked';
}

const ApiKeys: React.FC = () => {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newGeneratedKey, setNewGeneratedKey] = useState<ApiKey | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load keys from localStorage or API
        const savedKeys = localStorage.getItem('api_keys');
        if (savedKeys) {
            setKeys(JSON.parse(savedKeys));
        }
    }, []);

    const createApiKey = async () => {
        if (!newKeyName.trim()) return;
        
        setLoading(true);
        
        // Simulate API key generation
        const newKey: ApiKey = {
            id: Date.now().toString(),
            name: newKeyName,
            apiKey: `fix_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 8)}`,
            apiSecret: Math.random().toString(36).substring(2, 20) + Math.random().toString(36).substring(2, 20),
            createdAt: Date.now(),
            usage: 0,
            status: 'active'
        };
        
        const updatedKeys = [...keys, newKey];
        setKeys(updatedKeys);
        localStorage.setItem('api_keys', JSON.stringify(updatedKeys));
        
        setNewGeneratedKey(newKey);
        setNewKeyName('');
        setTimeout(() => setNewGeneratedKey(null), 10000);
        setShowModal(false);
        setLoading(false);
    };

    const revokeKey = (id: string) => {
        const updatedKeys = keys.map(key => 
            key.id === id ? { ...key, status: 'revoked' } : key
        );
        setKeys(updatedKeys);
        localStorage.setItem('api_keys', JSON.stringify(updatedKeys));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-yellow-400 mb-2">API Keys</h1>
                    <p className="text-gray-400">Create and manage API keys for external integrations</p>
                </div>

                {/* Create Button */}
                <div className="mb-8">
                    <button 
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New API Key
                    </button>
                </div>

                {/* New Key Alert */}
                {newGeneratedKey && (
                    <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm font-semibold mb-2">⚠️ Save these credentials now!</p>
                        <div className="space-y-2 mb-3">
                            <div className="flex justify-between items-center">
                                <code className="text-xs text-gray-300">API Key:</code>
                                <code className="text-xs text-yellow-400 bg-black px-2 py-1 rounded">{newGeneratedKey.apiKey}</code>
                                <button onClick={() => copyToClipboard(newGeneratedKey.apiKey)} className="text-gray-400 hover:text-white">
                                    📋
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <code className="text-xs text-gray-300">API Secret:</code>
                                <code className="text-xs text-red-400 bg-black px-2 py-1 rounded">{newGeneratedKey.apiSecret}</code>
                                <button onClick={() => copyToClipboard(newGeneratedKey.apiSecret)} className="text-gray-400 hover:text-white">
                                    📋
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">These won't be shown again. Save them securely.</p>
                    </div>
                )}

                {/* Keys Table */}
                {keys.length > 0 ? (
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-black border-b border-neutral-800">
                                    <tr>
                                        <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                        <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">API Key</th>
                                        <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Usage</th>
                                        <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Created</th>
                                        <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {keys.map((key) => (
                                        <tr key={key.id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition">
                                            <td className="p-4">
                                                <span className="text-white text-sm">{key.name}</span>
                                            </td>
                                            <td className="p-4">
                                                <code className="text-xs text-yellow-400 bg-black px-2 py-1 rounded">
                                                    {key.apiKey.slice(0, 16)}...
                                                </code>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-gray-400 text-sm">{key.usage}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-gray-400 text-sm">
                                                    {new Date(key.createdAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs px-2 py-1 rounded-full ${key.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {key.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button 
                                                    onClick={() => revokeKey(key.id)}
                                                    disabled={key.status !== 'active'}
                                                    className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Revoke
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-12 text-center">
                        <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        <p className="text-gray-500">No API keys created yet</p>
                        <p className="text-gray-600 text-sm mt-2">Click the button above to create your first key</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">Create API Key</h2>
                        <div className="mb-4">
                            <label className="block text-xs text-gray-500 uppercase mb-2">Key Name</label>
                            <input 
                                type="text" 
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="e.g., Production App, Trading Bot"
                                className="w-full p-3 bg-black border border-neutral-800 rounded-lg text-white text-sm focus:border-yellow-400 focus:outline-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={createApiKey} 
                                disabled={loading || !newKeyName.trim()}
                                className="flex-1 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="flex-1 py-2 bg-neutral-800 text-white font-bold rounded-lg hover:bg-neutral-700 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApiKeys;
