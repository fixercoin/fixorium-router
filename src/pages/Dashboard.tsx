import React from 'react';

interface DashboardProps {
    walletAddress?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ walletAddress }) => {
    return (
        <div className="min-h-screen bg-dark p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-primary mb-4">Dashboard</h1>
                <p className="text-gray-400">Welcome back, {walletAddress}</p>
                <div className="mt-8 p-6 bg-gray-900 rounded-xl">
                    <h2 className="text-lg font-bold text-white mb-2">Your API Keys</h2>
                    <p className="text-gray-400">Manage your API keys from the API Keys page</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
