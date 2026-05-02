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
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [mintMeApiKey, setMintMeApiKey] = useState('');
    const [mintMeApiSecret, setMintMeApiSecret] = useState('');
    const [copied, setCopied] = useState(false);
    const [marqueePrices, setMarqueePrices] = useState<any[]>([]);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    
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

    // MintMe contract address
    const MINTME_CONTRACT = "0x33C60168f237146647891BAae4ca4DF8Ac58D03E";

    // Check registration status on load
    useEffect(() => {
        const userEmail = localStorage.getItem('user_email');
        const userRegistered = localStorage.getItem('user_registered');
        if (userEmail && userRegistered === 'true') {
            setRegisteredEmail(userEmail);
            setIsRegistered(true);
        }
    }, []);

    // Fetch live prices for marquee from DexScreener
    useEffect(() => {
        const fetchMarqueePrices = async () => {
            const symbols = [
                { name: 'BTC', mint: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
                { name: 'ETH', mint: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
                { name: 'BNB', mint: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c' },
                { name: 'SOL', mint: 'So11111111111111111111111111111111111111112' },
                { name: 'FIXERCOIN', mint: 'H4qKn8FMFha8jJuj8xMryMqRhH3h7GjLuxw7TVixpump' },
                { name: 'LOCKER', mint: 'EN1nYrW6375zMPUkpkGyGSEXW8WmAqYu4yhf6xnGpump' },
                { name: 'PINGX', mint: '7KS4DgKHmgSWYC4uGnSozLUon2bDEj6WKhRNSosmpump' },
                { name: 'FXM', mint: '7Fnx57ztmhdpL1uAGmUY1ziwPG2UDKmG6poB4ibjpump' },
            ];
            const prices = [];
            
            for (const symbol of symbols) {
                try {
                    const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${symbol.mint}`);
                    const data = await response.json();
                    if (data.pairs && data.pairs[0]) {
                        const price = parseFloat(data.pairs[0].priceUsd);
                        prices.push({
                            symbol: symbol.name,
                            price: price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
                        });
                    } else {
                        prices.push({ symbol: symbol.name, price: '0.00' });
                    }
                } catch (e) {
                    prices.push({ symbol: symbol.name, price: '0.00' });
                }
            }
            setMarqueePrices(prices);
        };

        fetchMarqueePrices();
        const interval = setInterval(fetchMarqueePrices, 30000);
        return () => clearInterval(interval);
    }, []);

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
                localStorage.setItem('user_email', email);
                localStorage.setItem('user_registered', 'true');
                setRegisteredEmail(email);
                setIsRegistered(true);
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

    const handleLogout = () => {
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_registered');
        setIsRegistered(false);
        setRegisteredEmail('');
        setShowUserMenu(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Double the marquee items for seamless scroll
    const marqueeItems = [...marqueePrices, ...marqueePrices];

    return (
        <div className="min-h-screen bg-dark">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 bg-darker/95 backdrop-blur-md border-b border-border z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 md:h-16">
                        {/* Brand Name */}
                        <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <span className="font-bold text-lg md:text-2xl tracking-wider text-primary">FIXORIUM</span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6">
                            <a href="https://exchange.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                EXCHANGE
                            </a>
                            <button onClick={() => setShowAggregatorDialog(true)} className="text-xs text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                AGGREGATOR
                            </button>
                            <a href="https://wallet.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                WALLET
                            </a>
                        </nav>

                        {/* 3-Line Dropdown Menu */}
                        <div className="relative">
                            <button onClick={() => setShowUserMenu(!showUserMenu)} className="text-gray-400 hover:text-primary">
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                                    <div className="py-1">
                                        {/* Mobile Navigation Links (visible only on mobile) */}
                                        <div className="md:hidden border-b border-border pb-1 mb-1">
                                            <a href="https://exchange.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="block w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-primary/10 hover:text-primary transition uppercase tracking-wider">
                                                EXCHANGE
                                            </a>
                                            <a href="https://wallet.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="block w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-primary/10 hover:text-primary transition uppercase tracking-wider">
                                                WALLET
                                            </a>
                                        </div>
                                        
                                        {/* API Key Options */}
                                        <button
                                            onClick={() => { setShowMaxRegisterDialog(true); setShowUserMenu(false); }}
                                            className="block w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-primary/10 hover:text-primary transition uppercase tracking-wider"
                                        >
                                            MAX API KEY
                                        </button>
                                        <button
                                            onClick={() => { setShowMintMeRegisterDialog(true); setShowUserMenu(false); }}
                                            className="block w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-primary/10 hover:text-primary transition uppercase tracking-wider"
                                        >
                                            MINTME API KEY
                                        </button>
                                        
                                        {/* User Status / Logout */}
                                        {isRegistered ? (
                                            <>
                                                <div className="px-4 py-2 text-[10px] text-gray-500 border-t border-border mt-1 pt-2">
                                                    {registeredEmail}
                                                </div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition uppercase tracking-wider"
                                                >
                                                    LOGOUT
                                                </button>
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Marquee - No Background, No Border */}
            <div className="fixed top-14 md:top-16 left-0 right-0 overflow-hidden whitespace-nowrap py-1 z-40">
                <div className="inline-block animate-marquee whitespace-nowrap">
                    {marqueeItems.map((item, idx) => (
                        <span key={idx} className="mx-2 inline-flex items-center gap-1">
                            <span className="text-white text-[9px] md:text-xs uppercase tracking-wider font-semibold">{item.symbol}</span>
                            <span className="text-gray-400 text-[9px] md:text-xs">${typeof item.price === 'number' ? item.price.toLocaleString() : item.price}</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-24 md:pt-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    {/* Animated Circle Logo with FIXORIUM Text */}
                    <div className="text-center mb-8 md:mb-12">
                        <div className="relative inline-flex items-center justify-center mb-6">
                            {/* Animated Circle */}
                            <div className="absolute w-32 h-32 md:w-48 md:h-48 rounded-full border-2 border-primary/30 animate-pulse-slow"></div>
                            <div className="absolute w-28 h-28 md:w-40 md:h-40 rounded-full border border-primary/20 animate-spin-slow"></div>
                            <div className="absolute w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/5 animate-ping-slow"></div>
                            
                            {/* Logo Circle */}
                            <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <span className="text-3xl md:text-5xl font-bold text-primary">M</span>
                            </div>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-bold tracking-wider bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
                            FIXORIUM
                        </h1>
                        <div className="flex items-center justify-center gap-2 mt-3">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <p className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider">MULTI-CHAIN DEX AGGREGATOR | 0.01% FEE</p>
                        </div>
                    </div>

                    {/* Buttons Section */}
                    <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
                        <button
                            onClick={() => setShowMaxRegisterDialog(true)}
                            className="w-full py-3 bg-primary text-black text-xs md:text-sm font-bold rounded-xl hover:bg-[#e8d58a] transition uppercase tracking-wider"
                        >
                            GET MAX API KEY
                        </button>
                        <button
                            onClick={() => setShowMintMeRegisterDialog(true)}
                            className="w-full py-3 border border-primary text-primary text-xs md:text-sm font-bold rounded-xl hover:bg-primary/10 transition uppercase tracking-wider"
                        >
                            GET MINTME API KEY
                        </button>
                        <button
                            onClick={() => setShowAggregatorDialog(true)}
                            className="w-full py-3 bg-primary/10 border border-primary/50 text-primary text-xs md:text-sm font-bold rounded-xl hover:bg-primary/20 transition uppercase tracking-wider"
                        >
                            AGGREGATOR INFO
                        </button>
                    </div>
                </div>
            </div>

            {/* MAX Aggregator Dialog */}
            {showAggregatorDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-primary uppercase tracking-wider">MAX AGGREGATOR</h2>
                            <button onClick={() => setShowAggregatorDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="text-center py-4">
                            <div className="text-5xl mb-3 animate-bounce">⚡</div>
                            <h3 className="text-base font-bold text-white mb-2 uppercase">SOLANA DEX AGGREGATOR</h3>
                            <p className="text-gray-400 text-[11px] mb-4 uppercase">0.01% FEE • MULTI-DEX ROUTING • BEST PRICES</p>
                            <div className="space-y-2 text-left mb-4">
                                <div className="flex justify-between items-center p-2 bg-darker rounded-lg">
                                    <span className="text-[10px] text-gray-400">PROGRAM ID</span>
                                    <code className="text-[10px] text-primary">EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM</code>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-darker rounded-lg">
                                    <span className="text-[10px] text-gray-400">BASE URL</span>
                                    <code className="text-[10px] text-primary">https://fixorium.com.pk/max/v1</code>
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowAggregatorDialog(false); setShowMaxRegisterDialog(true); }}
                                className="w-full py-2 bg-primary text-black text-xs font-bold rounded-xl hover:bg-[#e8d58a] transition uppercase tracking-wider"
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
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-primary uppercase tracking-wider">REGISTER FOR MAX API</h2>
                            <button onClick={() => setShowMaxRegisterDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-3">
                            {registerError && (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2">
                                    <p className="text-[10px] text-red-400">{registerError}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-[10px] text-gray-400 uppercase mb-1">EMAIL</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full p-2 bg-darker border border-border rounded-lg text-white text-xs focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 uppercase mb-1">PASSWORD</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="CREATE PASSWORD"
                                    className="w-full p-2 bg-darker border border-border rounded-lg text-white text-xs focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 uppercase mb-1">CONFIRM PASSWORD</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="CONFIRM PASSWORD"
                                    className="w-full p-2 bg-darker border border-border rounded-lg text-white text-xs focus:border-primary outline-none"
                                />
                            </div>
                            <button
                                onClick={handleMaxRegister}
                                disabled={isRegistering}
                                className="w-full py-2 bg-primary text-black text-xs font-bold rounded-xl hover:bg-[#e8d58a] transition uppercase tracking-wider disabled:opacity-50"
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
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-primary uppercase tracking-wider">MAX API KEY</h2>
                            <button onClick={() => setShowMaxApiDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
                                <p className="text-[10px] text-yellow-400 uppercase">⚠️ SAVE THESE CREDENTIALS SECURELY!</p>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 uppercase mb-1">API KEY</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-[10px] text-primary break-all">{apiKey}</code>
                                    <button onClick={() => copyToClipboard(apiKey)} className="px-2 py-1.5 bg-darker border border-border rounded-lg text-[10px] text-gray-400 hover:text-white">
                                        {copied ? '✓' : 'COPY'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 uppercase mb-1">API SECRET</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-[10px] text-yellow-400 break-all">{apiSecret}</code>
                                    <button onClick={() => copyToClipboard(apiSecret)} className="px-2 py-1.5 bg-darker border border-border rounded-lg text-[10px] text-gray-400 hover:text-white">
                                        COPY
                                    </button>
                                </div>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2">
                                <p className="text-[9px] text-blue-400 uppercase">QUICK INTEGRATION:</p>
                                <code className="text-[9px] text-gray-300 block mt-1 break-all">
                                    curl -X GET "https://fixorium.com.pk/max/v1/quote?inputMint=So111...&outputMint=EPjFW...&amount=1000000" -H "X-API-Key: {apiKey.slice(0, 15)}..."
                                </code>
                            </div>
                            <button onClick={() => setShowMaxApiDialog(false)} className="w-full py-2 bg-primary text-black text-xs font-semibold rounded-lg hover:bg-[#e8d58a] transition uppercase tracking-wider">
                                DONE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MintMe Registration Dialog */}
            {showMintMeRegisterDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-primary uppercase tracking-wider">REGISTER FOR MINTME API</h2>
                            <button onClick={() => setShowMintMeRegisterDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-3">
                            {mintMeRegisterError && (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2">
                                    <p className="text-[10px] text-red-400">{mintMeRegisterError}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-[10px] text-gray-400 uppercase mb-1">EMAIL</label>
                                <input
                                    type="email"
                                    value={mintMeEmail}
                                    onChange={(e) => setMintMeEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full p-2 bg-darker border border-border rounded-lg text-white text-xs focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 uppercase mb-1">PASSWORD</label>
                                <input
                                    type="password"
                                    value={mintMePassword}
                                    onChange={(e) => setMintMePassword(e.target.value)}
                                    placeholder="CREATE PASSWORD"
                                    className="w-full p-2 bg-darker border border-border rounded-lg text-white text-xs focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 uppercase mb-1">CONFIRM PASSWORD</label>
                                <input
                                    type="password"
                                    value={mintMeConfirmPassword}
                                    onChange={(e) => setMintMeConfirmPassword(e.target.value)}
                                    placeholder="CONFIRM PASSWORD"
                                    className="w-full p-2 bg-darker border border-border rounded-lg text-white text-xs focus:border-primary outline-none"
                                />
                            </div>
                            <button
                                onClick={handleMintMeRegister}
                                disabled={isMintMeRegistering}
                                className="w-full py-2 bg-primary text-black text-xs font-bold rounded-xl hover:bg-[#e8d58a] transition uppercase tracking-wider disabled:opacity-50"
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
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-primary uppercase tracking-wider">MINTME API KEY</h2>
                            <button onClick={() => setShowMintMeApiDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
                                <p className="text-[10px] text-yellow-400 uppercase">⚠️ SAVE THESE CREDENTIALS SECURELY!</p>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 uppercase mb-1">API KEY</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-[10px] text-primary break-all">{mintMeApiKey}</code>
                                    <button onClick={() => copyToClipboard(mintMeApiKey)} className="px-2 py-1.5 bg-darker border border-border rounded-lg text-[10px] text-gray-400 hover:text-white">
                                        {copied ? '✓' : 'COPY'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 uppercase mb-1">API SECRET</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2 bg-darker rounded-lg text-[10px] text-yellow-400 break-all">{mintMeApiSecret}</code>
                                    <button onClick={() => copyToClipboard(mintMeApiSecret)} className="px-2 py-1.5 bg-darker border border-border rounded-lg text-[10px] text-gray-400 hover:text-white">
                                        COPY
                                    </button>
                                </div>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2">
                                <p className="text-[9px] text-green-400 uppercase">MINTME DEX ROUTER</p>
                                <code className="text-[9px] text-gray-300 block mt-1 break-all">
                                    CONTRACT: {MINTME_CONTRACT}
                                </code>
                            </div>
                            <button onClick={() => setShowMintMeApiDialog(false)} className="w-full py-2 bg-primary text-black text-xs font-semibold rounded-lg hover:bg-[#e8d58a] transition uppercase tracking-wider">
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
                    animation: marquee 25s linear infinite;
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.05); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
                @keyframes ping-slow {
                    0% { transform: scale(0.95); opacity: 0.5; }
                    50% { transform: scale(1.05); opacity: 0.2; }
                    100% { transform: scale(0.95); opacity: 0.5; }
                }
                .animate-ping-slow {
                    animation: ping-slow 2s ease-in-out infinite;
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce {
                    animation: bounce 1s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default Home;
