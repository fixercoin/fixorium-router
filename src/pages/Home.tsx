import React, { useState, useEffect } from 'react';

interface HomeProps {
    setCurrentPage: (page: 'dashboard' | 'products') => void;
    onConnect: () => void;
    isLoggedIn?: boolean;
    walletAddress?: string;
}

const Home: React.FC<HomeProps> = ({ setCurrentPage, onConnect, isLoggedIn = false, walletAddress = '' }) => {
    const [showExchangeDialog, setShowExchangeDialog] = useState(false);
    const [showAggregatorDialog, setShowAggregatorDialog] = useState(false);
    const [showWalletDialog, setShowWalletDialog] = useState(false);
    const [showMaxApiDialog, setShowMaxApiDialog] = useState(false);
    const [showMintMeApiDialog, setShowMintMeApiDialog] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [copied, setCopied] = useState(false);
    const [mintMeCopied, setMintMeCopied] = useState(false);
    const [trendingTokens, setTrendingTokens] = useState([
        { symbol: 'SOL', price: '$185.42', change: '+5.2%', positive: true, logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' },
        { symbol: 'BTC', price: '$69,420', change: '+2.3%', positive: true, logo: 'https://i.postimg.cc/qq9yW6k5/btc.png' },
        { symbol: 'ETH', price: '$3,850', change: '+1.8%', positive: true, logo: 'https://i.postimg.cc/zXpPqL4K/eth.png' },
        { symbol: 'BNB', price: '$620', change: '-0.5%', positive: false, logo: 'https://i.postimg.cc/TwQV3nJc/bnb.png' },
        { symbol: 'MATIC', price: '$0.95', change: '+3.2%', positive: true, logo: 'https://i.postimg.cc/HkYJc2Vd/matic.png' },
        { symbol: 'FIXERCOIN', price: '$0.0000558', change: '+12%', positive: true, logo: 'https://i.postimg.cc/c4nxmQGk/fixercoin.png' },
        { symbol: 'FXM', price: '$0.00001457', change: '+8.5%', positive: true, logo: 'https://i.postimg.cc/k4cbyVpC/fxm.png' },
        { symbol: 'PINGX', price: '$0.00000395', change: '-2.1%', positive: false, logo: 'https://i.postimg.cc/JzvcyB9q/cropped-circle-image.png' },
    ]);

    const networks = [
        { name: 'Solana', status: 'Live', fee: '0.01%' },
        { name: 'MintMe', status: 'Live', fee: '0.01%' },
        { name: 'Ethereum', status: 'Coming Soon', fee: '0.03%' },
        { name: 'BNB Chain', status: 'Coming Soon', fee: '0.03%' },
        { name: 'Polygon', status: 'Coming Soon', fee: '0.03%' },
    ];

    const handleRegisterMaxApi = async () => {
        if (!isLoggedIn || !walletAddress) {
            onConnect();
            return;
        }
        
        try {
            const response = await fetch('/api/max/v1/developers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress, email: '', companyName: 'Fixorium User' })
            });
            const data = await response.json();
            if (data.success) {
                setApiKey(data.apiKey);
                setApiSecret(data.apiSecret);
                setShowMaxApiDialog(true);
            }
        } catch (error) {
            console.error('Failed to register:', error);
        }
    };

    const handleRegisterMintMeApi = async () => {
        if (!isLoggedIn || !walletAddress) {
            onConnect();
            return;
        }
        
        try {
            const response = await fetch('/api/mintme/v1/developers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress, email: '', companyName: 'Fixorium User' })
            });
            const data = await response.json();
            if (data.success) {
                setApiKey(data.apiKey);
                setApiSecret(data.apiSecret);
                setShowMintMeApiDialog(true);
            }
        } catch (error) {
            console.error('Failed to register:', error);
        }
    };

    const copyToClipboard = (text: string, type: 'key' | 'secret') => {
        navigator.clipboard.writeText(text);
        if (type === 'key') setCopied(true);
        else setMintMeCopied(true);
        setTimeout(() => {
            setCopied(false);
            setMintMeCopied(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-dark">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 bg-darker/95 backdrop-blur-md border-b border-border z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Brand Name */}
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <span className="font-bold text-xl text-primary">FIXORIUM</span>
                        </div>

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center gap-6">
                            <button onClick={() => setShowExchangeDialog(true)} className="text-sm text-gray-400 hover:text-primary transition">
                                Exchange
                            </button>
                            <button onClick={() => setShowAggregatorDialog(true)} className="text-sm text-gray-400 hover:text-primary transition">
                                Aggregator
                            </button>
                            <button onClick={() => setShowWalletDialog(true)} className="text-sm text-gray-400 hover:text-primary transition">
                                Wallet
                            </button>
                        </nav>

                        {/* Connect Button */}
                        <button onClick={onConnect} className="px-4 py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-[#e8d58a] transition">
                            {isLoggedIn ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}` : 'Connect Wallet'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content with padding for fixed header */}
            <div className="pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column - Trending Tokens */}
                        <div className="lg:w-1/3">
                            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                                <h2 className="text-lg font-semibold text-primary mb-4">Trending Tokens</h2>
                                <div className="space-y-3">
                                    {trendingTokens.map((token, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-darker rounded-lg hover:bg-darker/80 transition">
                                            <div className="flex items-center gap-3">
                                                <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" />
                                                <div>
                                                    <div className="font-semibold text-white">{token.symbol}</div>
                                                    <div className="text-xs text-gray-500">{token.price}</div>
                                                </div>
                                            </div>
                                            <div className={`text-sm font-semibold ${token.positive ? 'text-green-400' : 'text-red-400'}`}>
                                                {token.change}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Platform Information */}
                        <div className="lg:w-2/3">
                            {/* Hero Section */}
                            <div className="text-center lg:text-left mb-12">
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                    <span className="text-primary">Fixorium</span>
                                    <br />
                                    <span className="text-white">Multi-Chain DEX Router</span>
                                </h1>
                                <p className="text-gray-400 text-lg max-w-2xl lg:max-w-full">
                                    Aggregate liquidity across Solana, MintMe, and EVM chains.
                                    The lowest fees in DeFi — only <span className="text-primary font-bold">0.01%</span>
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-card border border-border rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold text-primary">0.01%</div>
                                    <div className="text-xs text-gray-400">Platform Fee</div>
                                </div>
                                <div className="bg-card border border-border rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold text-primary">50+</div>
                                    <div className="text-xs text-gray-400">Pairs</div>
                                </div>
                                <div className="bg-card border border-border rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold text-primary">5</div>
                                    <div className="text-xs text-gray-400">Networks</div>
                                </div>
                            </div>

                            {/* API Key Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <button
                                    onClick={handleRegisterMaxApi}
                                    className="flex-1 px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-[#e8d58a] transition text-center"
                                >
                                    Get MAX API Key
                                </button>
                                <button
                                    onClick={handleRegisterMintMeApi}
                                    className="flex-1 px-6 py-3 border border-primary text-primary font-bold rounded-xl hover:bg-primary/10 transition text-center"
                                >
                                    Get MintMe API Key
                                </button>
                            </div>

                            {/* Networks Section */}
                            <div className="bg-card border border-border rounded-xl p-6 mb-8">
                                <h2 className="text-lg font-semibold text-primary mb-4">Supported Networks</h2>
                                <div className="space-y-3">
                                    {networks.map((network, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-darker rounded-lg">
                                            <div>
                                                <div className="font-semibold text-white">{network.name}</div>
                                                <div className="text-xs text-gray-500">Fee: {network.fee}</div>
                                            </div>
                                            <div className={`text-xs px-2 py-1 rounded-full ${network.status === 'Live' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {network.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-gradient-to-r from-primary/5 to-transparent border border-primary/30 rounded-xl p-6">
                                <h3 className="text-md font-semibold text-primary mb-2">Why Fixorium?</h3>
                                <p className="text-sm text-gray-400">
                                    The only multi-chain DEX aggregator with 0.01% fees across all networks.
                                    Get started in minutes with our simple REST API.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exchange Dialog */}
            {showExchangeDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-primary">Fixorium Exchange</h2>
                            <button onClick={() => setShowExchangeDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4 animate-pulse">⚡</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Coming Soon</h3>
                            <p className="text-gray-400 mb-6">Fixorium Exchange is under development</p>
                            <button className="px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition">
                                Download App
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Aggregator Dialog */}
            {showAggregatorDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-primary">Fixorium Aggregator</h2>
                            <button onClick={() => setShowAggregatorDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4 animate-bounce">🔄</div>
                            <h3 className="text-2xl font-bold text-white mb-2">MAX Aggregator</h3>
                            <p className="text-gray-400 mb-6">The fastest Solana DEX aggregator with 0.01% fee</p>
                            <button className="px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition">
                                Download App
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Wallet Dialog */}
            {showWalletDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-primary">Fixorium Wallet</h2>
                            <button onClick={() => setShowWalletDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4 animate-spin-slow">👛</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Web3 Wallet</h3>
                            <p className="text-gray-400 mb-6">Non-custodial multi-chain wallet</p>
                            <button className="px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition">
                                Download App
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MAX API Key Dialog */}
            {showMaxApiDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-primary">MAX API Key</h2>
                            <button onClick={() => setShowMaxApiDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                <p className="text-xs text-yellow-400">⚠️ Save these credentials securely. You won't see them again!</p>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">API Key</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-xs text-primary break-all">{apiKey}</code>
                                    <button onClick={() => copyToClipboard(apiKey, 'key')} className="px-3 py-2 bg-darker border border-border rounded-lg text-xs text-gray-400 hover:text-white">
                                        {copied ? '✓' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">API Secret</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-xs text-yellow-400 break-all">{apiSecret}</code>
                                    <button onClick={() => copyToClipboard(apiSecret, 'secret')} className="px-3 py-2 bg-darker border border-border rounded-lg text-xs text-gray-400 hover:text-white">
                                        Copy
                                    </button>
                                </div>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                <p className="text-xs text-blue-400">Quick Integration:</p>
                                <code className="text-xs text-gray-300 block mt-1 break-all">
                                    curl -X GET "https://fixorium.com.pk/max/v1/quote?inputMint=So111...&outputMint=EPjFW...&amount=1000000" -H "X-API-Key: {apiKey}"
                                </code>
                            </div>
                            <button onClick={() => setShowMaxApiDialog(false)} className="w-full py-2 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MintMe API Key Dialog */}
            {showMintMeApiDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-primary">MintMe API Key</h2>
                            <button onClick={() => setShowMintMeApiDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                <p className="text-xs text-yellow-400">⚠️ Save these credentials securely. You won't see them again!</p>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">API Key</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-xs text-primary break-all">{apiKey}</code>
                                    <button onClick={() => copyToClipboard(apiKey, 'key')} className="px-3 py-2 bg-darker border border-border rounded-lg text-xs text-gray-400 hover:text-white">
                                        {copied ? '✓' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">API Secret</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-xs text-yellow-400 break-all">{apiSecret}</code>
                                    <button onClick={() => copyToClipboard(apiSecret, 'secret')} className="px-3 py-2 bg-darker border border-border rounded-lg text-xs text-gray-400 hover:text-white">
                                        Copy
                                    </button>
                                </div>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                <p className="text-xs text-green-400">MintMe DEX Router</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-xs text-gray-300 break-all">mintme-router-program-id</code>
                                    <button onClick={() => copyToClipboard('mintme-router-program-id', 'mintme')} className="px-3 py-2 bg-darker border border-border rounded-lg text-xs text-gray-400 hover:text-white">
                                        {mintMeCopied ? '✓' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => setShowMintMeApiDialog(false)} className="w-full py-2 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
