import React from 'react';

interface HeaderProps {
    currentPage: string;
    setCurrentPage: (page: 'home' | 'products' | 'dashboard' | 'apikeys') => void;
    isLoggedIn: boolean;
    walletAddress: string | null;
    onConnect: () => void;
    onDisconnect: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, isLoggedIn, walletAddress, onConnect, onDisconnect }) => {
    const shortenAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-darker/95 backdrop-blur-md border-b border-border z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
                        <img src="https://i.postimg.cc/c4nxmQGk/fixercoin.png" alt="Fixorium" className="w-8 h-8" />
                        <span className="font-bold text-xl text-primary">Fixorium</span>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <button onClick={() => setCurrentPage('home')} className={`text-sm transition ${currentPage === 'home' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
                            Home
                        </button>
                        <button onClick={() => setCurrentPage('products')} className={`text-sm transition ${currentPage === 'products' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
                            Products
                        </button>
                        {isLoggedIn && (
                            <>
                                <button onClick={() => setCurrentPage('dashboard')} className={`text-sm transition ${currentPage === 'dashboard' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
                                    Dashboard
                                </button>
                                <button onClick={() => setCurrentPage('apikeys')} className={`text-sm transition ${currentPage === 'apikeys' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
                                    API Keys
                                </button>
                            </>
                        )}
                    </nav>

                    {/* Wallet Button */}
                    <div className="flex items-center gap-3">
                        {isLoggedIn && walletAddress ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 hidden sm:block">{shortenAddress(walletAddress)}</span>
                                <button onClick={onDisconnect} className="px-4 py-2 text-sm border border-border rounded-lg text-gray-300 hover:bg-card transition">
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <button onClick={onConnect} className="px-4 py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-[#e8d58a] transition">
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
