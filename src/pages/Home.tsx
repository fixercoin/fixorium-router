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
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="text-center max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-5xl md:text-6xl font-bold text-yellow-400 mb-4">
                        Fixorium Router
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl">
                        The most advanced DEX aggregator on Solana
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {!isLoggedIn ? (
                        <button className="px-8 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition">
                            Login to Continue
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={() => setCurrentPage('dashboard')} 
                                className="px-8 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition"
                            >
                                Dashboard
                            </button>
                            <button 
                                onClick={onLogout} 
                                className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>

                {!isLoggedIn && (
                    <p className="text-gray-500 text-sm mt-8">
                        Get API access to integrate Solana swaps into your application
                    </p>
                )}
            </div>
        </div>
    );
};

export default Home;
