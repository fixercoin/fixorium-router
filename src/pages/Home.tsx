import React, { useState, useEffect } from 'react';

interface HomeProps {
    setCurrentPage: (page: 'dashboard' | 'products') => void;
    onConnect: () => void;
    isLoggedIn?: boolean;
    walletAddress?: string;
}

const Home: React.FC<HomeProps> = ({ setCurrentPage, onConnect, isLoggedIn = false, walletAddress = '' }) => {
    const [showAggregatorDialog, setShowAggregatorDialog] = useState(false);
    const [showMaxApiDialog, setShowMaxApiDialog] = useState(false);
    const [showMintMeApiDialog, setShowMintMeApiDialog] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [mintMeApiKey, setMintMeApiKey] = useState('');
    const [mintMeApiSecret, setMintMeApiSecret] = useState('');
    const [copied, setCopied] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [trendingTokens, setTrendingTokens] = useState<any[]>([]);
    const [isLoadingTokens, setIsLoadingTokens] = useState(true);

    // Fetch trending tokens from DexScreener API
    useEffect(() => {
        const fetchTrendingTokens = async () => {
            setIsLoadingTokens(true);
            try {
                // Fetch from DexScreener trending endpoint
                const response = await fetch('https://api.dexscreener.com/token-boosts/top/v1');
                const data = await response.json();
                
                if (data && data.length > 0) {
                    const tokens = data.slice(0, 12).map((item: any) => ({
                        symbol: item.symbol || item.tokenSymbol || 'Unknown',
                        name: item.name || item.tokenName || '',
                        price: item.priceUsd ? `$${parseFloat(item.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : '$0.00',
                        change: item.priceChange?.h24 ? `${item.priceChange.h24 >= 0 ? '+' : ''}${item.priceChange.h24.toFixed(2)}%` : '0%',
                        positive: item.priceChange?.h24 >= 0,
                        volume: item.volume?.h24 ? `$${(item.volume.h24 / 1000000).toFixed(1)}M` : 'N/A',
                        chain: item.chainId || 'Solana'
                    }));
                    setTrendingTokens(tokens);
                } else {
                    // Fallback data
                    setTrendingTokens([
                        { symbol: 'SOL', name: 'Solana', price: '$185.42', change: '+5.2%', positive: true, volume: '$2.1B', chain: 'Solana' },
                        { symbol: 'BTC', name: 'Bitcoin', price: '$69,420', change: '+2.3%', positive: true, volume: '$25B', chain: 'Multiple' },
                        { symbol: 'ETH', name: 'Ethereum', price: '$3,850', change: '+1.8%', positive: true, volume: '$15B', chain: 'Ethereum' },
                        { symbol: 'BNB', name: 'BNB', price: '$620', change: '-0.5%', positive: false, volume: '$1.2B', chain: 'BSC' },
                        { symbol: 'FIXERCOIN', name: 'Fixercoin', price: '$0.0000558', change: '+12%', positive: true, volume: '$50K', chain: 'Solana' },
                        { symbol: 'FXM', name: 'Fixorium', price: '$0.00001457', change: '+8.5%', positive: true, volume: '$30K', chain: 'Solana' },
                    ]);
                }
            } catch (error) {
                console.error('Failed to fetch trending tokens:', error);
                // Fallback data
                setTrendingTokens([
                    { symbol: 'SOL', name: 'Solana', price: '$185.42', change: '+5.2%', positive: true, volume: '$2.1B', chain: 'Solana' },
                    { symbol: 'BTC', name: 'Bitcoin', price: '$69,420', change: '+2.3%', positive: true, volume: '$25B', chain: 'Multiple' },
                    { symbol: 'ETH', name: 'Ethereum', price: '$3,850', change: '+1.8%', positive: true, volume: '$15B', chain: 'Ethereum' },
                ]);
            } finally {
                setIsLoadingTokens(false);
            }
        };

        fetchTrendingTokens();
        const interval = setInterval(fetchTrendingTokens, 60000);
        return () => clearInterval(interval);
    }, []);

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
            console.error('Failed to register MAX API:', error);
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
                setMintMeApiKey(data.apiKey);
                setMintMeApiSecret(data.apiSecret);
                setShowMintMeApiDialog(true);
            }
        } catch (error) {
            console.error('Failed to register MintMe API:', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const totalCapital = "$12,345,678";
    const capitalChange = "+8.2%";

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

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="https://exchange.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                Exchange
                            </a>
                            <button onClick={() => setShowAggregatorDialog(true)} className="text-sm text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                Aggregator
                            </button>
                            <a href="https://wallet.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                Wallet
                            </a>
                        </nav>

                        {/* Connect Button */}
                        <div className="flex items-center gap-3">
                            <button onClick={onConnect} className="hidden md:block px-4 py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-[#e8d58a] transition uppercase tracking-wider">
                                {isLoggedIn ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}` : 'CONNECT WALLET'}
                            </button>
                            
                            {/* Mobile Menu Button */}
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-400 hover:text-primary">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Dropdown Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-border">
                            <div className="flex flex-col gap-3">
                                <a href="https://exchange.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-primary transition uppercase tracking-wider py-2">
                                    Exchange
                                </a>
                                <button onClick={() => { setShowAggregatorDialog(true); setIsMobileMenuOpen(false); }} className="text-left text-sm text-gray-400 hover:text-primary transition uppercase tracking-wider py-2">
                                    Aggregator
                                </button>
                                <a href="https://wallet.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-primary transition uppercase tracking-wider py-2">
                                    Wallet
                                </a>
                                <button onClick={onConnect} className="px-4 py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-[#e8d58a] transition uppercase tracking-wider">
                                    {isLoggedIn ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}` : 'CONNECT WALLET'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <div className="pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Hero Section with Capital */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-6">
                            <span className="text-xs text-primary uppercase tracking-wider">Total Value Locked</span>
                        </div>
                        <div className="text-5xl md:text-7xl font-bold text-white mb-3">{totalCapital}</div>
                        <div className="text-green-400 text-sm mb-6">{capitalChange} (24h)</div>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            The lowest fees in DeFi — only <span className="text-primary font-bold">0.01%</span>
                        </p>
                    </div>

                    {/* API Key Buttons Row */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <button
                            onClick={handleRegisterMaxApi}
                            className="px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-[#e8d58a] transition uppercase tracking-wider"
                        >
                            GET MAX API KEY
                        </button>
                        <button
                            onClick={handleRegisterMintMeApi}
                            className="px-8 py-3 border border-primary text-primary font-bold rounded-xl hover:bg-primary/10 transition uppercase tracking-wider"
                        >
                            GET MINTME API KEY
                        </button>
                    </div>

                    {/* Trending Tokens Section */}
                    <div className="mb-12">
                        <h2 className="text-lg font-semibold text-primary mb-4 uppercase tracking-wider">Trending Tokens Across All Chains</h2>
                        {isLoadingTokens ? (
                            <div className="text-center py-8 text-gray-400">Loading trending tokens...</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {trendingTokens.map((token, idx) => (
                                    <div key={idx} className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <div className="font-bold text-white text-lg uppercase">{token.symbol}</div>
                                                <div className="text-xs text-gray-500">{token.name}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white font-semibold">{token.price}</div>
                                                <div className={`text-xs ${token.positive ? 'text-green-400' : 'text-red-400'}`}>
                                                    {token.change}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                                            <span className="text-xs text-gray-500">{token.chain}</span>
                                            <span className="text-xs text-gray-500">Vol: {token.volume}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Networks Section */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-primary mb-4 uppercase tracking-wider">Supported Networks</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {['Solana', 'MintMe', 'Ethereum', 'BNB Chain', 'Polygon'].map((network, idx) => (
                                <div key={idx} className="p-3 bg-darker rounded-lg text-center">
                                    <div className="font-semibold text-white text-sm uppercase">{network}</div>
                                    <div className="text-xs text-green-400 mt-1">0.01% Fee</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - No Logo */}
            <footer className="bg-darker border-t border-border py-6 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-xs text-gray-500 uppercase tracking-wider">
                        © 2026 FIXORIUM. All rights reserved.
                    </div>
                </div>
            </footer>

            {/* Aggregator Dialog */}
            {showAggregatorDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-primary uppercase tracking-wider">MAX Aggregator</h2>
                            <button onClick={() => setShowAggregatorDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="text-center py-6">
                            <div className="text-6xl mb-4 animate-bounce">⚡</div>
                            <h3 className="text-xl font-bold text-white mb-2 uppercase">Solana DEX Aggregator</h3>
                            <p className="text-gray-400 text-sm mb-6">0.01% fee • Multi-DEX routing • Best prices</p>
                            <button
                                onClick={() => { handleRegisterMaxApi(); setShowAggregatorDialog(false); }}
                                className="w-full px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-[#e8d58a] transition uppercase tracking-wider"
                            >
                                GET API KEY
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
                            <h2 className="text-xl font-bold text-primary uppercase tracking-wider">MAX API Key</h2>
                            <button onClick={() => setShowMaxApiDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                <p className="text-xs text-yellow-400 uppercase">⚠️ Save these credentials securely!</p>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">API Key</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-xs text-primary break-all">{apiKey}</code>
                                    <button onClick={() => copyToClipboard(apiKey)} className="px-3 py-2 bg-darker border border-border rounded-lg text-xs text-gray-400 hover:text-white">
                                        {copied ? '✓' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">API Secret</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-xs text-yellow-400 break-all">{apiSecret}</code>
                                    <button onClick={() => copyToClipboard(apiSecret)} className="px-3 py-2 bg-darker border border-border rounded-lg text-xs text-gray-400 hover:text-white">
                                        Copy
                                    </button>
                                </div>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                <p className="text-xs text-blue-400 uppercase">Quick Integration:</p>
                                <code className="text-xs text-gray-300 block mt-1 break-all">
                                    curl -X GET "https://fixorium.com.pk/max/v1/quote?inputMint=So111...&outputMint=EPjFW...&amount=1000000" -H "X-API-Key: {apiKey.slice(0, 20)}..."
                                </code>
                            </div>
                            <button onClick={() => setShowMaxApiDialog(false)} className="w-full py-2 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition uppercase tracking-wider">
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
                            <h2 className="text-xl font-bold text-primary uppercase tracking-wider">MintMe API Key</h2>
                            <button onClick={() => setShowMintMeApiDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                <p className="text-xs text-yellow-400 uppercase">⚠️ Save these credentials securely!</p>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">API Key</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-xs text-primary break-all">{mintMeApiKey}</code>
                                    <button onClick={() => copyToClipboard(mintMeApiKey)} className="px-3 py-2 bg-darker border border-border rounded-lg text-xs text-gray-400 hover:text-white">
                                        {copied ? '✓' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">API Secret</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-xs text-yellow-400 break-all">{mintMeApiSecret}</code>
                                    <button onClick={() => copyToClipboard(mintMeApiSecret)} className="px-3 py-2 bg-darker border border-border rounded-lg text-xs text-gray-400 hover:text-white">
                                        Copy
                                    </button>
                                </div>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                <p className="text-xs text-green-400 uppercase">MintMe DEX Router</p>
                                <div className="mt-2">
                                    <code className="text-xs text-gray-300 block break-all">
                                        Contract: 0x091da08c5bf888252ed1ab3e44246cbf72d63307
                                    </code>
                                </div>
                            </div>
                            <button onClick={() => setShowMintMeApiDialog(false)} className="w-full py-2 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition uppercase tracking-wider">
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
