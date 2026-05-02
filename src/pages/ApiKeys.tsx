import React, { useState, useEffect } from 'react';

interface ApiKey {
  key: string;
  label: string;
  createdAt: string;
  lastUsed?: string;
  status: 'active' | 'inactive';
}

interface ApiKeysProps {
  walletAddress: string;
}

export const ApiKeys: React.FC<ApiKeysProps> = ({ walletAddress }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load API keys for this wallet
    const savedKeys = localStorage.getItem(`api_keys_${walletAddress}`);
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
    setLoading(false);
  }, [walletAddress]);

  const handleCreateKey = () => {
    if (!newKeyLabel.trim()) {
      alert('Please enter a label for the key');
      return;
    }

    const newKey: ApiKey = {
      key: `sk_${Math.random().toString(36).substring(2, 15)}`,
      label: newKeyLabel,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    const updatedKeys = [newKey, ...apiKeys];
    setApiKeys(updatedKeys);
    localStorage.setItem(`api_keys_${walletAddress}`, JSON.stringify(updatedKeys));
    
    setNewKeyLabel('');
    setShowCreateModal(false);
  };

  const handleRevokeKey = (key: string) => {
    const updatedKeys = apiKeys.filter(k => k.key !== key);
    setApiKeys(updatedKeys);
    localStorage.setItem(`api_keys_${walletAddress}`, JSON.stringify(updatedKeys));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">API Keys</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition"
        >
          + Create New Key
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading API keys...</div>
      ) : apiKeys.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No API keys yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.key} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">{apiKey.label}</h3>
                <p className="text-sm text-gray-400 font-mono truncate">{apiKey.key}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => copyToClipboard(apiKey.key)}
                  className="px-3 py-2 bg-blue-500/20 text-blue-400 text-sm rounded-lg hover:bg-blue-500/30 transition"
                >
                  Copy
                </button>
                <button
                  onClick={() => handleRevokeKey(apiKey.key)}
                  className="px-3 py-2 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition"
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New API Key</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Key Label</label>
                <input
                  type="text"
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                  placeholder="e.g., Production API"
                  className="w-full p-2 bg-darker border border-border rounded-lg text-white"
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-xs text-yellow-400">Save your API key somewhere safe. You won't be able to see it again!</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 border border-border rounded-lg text-gray-300 hover:bg-darker transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKey}
                  className="flex-1 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition"
                >
                  Create Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeys;
