import React from 'react';

const ApiKeys: React.FC = () => {
    return (
        <div className="min-h-screen bg-dark p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-primary mb-4">API Keys Management</h1>
                <p className="text-gray-400 mb-8">Create and manage your API keys for external integrations</p>
                <div className="bg-gray-900 rounded-xl p-6">
                    <button className="px-4 py-2 bg-primary text-black font-bold rounded-lg">
                        + Create New API Key
                    </button>
                    <div className="mt-6 text-gray-400 text-sm">
                        No API keys created yet. Click the button above to create your first key.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiKeys;
