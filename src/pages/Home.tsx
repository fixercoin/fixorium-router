import React, { useState, useEffect } from 'react';

interface HomeProps {
    setCurrentPage: (page: 'dashboard' | 'products') => void;
    onConnect: () => void;
    isLoggedIn?: boolean;
    walletAddress?: string;
    onLogout?: () => void;
}

const Home: React.FC<HomeProps> = ({ setCurrentPage, onConnect, isLoggedIn = false, walletAddress = '', onLogout }) => {
    const [showAggregatorDialog, setShowAggregatorDialog] = useState(false);
    const [showMaxRegisterDialog, setShowMaxRegisterDialog] = useState(false);
    const [showMintMeRegisterDialog, setShowMintMeRegisterDialog] = useState(false);
    const [showMaxApiDialog, setShowMaxApiDialog] = useState(false);
    const [showMintMeApiDialog, setShowMintMeApiDialog] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [mintMeApiKey, setMintMeApiKey] = useState('');
    const [mintMeApiSecret, setMintMeApiSecret] = useState('');
    const [copied, setCopied] = useState(false);
    const [trendingTokens, setTrendingTokens] = useState<any[]>([]);
    const [isLoadingTokens, setIsLoadingTokens] = useState(true);
    const [swapAmount, setSwapAmount] = useState('');
    const [swapFromToken, setSwapFromToken] = useState('SOL');
    const [swapToToken, setSwapToToken] = useState('USDC');
    
    // Login form states
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
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

    // API endpoints to display
    const apiEndpoints = [
        { method: 'GET', endpoint: '/max/v1/quote', description: 'GET SWAP QUOTE' },
        { method: 'POST', endpoint: '/max/v1/swap', description: 'EXECUTE SWAP' },
        { method: 'POST', endpoint: '/max/v1/limit', description: 'CREATE LIMIT ORDER' },
        { method: 'POST', endpoint: '/max/v1/dca', description: 'CREATE DCA STRATEGY' },
        { method: 'GET', endpoint: '/max/v1/keys', description: 'LIST API KEYS' },
    ];

    // Fetch trending tokens with live prices
    useEffect(() => {
        const fetchTrendingTokens = async () => {
            setIsLoadingTokens(true);
            try {
                const symbols = ['SOL', 'BTC', 'ETH', 'BNB', 'MATIC', 'USDC', 'USDT', 'FIXERCOIN', 'FXM'];
                const tokens = [];
                
                for (const symbol of symbols) {
                    try {
                        const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${symbol}`);
                        const data = await response.json();
                        if (data.pairs && data.pairs[0]) {
                            const price = parseFloat(data.pairs[0].priceUsd);
                            const change = parseFloat(data.pairs[0].priceChange?.h24 || 0);
                            tokens.push({
                                symbol: symbol,
                                price: `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
                                change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
                                positive: change >= 0,
                                volume: data.pairs[0].volume?.h24 ? `$${(data.pairs[0].volume.h24 / 1000000).toFixed(1)}M` : 'N/A',
                            });
                        }
                    } catch (e) {
                        console.log(`Failed to fetch ${symbol}`);
                    }
                    await new Promise(r => setTimeout(r, 100));
                }
                
                setTrendingTokens(tokens.length > 0 ? tokens : [
                    { symbol: 'SOL', price: '$185.42', change: '+5.2%', positive: true, volume: '$2.1B' },
                    { symbol: 'BTC', price: '$69,420', change: '+2.3%', positive: true, volume: '$25B' },
                    { symbol: 'ETH', price: '$3,850', change: '+1.8%', positive: true, volume: '$15B' },
                ]);
            } catch (error) {
                console.error('Failed to fetch trending tokens:', error);
            } finally {
                setIsLoadingTokens(false);
            }
        };

        fetchTrendingTokens();
        const interval = setInterval(fetchTrendingTokens, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleLogin = async () => {
        if (!loginEmail || !loginPassword) {
            setLoginError('EMAIL AND PASSWORD REQUIRED');
            return;
        }
        
        setIsLoggingIn(true);
        setLoginError('');
        
        try {
            const response = await fetch('/api/max/v1/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('user_email', loginEmail);
                localStorage.setItem('user_logged_in', 'true');
                setShowLoginDialog(false);
                setLoginEmail('');
                setLoginPassword('');
                window.location.reload();
            } else {
                setLoginError(data.error || 'LOGIN FAILED');
            }
        } catch (error) {
            setLoginError('NETWORK ERROR');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_logged_in');
        if (onLogout) onLogout();
        setShowUserMenu(false);
        window.location.reload();
    };

    const handleMaxRegister = async () => {
        if (!email || !password || password !== confirmPassword) {
            setRegisterError('PLEASE FILL ALL FIELDS CORRECTLY');
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
                setRegisterError(data.error || 'REGISTRATION FAILED');
            }
        } catch (error) {
            setRegisterError('NETWORK ERROR');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleMintMeRegister = async () => {
        if (!mintMeEmail || !mintMePassword || mintMePassword !== mintMeConfirmPassword) {
            setMintMeRegisterError('PLEASE FILL ALL FIELDS CORRECTLY');
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
                setMintMeRegisterError(data.error || 'REGISTRATION FAILED');
            }
        } catch (error) {
            setMintMeRegisterError('NETWORK ERROR');
        } finally {
            setIsMintMeRegistering(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isUserLoggedIn = localStorage.getItem('user_logged_in') === 'true';

    return (
        <div className="min-h-screen bg-dark">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 bg-darker/95 backdrop-blur-md border-b border-border z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Brand Name */}
                        <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <span className="font-bold text-2xl tracking-wider text-primary">FIXORIUM</span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="https://exchange.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                EXCHANGE
                            </a>
                            <button onClick={() => setShowAggregatorDialog(true)} className="text-sm text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                AGGREGATOR
                            </button>
                            <a href="https://wallet.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                WALLET
                            </a>
                        </nav>

                        {/* 3-Line Dropdown Menu */}
                        <div className="relative">
                            <button onClick={() => setShowUserMenu(!showUserMenu)} className="text-gray-400 hover:text-primary">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
                                    <div className="py-1">
                                        <button
                                            onClick={() => { setShowMaxRegisterDialog(true); setShowUserMenu(false); }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-primary/10 hover:text-primary transition uppercase tracking-wider"
                                        >
                                            GET MAX API KEY
                                        </button>
                                        <button
                                            onClick={() => { setShowMintMeRegisterDialog(true); setShowUserMenu(false); }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-primary/10 hover:text-primary transition uppercase tracking-wider"
                                        >
                                            GET MINTME API KEY
                                        </button>
                                        {isUserLoggedIn ? (
                                            <>
                                                <div className="px-4 py-2 text-xs text-gray-500 border-t border-border mt-1 pt-2">
                                                    {localStorage.getItem('user_email')}
                                                </div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition uppercase tracking-wider"
                                                >
                                                    LOGOUT
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => { setShowLoginDialog(true); setShowUserMenu(false); }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-primary/10 hover:text-primary transition uppercase tracking-wider"
                                            >
                                                LOGIN
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Marquee - White Text */}
            <div className="fixed top-16 left-0 right-0 bg-primary/10 border-y border-primary/30 overflow-hidden whitespace-nowrap py-1 z-40">
                <div className="inline-block animate-marquee whitespace-nowrap">
                    <span className="mx-4 text-white text-xs uppercase tracking-wider">⚡ FIXORIUM AGGREGATOR — 0.01% FEE — FASTEST SOLANA DEX ROUTER ⚡</span>
                    <span className="mx-4 text-white text-xs uppercase tracking-wider">⚡ FIXORIUM AGGREGATOR — 0.01% FEE — FASTEST SOLANA DEX ROUTER ⚡</span>
                    <span className="mx-4 text-white text-xs uppercase tracking-wider">⚡ FIXORIUM AGGREGATOR — 0.01% FEE — FASTEST SOLANA DEX ROUTER ⚡</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Hero Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl md:text-6xl font-bold tracking-wider bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent">
                            FIXORIUM
                        </h1>
                        <p className="text-gray-400 text-sm mt-2 uppercase tracking-wider">MULTI-CHAIN DEX AGGREGATOR | 0.01% FEE</p>
                    </div>

                    {/* 3 Cards - No Gap */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                        {/* Card 1 - Trending Tokens */}
                        <div className="bg-card border border-border p-5">
                            <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider text-center">TRENDING TOKENS</h3>
                            {isLoadingTokens ? (
                                <div className="text-center py-4 text-gray-400 text-xs">LOADING...</div>
                            ) : (
                                <div className="space-y-2">
                                    {trendingTokens.map((token, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-darker rounded-lg">
                                            <div>
                                                <div className="font-bold text-white text-xs uppercase">{token.symbol}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white text-xs font-semibold">{token.price}</div>
                                                <div className={`text-[10px] ${token.positive ? 'text-green-400' : 'text-red-400'}`}>
                                                    {token.change}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Card 2 - MAX API Endpoints */}
                        <div className="bg-card border border-border p-5">
                            <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider text-center">MAX API ENDPOINTS</h3>
                            <div className="space-y-2">
                                {apiEndpoints.map((api, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-darker rounded-lg">
                                        <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${api.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {api.method}
                                        </span>
                                        <span className="text-[10px] text-gray-300 font-mono">{api.endpoint}</span>
                                        <span className="text-[8px] text-gray-500">{api.description}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowMaxRegisterDialog(true)}
                                className="w-full mt-4 py-2 bg-primary text-black text-xs font-bold rounded-lg hover:bg-[#e8d58a] transition uppercase tracking-wider"
                            >
                                GET API KEY
                            </button>
                        </div>

                        {/* Card 3 - Swap Form */}
                        <div className="bg-card border border-border p-5">
                            <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider text-center">SWAP TOKENS</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] text-gray-400 uppercase mb-1">FROM</label>
                                    <select
                                        value={swapFromToken}
                                        onChange={(e) => setSwapFromToken(e.target.value)}
                                        className="w-full p-2 bg-darker border border-border rounded-lg text-white text-xs"
                                    >
                                        <option value="SOL">SOL</option>
                                        <option value="USDC">USDC</option>
                                        <option value="USDT">USDT</option>
                                        <option value="FIXERCOIN">FIXERCOIN</option>
                                        <option value="FXM">FXM</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-400 uppercase mb-1">AMOUNT</label>
                                    <input
                                        type="number"
                                        value={swapAmount}
                                        onChange={(e) => setSwapAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full p-2 bg-darker border border-border rounded-lg text-white text-xs"
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <button className="text-yellow-400 text-xs">▼</button>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-400 uppercase mb-1">TO</label>
                                    <select
                                        value={swapToToken}
                                        onChange={(e) => setSwapToToken(e.target.value)}
                                        className="w-full p-2 bg-darker border border-border rounded-lg text-white text-xs"
                                    >
                                        <option value="USDC">USDC</option>
                                        <option value="SOL">SOL</option>
                                        <option value="USDT">USDT</option>
                                        <option value="FIXERCOIN">FIXERCOIN</option>
                                        <option value="FXM">FXM</option>
                                    </select>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-gray-500">RATE: 1 {swapFromToken} ≈ $185.42</span>
                                </div>
                                <button
                                    onClick={onConnect}
                                    className="w-full py-2 bg-primary text-black text-xs font-bold rounded-lg hover:bg-[#e8d58a] transition uppercase tracking-wider"
                                >
                                    CONNECT WALLET
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - Team and Brand Name */}
            <footer className="bg-darker border-t border-border py-4 mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">FIXORIUM</span>
                        <button 
                            onClick={() => window.open('https://fixorium.com.pk/team', '_blank')}
                            className="text-[10px] text-gray-500 hover:text-primary transition uppercase tracking-wider"
                        >
                            TEAM
                        </button>
                    </div>
                </div>
            </footer>

            {/* Login Dialog */}
            {showLoginDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-primary uppercase tracking-wider">LOGIN</h2>
                            <button onClick={() => setShowLoginDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-4">
                            {loginError && (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                                    <p className="text-xs text-red-400">{loginError}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">EMAIL</label>
                                <input
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full p-3 bg-darker border border-border rounded-lg text-white focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">PASSWORD</label>
                                <input
                                    type="password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    placeholder="PASSWORD"
                                    className="w-full p-3 bg-darker border border-border rounded-lg text-white focus:border-primary outline-none"
                                />
                            </div>
                            <button
                                onClick={handleLogin}
                                disabled={isLoggingIn}
                                className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-[#e8d58a] transition uppercase tracking-wider disabled:opacity-50"
                            >
                                {isLoggingIn ? 'LOGGING IN...' : 'LOGIN'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MAX Aggregator Dialog */}
            {showAggregatorDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-primary uppercase tracking-wider">MAX AGGREGATOR</h2>
                            <button onClick={() => setShowAggregatorDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="text-center py-6">
                            <div className="text-6xl mb-4 animate-bounce">⚡</div>
                            <h3 className="text-xl font-bold text-white mb-2 uppercase">SOLANA DEX AGGREGATOR</h3>
                            <p className="text-gray-400 text-sm mb-6 uppercase">0.01% FEE • MULTI-DEX ROUTING • BEST PRICES</p>
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
                            <h2 className="text-xl font-bold text-primary uppercase tracking-wider">REGISTER FOR MAX API</h2>
                            <button onClick={() => setShowMaxRegisterDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-4">
                            {registerError && (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                                    <p className="text-xs text-red-400">{registerError}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">EMAIL</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full p-3 bg-darker border border-border rounded-lg text-white focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">PASSWORD</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="CREATE PASSWORD"
                                    className="w-full p-3 bg-darker border border-border rounded-lg text-white focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">CONFIRM PASSWORD</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="CONFIRM PASSWORD"
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
                            <h2 className="text-xl font-bold text-primary uppercase tracking-wider">MAX API KEY</h2>
                            <button onClick={() => setShowMaxApiDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                <p className="text-xs text-yellow-400 uppercase">⚠️ SAVE THESE CREDENTIALS SECURELY!</p>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">API KEY</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-xs text-primary break-all">{apiKey}</code>
                                    <button onClick={() => copyToClipboard(apiKey)} className="px-3 py-2 bg-darker border border-border rounded-lg text-xs text-gray-400 hover:text-white">
                                        {copied ? '✓' : 'COPY'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">API SECRET</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-xs text-yellow-400 break-all">{apiSecret}</code>
                                    <button onClick={() => copyToClipboard(apiSecret)} className="px-3 py-2 bg-darker border border-border rounded-lg text-xs text-gray-400 hover:text-white">
                                        COPY
                                    </button>
                                </div>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                <p className="text-xs text-blue-400 uppercase">QUICK INTEGRATION:</p>
                                <code className="text-xs text-gray-300 block mt-1 break-all">
                                    curl -X GET "https://fixorium.com.pk/max/v1/quote?inputMint=So111...&outputMint=EPjFW...&amount=1000000" -H "X-API-Key: {apiKey.slice(0, 20)}..."
                                </code>
                            </div>
                            <button onClick={() => setShowMaxApiDialog(false)} className="w-full py-2 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition uppercase tracking-wider">
                                DONE
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
                            <h2 className="text-xl font-bold text-primary uppercase tracking-wider">REGISTER FOR MINTME API</h2>
                            <button onClick={() => setShowMintMeRegisterDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-4">
                            {mintMeRegisterError && (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                                    <p className="text-xs text-red-400">{mintMeRegisterError}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">EMAIL</label>
                                <input
                                    type="email"
                                    value={mintMeEmail}
                                    onChange={(e) => setMintMeEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full p-3 bg-darker border border-border rounded-lg text-white focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">PASSWORD</label>
                                <input
                                    type="password"
                                    value={mintMePassword}
                                    onChange={(e) => setMintMePassword(e.target.value)}
                                    placeholder="CREATE PASSWORD"
                                    className="w-full p-3 bg-darker border border-border rounded-lg text-white focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">CONFIRM PASSWORD</label>
                                <input
                                    type="password"
                                    value={mintMeConfirmPassword}
                                    onChange={(e) => setMintMeConfirmPassword(e.target.value)}
                                    placeholder="CONFIRM PASSWORD"
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
                            <h2 className="text-xl font-bold text-primary uppercase tracking-wider">MINTME API KEY</h2>
                            <button onClick={() => setShowMintMeApiDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                <p className="text-xs text-yellow-400 uppercase">⚠️ SAVE THESE CREDENTIALS SECURELY!</p>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">API KEY</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-xs text-primary break-all">{mintMeApiKey}</code>
                                    <button onClick={() => copyToClipboard(mintMeApiKey)} className="px-3 py-2 bg-darker border border-border rounded-lg text-xs text-gray-400 hover:text-white">
                                        {copied ? '✓' : 'COPY'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase mb-1">API SECRET</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-xs text-yellow-400 break-all">{mintMeApiSecret}</code>
                                    <button onClick={() => copyToClipboard(mintMeApiSecret)} className="px-3 py-2 bg-darker border border-border rounded-lg text-xs text-gray-400 hover:text-white">
                                        COPY
                                    </button>
                                </div>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                <p className="text-xs text-green-400 uppercase">MINTME DEX ROUTER</p>
                                <code className="text-xs text-gray-300 block mt-1 break-all">
                                    CONTRACT: 0x33C60168f237146647891BAae4ca4DF8Ac58D03E
                                </code>
                            </div>
                            <button onClick={() => setShowMintMeApiDialog(false)} className="w-full py-2 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition uppercase tracking-wider">
                                DONE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Home;
