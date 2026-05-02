import React, { useState, useEffect } from 'react';

interface HomeProps {
    setCurrentPage: (page: 'dashboard' | 'products') => void;
    onConnect: () => void;
    isLoggedIn?: boolean;
    walletAddress?: string;
}

const Home: React.FC<HomeProps> = ({ setCurrentPage, onConnect, isLoggedIn = false, walletAddress = '' }) => {
    const [showAggregatorDialog, setShowAggregatorDialog] = useState(false);
    const [showMaxRegisterDialog, setShowMaxRegisterDialog] = useState(false);
    const [showMintMeRegisterDialog, setShowMintMeRegisterDialog] = useState(false);
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
    
    // Registration form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    
    // MintMe registration form states
    const [mintMeEmail, setMintMeEmail] = useState('');
    const [mintMePassword, setMintMePassword] = useState('');
    const [mintMeConfirmPassword, setMintMeConfirmPassword] = useState('');
    const [mintMeRegisterError, setMintMeRegisterError] = useState('');
    const [isMintMeRegistering, setIsMintMeRegistering] = useState(false);

    // Fetch trending tokens from DexScreener API
    useEffect(() => {
        const fetchTrendingTokens = async () => {
            setIsLoadingTokens(true);
            try {
                // Try multiple endpoints to get trending tokens
                let tokens = [];
                
                // Try DexScreener trending endpoint
                try {
                    const response = await fetch('https://api.dexscreener.com/token-boosts/top/v1');
                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.length > 0) {
                            tokens = data.slice(0, 12).map((item: any) => ({
                                symbol: item.symbol || item.tokenSymbol || 'Unknown',
                                name: item.name || item.tokenName || '',
                                price: item.priceUsd ? `$${parseFloat(item.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : '$0.00',
                                change: item.priceChange?.h24 ? `${item.priceChange.h24 >= 0 ? '+' : ''}${item.priceChange.h24.toFixed(2)}%` : '0%',
                                positive: item.priceChange?.h24 >= 0,
                                volume: item.volume?.h24 ? `$${(item.volume.h24 / 1000000).toFixed(1)}M` : 'N/A',
                                chain: item.chainId || 'Solana'
                            }));
                        }
                    }
                } catch (e) {
                    console.log('DexScreener endpoint failed, trying alternative');
                }
                
                // If no tokens found, use fallback with real-time prices
                if (tokens.length === 0) {
                    const symbols = ['SOL', 'BTC', 'ETH', 'BNB', 'MATIC', 'USDC', 'USDT'];
                    for (const symbol of symbols) {
                        try {
                            const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${symbol}`);
                            const data = await response.json();
                            if (data.pairs && data.pairs[0]) {
                                const price = parseFloat(data.pairs[0].priceUsd);
                                const change = parseFloat(data.pairs[0].priceChange?.h24 || 0);
                                tokens.push({
                                    symbol: symbol,
                                    name: data.pairs[0].baseToken?.name || symbol,
                                    price: `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
                                    change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
                                    positive: change >= 0,
                                    volume: data.pairs[0].volume?.h24 ? `$${(data.pairs[0].volume.h24 / 1000000).toFixed(1)}M` : 'N/A',
                                    chain: data.pairs[0].chainId || 'Solana'
                                });
                            }
                        } catch (e) {
                            console.log(`Failed to fetch ${symbol}`);
                        }
                    }
                }
                
                setTrendingTokens(tokens.length > 0 ? tokens : [
                    { symbol: 'SOL', name: 'Solana', price: '$185.42', change: '+5.2%', positive: true, volume: '$2.1B', chain: 'Solana' },
                    { symbol: 'BTC', name: 'Bitcoin', price: '$69,420', change: '+2.3%', positive: true, volume: '$25B', chain: 'Multiple' },
                    { symbol: 'ETH', name: 'Ethereum', price: '$3,850', change: '+1.8%', positive: true, volume: '$15B', chain: 'Ethereum' },
                    { symbol: 'BNB', name: 'BNB', price: '$620', change: '-0.5%', positive: false, volume: '$1.2B', chain: 'BSC' },
                ]);
            } catch (error) {
                console.error('Failed to fetch trending tokens:', error);
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

    const handleMaxRegister = async () => {
        if (!email) {
            setRegisterError('Email is required');
            return;
        }
        if (!password) {
            setRegisterError('Password is required');
            return;
        }
        if (password !== confirmPassword) {
            setRegisterError('Passwords do not match');
            return;
        }
        
        setIsRegistering(true);
        setRegisterError('');
        
        try {
            const response = await fetch('/api/max/v1/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                setApiKey(data.apiKey);
                setApiSecret(data.apiSecret);
                setShowMaxRegisterDialog(false);
                setShowMaxApiDialog(true);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } else {
                setRegisterError(data.error || 'Registration failed');
            }
        } catch (error) {
            setRegisterError('Network error. Please try again.');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleMintMeRegister = async () => {
        if (!mintMeEmail) {
            setMintMeRegisterError('Email is required');
            return;
        }
        if (!mintMePassword) {
            setMintMeRegisterError('Password is required');
            return;
        }
        if (mintMePassword !== mintMeConfirmPassword) {
            setMintMeRegisterError('Passwords do not match');
            return;
        }
        
        setIsMintMeRegistering(true);
        setMintMeRegisterError('');
        
        try {
            const response = await fetch('/api/mintme/v1/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: mintMeEmail, password: mintMePassword })
            });
            const data = await response.json();
            if (data.success) {
                setMintMeApiKey(data.apiKey);
                setMintMeApiSecret(data.apiSecret);
                setShowMintMeRegisterDialog(false);
                setShowMintMeApiDialog(true);
                setMintMeEmail('');
                setMintMePassword('');
                setMintMeConfirmPassword('');
            } else {
                setMintMeRegisterError(data.error || 'Registration failed');
            }
        } catch (error) {
            setMintMeRegisterError('Network error. Please try again.');
        } finally {
            setIsMintMeRegistering(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-dark">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 bg-darker/95 backdrop-blur-md border-b border-border z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <span className="font-bold text-2xl tracking-wider text-primary">FIXORIUM</span>
                        </div>

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

                        <div className="flex items-center gap-3">
                            <button onClick={onConnect} className="hidden md:block px-4 py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-[#e8d58a] transition uppercase tracking-wider">
                                {isLoggedIn ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}` : 'CONNECT WALLET'}
                            </button>
                            
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-400 hover:text-primary">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <div className="mb-6">
                            <span className="text-7xl md:text-8xl font-bold tracking-wider bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent">
                                FIXORIUM
                            </span>
                        </div>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                            Multi-chain DEX Aggregator | Solana • MintMe • EVM
                        </p>
                        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-6 py-3">
                            <span className="text-sm text-primary uppercase tracking-wider">The lowest fees in DeFi — only 0.01%</span>
                        </div>
                    </div>

                    {/* Exchange & Wallet Service Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <a href="https://exchange.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-primary/10 border border-primary/50 text-primary font-bold rounded-xl hover:bg-primary/20 transition uppercase tracking-wider text-center">
                            EXCHANGE
                        </a>
                        <a href="https://wallet.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-primary/10 border border-primary/50 text-primary font-bold rounded-xl hover:bg-primary/20 transition uppercase tracking-wider text-center">
                            WALLET
                        </a>
                        <button onClick={() => setShowAggregatorDialog(true)} className="px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-[#e8d58a] transition uppercase tracking-wider">
                            AGGREGATOR
                        </button>
                    </div>

                    {/* API Key Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <button
                            onClick={() => setShowMaxRegisterDialog(true)}
                            className="px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-[#e8d58a] transition uppercase tracking-wider"
                        >
                            GET MAX API KEY
                        </button>
                        <button
                            onClick={() => setShowMintMeRegisterDialog(true)}
                            className="px-8 py-3 border border-primary text-primary font-bold rounded-xl hover:bg-primary/10 transition uppercase tracking-wider"
                        >
                            GET MINTME API KEY
                        </button>
                    </div>

                    {/* Trending Tokens Section */}
                    <div className="mb-16">
                        <h2 className="text-lg font-semibold text-primary mb-4 uppercase tracking-wider text-center">Trending Tokens Across All Chains</h2>
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
                        <h2 className="text-lg font-semibold text-primary mb-4 uppercase tracking-wider text-center">Supported Networks</h2>
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

            {/* MAX Aggregator Dialog */}
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
                                onClick={() => { setShowAggregatorDialog(false); setShowMaxRegisterDialog(true); }}
                                className="w-full px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-[#e8d58a] transition uppercase tracking-wider"
                            >
                                GET API KEY
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MAX Registration Dialog */}
            {showMaxRegisterDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-primary uppercase tracking-wider">Register for MAX API</h2>
                            <button onClick={() => setShowMaxRegisterDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-4">
                            {registerError && (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                                    <p className="text-xs text-red-400">{registerError}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full p-3 bg-darker border border-border rounded-lg text-white focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create password"
                                    className="w-full p-3 bg-darker border border-border rounded-lg text-white focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm password"
                                    className="w-full p-3 bg-darker border border-border rounded-lg text-white focus:border-primary outline-none"
                                />
                            </div>
                            <button
                                onClick={handleMaxRegister}
                                disabled={isRegistering}
                                className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-[#e8d58a] transition uppercase tracking-wider disabled:opacity-50"
                            >
                                {isRegistering ? 'REGISTERING...' : 'REGISTER'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MAX API Key Display Dialog */}
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

            {/* MintMe Registration Dialog */}
            {showMintMeRegisterDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-primary uppercase tracking-wider">Register for MintMe API</h2>
                            <button onClick={() => setShowMintMeRegisterDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-4">
                            {mintMeRegisterError && (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                                    <p className="text-xs text-red-400">{mintMeRegisterError}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">Email</label>
                                <input
                                    type="email"
                                    value={mintMeEmail}
                                    onChange={(e) => setMintMeEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full p-3 bg-darker border border-border rounded-lg text-white focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">Password</label>
                                <input
                                    type="password"
                                    value={mintMePassword}
                                    onChange={(e) => setMintMePassword(e.target.value)}
                                    placeholder="Create password"
                                    className="w-full p-3 bg-darker border border-border rounded-lg text-white focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={mintMeConfirmPassword}
                                    onChange={(e) => setMintMeConfirmPassword(e.target.value)}
                                    placeholder="Confirm password"
                                    className="w-full p-3 bg-darker border border-border rounded-lg text-white focus:border-primary outline-none"
                                />
                            </div>
                            <button
                                onClick={handleMintMeRegister}
                                disabled={isMintMeRegistering}
                                className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-[#e8d58a] transition uppercase tracking-wider disabled:opacity-50"
                            >
                                {isMintMeRegistering ? 'REGISTERING...' : 'REGISTER'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MintMe API Key Display Dialog */}
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
                                <code className="text-xs text-gray-300 block mt-1 break-all">
                                    Contract: 0x33C60168f237146647891BAae4ca4DF8Ac58D03E
                                </code>
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
