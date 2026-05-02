import React, { useState, useEffect } from 'react';
// Remove Header and Footer imports - we don't need them anymore
// import Header from './components/Header';
// import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Dashboard from './pages/Dashboard';
import ApiKeys from './pages/ApiKeys';

type Page = 'home' | 'products' | 'dashboard' | 'apikeys';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    useEffect(() => {
        const savedWallet = localStorage.getItem('max_wallet');
        if (savedWallet) {
            setWalletAddress(savedWallet);
            setIsLoggedIn(true);
        }
    }, []);

    // This function is kept for compatibility but not used
    const handleConnectWallet = async () => {
        // Connect wallet is disabled - this function does nothing
        console.log('Connect wallet is disabled');
    };

    const handleDisconnect = () => {
        localStorage.removeItem('max_wallet');
        setWalletAddress(null);
        setIsLoggedIn(false);
        setCurrentPage('home');
    };

    return (
        <div className="min-h-screen bg-dark">
            {/* No Header - completely removed */}
            
            <main className="pt-0">
                {currentPage === 'home' && (
                    <Home 
                        setCurrentPage={setCurrentPage} 
                        onConnect={handleConnectWallet}
                        isLoggedIn={isLoggedIn}
                        walletAddress={walletAddress || ''}
                        onLogout={handleDisconnect}
                    />
                )}
                {currentPage === 'products' && <Products />}
                {currentPage === 'dashboard' && isLoggedIn && <Dashboard walletAddress={walletAddress!} />}
                {currentPage === 'apikeys' && isLoggedIn && <ApiKeys walletAddress={walletAddress!} />}
                
                {currentPage === 'dashboard' && !isLoggedIn && (
                    <div className="max-w-md mx-auto mt-20 p-8 bg-card border border-border rounded-xl text-center">
                        <p className="text-gray-400 mb-4">Please connect your wallet to access the dashboard</p>
                        <button onClick={handleConnectWallet} className="px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-[#e8d58a] transition">
                            Connect Wallet
                        </button>
                    </div>
                )}
            </main>
            
            {/* No Footer - completely removed */}
        </div>
    );
};

export default App;
