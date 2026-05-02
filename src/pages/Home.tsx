import React, { useState, useEffect } from 'react';

interface HomeProps {
    setCurrentPage: (page: 'dashboard' | 'products') => void;
    onConnect: () => void;
    isLoggedIn?: boolean;
    walletAddress?: string;
}

const Home: React.FC<HomeProps> = ({ setCurrentPage, onConnect, isLoggedIn = false, walletAddress = '' }) => {
    const [showAggregatorDialog, setShowAggregatorDialog] = useState(false);
    const [showApiDialog, setShowApiDialog] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [copied, setCopied] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [trendingTokens, setTrendingTokens] = useState([
        { symbol: 'SOL', price: '$185.42', change: '+5.2%', positive: true },
        { symbol: 'BTC', price: '$69,420', change: '+2.3%', positive: true },
        { symbol: 'ETH', price: '$3,850', change: '+1.8%', positive: true },
        { symbol: 'BNB', price: '$620', change: '-0.5%', positive: false },
        { symbol: 'MATIC', price: '$0.95', change: '+3.2%', positive: true },
        { symbol: 'FIXERCOIN', price: '$0.0000558', change: '+12%', positive: true },
        { symbol: 'FXM', price: '$0.00001457', change: '+8.5%', positive: true },
        { symbol: 'PINGX', price: '$0.00000395', change: '-2.1%', positive: false },
        { symbol: 'USDC', price: '$1.00', change: '+0.01%', positive: true },
        { symbol: 'USDT', price: '$1.00', change: '-0.02%', positive: false },
        { symbol: 'LOCKER', price: '$0.00000875', change: '+15%', positive: true },
    ]);

    const networks = [
        { name: 'Solana', status: 'Live', fee: '0.01%' },
        { name: 'MintMe', status: 'Live', fee: '0.01%' },
        { name: 'Ethereum', status: 'Coming Soon', fee: '0.03%' },
        { name: 'BNB Chain', status: 'Coming Soon', fee: '0.03%' },
        { name: 'Polygon', status: 'Coming Soon', fee: '0.03%' },
    ];

    // Fetch real token prices from DexScreener
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const symbols = ['SOL', 'BTC', 'ETH', 'BNB', 'MATIC'];
                const updates = [...trendingTokens];
                
                for (const symbol of symbols) {
                    const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${symbol}`);
                    const data = await response.json();
                    if (data.pairs && data.pairs[0]) {
                        const price = parseFloat(data.pairs[0].priceUsd);
                        const change = parseFloat(data.pairs[0].priceChange?.h24 || 0);
                        const index = updates.findIndex(t => t.symbol === symbol);
                        if (index !== -1) {
                            updates[index] = {
                                ...updates[index],
                                price: `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
                                positive: change >= 0
                            };
                        }
                    }
                }
                setTrendingTokens(updates);
            } catch (error) {
                console.error('Failed to fetch prices:', error);
            }
        };
        
        fetchPrices();
        const interval = setInterval(fetchPrices, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleRegisterApiKey = async () => {
        if (!isLoggedIn || !walletAddress) {
            onConnect();
            return;
        }
        
        setIsRegistering(true);
        try {
            const response = await fetch('/api/max/v1/developers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    walletAddress, 
                    email: '', 
                    companyName: 'Fixorium User' 
                })
            });
            const data = await response.json();
            if (data.success) {
                setApiKey(data.apiKey);
                setApiSecret(data.apiSecret);
                setShowApiDialog(true);
            }
        } catch (error) {
            console.error('Failed to register:', error);
        } finally {
            setIsRegistering(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Double the tokens for seamless marquee
    const marqueeTokens = [...trendingTokens, ...trendingTokens];

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
                            <a href="https://exchange.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-primary transition">
                                Exchange
                            </a>
                            <button onClick={() => setShowAggregatorDialog(true)} className="text-sm text-gray-400 hover:text-primary transition">
                                Aggregator
                            </button>
                            <a href="https://wallet.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-primary transition">
                                Wallet
                            </a>
                        </nav>

                        {/* Connect Button */}
                        <button onClick={onConnect} className="px-4 py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-[#e8d58a] transition">
                            {isLoggedIn ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}` : 'Connect Wallet'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Marquee - Trending Tokens */}
            <div className="fixed top-16 left-0 right-0 bg-card border-y border-border overflow-hidden whitespace-nowrap py-2 z-40">
                <div className="inline-block animate-marquee whitespace-nowrap">
                    {marqueeTokens.map((token, idx) => (
                        <span key={idx} className="mx-4 inline-flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{token.symbol}</span>
                            <span className="text-xs text-gray-400">{token.price}</span>
                            <span className={`text-xs ${token.positive ? 'text-green-400' : 'text-red-400'}`}>
                                {token.change}
                            </span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Main Content with padding for fixed header and marquee */}
            <div className="pt-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column - User Capital & Info */}
                        <div className="lg:w-1/2">
                            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 rounded-xl p-8 mb-8">
                                <div className="text-sm text-gray-400 mb-2">Total Value Locked</div>
                                <div className="text-4xl font-bold text-white mb-2">$12,345,678</div>
                                <div className="text-xs text-green-400">+8.2% (24h)</div>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-primary mb-4">Get API Key</h2>
                                <p className="text-sm text-gray-400 mb-4">
                                    Integrate Fixorium aggregator into your application with our simple REST API.
                                    Only 0.01% platform fee.
                                </p>
                                <button
                                    onClick={handleRegisterApiKey}
                                    disabled={isRegistering}
                                    className="w-full px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-[#e8d58a] transition disabled:opacity-50"
                                >
                                    {isRegistering ? 'REGISTERING...' : 'GET API KEY'}
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Platform Information */}
                        <div className="lg:w-1/2">
                            {/* Hero Section */}
                            <div className="text-center lg:text-left mb-8">
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                    <span className="text-primary">Fixorium</span>
                                    <br />
                                    <span className="text-white">Multi-Chain Aggregator</span>
                                </h1>
                                <p className="text-gray-400 text-lg">
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

                            {/* Networks Section */}
                            <div className="bg-card border border-border rounded-xl p-6">
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
                        </div>
                    </div>
                </div>
            </div>

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
                            <button
                                onClick={handleRegisterApiKey}
                                className="px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition"
                            >
                                Get API Key
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* API Key Dialog */}
            {showApiDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-primary">MAX API Key</h2>
                            <button onClick={() => setShowApiDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                <p className="text-xs text-yellow-400">⚠️ Save these credentials securely. You won't see them again!</p>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">API Key</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-xs text-primary break-all">{apiKey}</code>
                                    <button onClick={() => copyToClipboard(apiKey)} className="px-3 py-2 bg-darker border border-border rounded-lg text-xs text-gray-400 hover:text-white">
                                        {copied ? '✓' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">API Secret</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-xs text-yellow-400 break-all">{apiSecret}</code>
                                    <button onClick={() => copyToClipboard(apiSecret)} className="px-3 py-2 bg-darker border border-border rounded-lg text-xs text-gray-400 hover:text-white">
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
                            <button onClick={() => setShowApiDialog(false)} className="w-full py-2 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Marquee Animation CSS */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Home;
