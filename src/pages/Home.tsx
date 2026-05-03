import React from 'react';

interface HomeProps {
    setCurrentPage: (page: 'dashboard' | 'apikeys') => void;
    onConnect: () => void;
    isLoggedIn?: boolean;
    walletAddress?: string;
    onLogout?: () => void;
}

const Home: React.FC<HomeProps> = ({ setCurrentPage, isLoggedIn, onLogout }) => {
    return (
        <div className="min-h-screen bg-dark flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-primary mb-4">Fixorium Router</h1>
                <p className="text-gray-400 mb-8">The most advanced DEX aggregator on Solana</p>
                {!isLoggedIn ? (
                    <button className="px-6 py-3 bg-primary text-black font-bold rounded-lg">
                        Login to Continue
                    </button>
                ) : (
                    <div className="space-x-4">
                        <button onClick={() => setCurrentPage('dashboard')} className="px-6 py-3 bg-primary text-black font-bold rounded-lg">
                            Dashboard
                        </button>
                        <button onClick={onLogout} className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg">
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
