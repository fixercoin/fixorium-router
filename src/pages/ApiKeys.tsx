import React, { useState, useEffect } from 'react';

interface ApiKey {
  id: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  allowedDomains: string[];
  rateLimit: number;
  usage: number;
  createdAt: number;
  status: string;
}

const ApiKeys: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const userEmail = localStorage.getItem('user_email');

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    const response = await fetch('/api/aggregator/v1/keys', {
      headers: { 'Authorization': `Bearer ${userEmail}` }
    });
    const data = await response.json();
    if (data.success) {
      setKeys(data.keys || []);
    }
  };

  const createKey = async () => {
    setLoading(true);
    const response = await fetch('/api/aggregator/v1/keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userEmail}`
      },
      body: JSON.stringify({
        name: newKeyName,
        rateLimit: newKeyRateLimit
      })
    });
    const data = await response.json();
    if (data.success) {
      setKeys([...keys, data.key]);
      setShowCreateModal(false);
      setNewKeyName('');
    }
    setLoading(false);
  };

  const revokeKey = async (keyId: string) => {
    if (confirm('Are you sure you want to revoke this API key?')) {
      await fetch(`/api/aggregator/v1/keys?keyId=${keyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userEmail}` }
      });
      fetchKeys();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-dark pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary text-black text-sm font-bold rounded-lg hover:bg-[#e8d58a] transition"
          >
            + Create API Key
          </button>
        </div>

        <div className="bg-card border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-darker border-b border-gray-700">
              <tr>
                <th className="text-left p-4 text-xs text-gray-400 uppercase">Name</th>
                <th className="text-left p-4 text-xs text-gray-400 uppercase">API Key</th>
                <th className="text-left p-4 text-xs text-gray-400 uppercase">Usage</th>
                <th className="text-left p-4 text-xs text-gray-400 uppercase">Rate Limit</th>
                <th className="text-left p-4 text-xs text-gray-400 uppercase">Status</th>
                <th className="text-left p-4 text-xs text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-b border-gray-700">
                  <td className="p-4 text-sm text-white">{key.name}</td>
                  <td className="p-4">
                    <code className="text-xs text-primary bg-darker p-2 rounded">
                      {key.apiKey.slice(0, 20)}...
                    </code>
                    <button
                      onClick={() => copyToClipboard(key.apiKey, `key-${key.id}`)}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      {copied === `key-${key.id}` ? '✓' : '📋'}
                    </button>
                  </td>
                  <td className="p-4 text-sm text-white">{key.usage}</td>
                  <td className="p-4 text-sm text-white">{key.rateLimit}/day</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${key.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {key.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => revokeKey(key.apiKey)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-card border border-gray-700 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Create API Key</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full p-2 bg-darker border border-gray-700 rounded-lg text-white text-sm"
                    placeholder="My Integration"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">Rate Limit (requests/day)</label>
                  <input
                    type="number"
                    value={newKeyRateLimit}
                    onChange={(e) => setNewKeyRateLimit(parseInt(e.target.value))}
                    className="w-full p-2 bg-darker border border-gray-700 rounded-lg text-white text-sm"
                    placeholder="10000"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={createKey}
                    disabled={loading}
                    className="flex-1 py-2 bg-primary text-black text-sm font-bold rounded-lg hover:bg-[#e8d58a] transition"
                  >
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2 bg-gray-700 text-white text-sm font-bold rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeys;
