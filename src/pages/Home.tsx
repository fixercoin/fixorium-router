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
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    
    const [mintMeEmail, setMintMeEmail] = useState('');
    const [mintMePassword, setMintMePassword] = useState('');
    const [mintMeConfirmPassword, setMintMeConfirmPassword] = useState('');
    const [mintMeRegisterError, setMintMeRegisterError] = useState('');
    const [isMintMeRegistering, setIsMintMeRegistering] = useState(false);

    const MINTME_CONTRACT = "0x33C60168f237146647891BAae4ca4DF8Ac58D03E";

    useEffect(() => {
        const userEmail = localStorage.getItem('user_email');
        const userRegistered = localStorage.getItem('user_registered');
        if (userEmail && userRegistered === 'true') {
            setRegisteredEmail(userEmail);
            setIsRegistered(true);
        }
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

    // Inject Cryptorank widget script only once
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cryptorank.io/widget/marquee.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            // Cleanup
            const widget = document.getElementById('cr-widget-marquee');
            if (widget) widget.remove();
        };
    }, []);

    return (
        <div className="min-h-screen bg-dark">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 bg-darker/95 backdrop-blur-md border-b border-border z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-12 md:h-14">
                        <div className="text-[10px] md:text-xs font-semibold text-primary uppercase tracking-wider">
                            DEFI PLATFORM
                        </div>

                        <div className="relative">
                            <button onClick={() => setShowUserMenu(!showUserMenu)} className="text-gray-400 hover:text-primary p-2">
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
                                    <div className="py-1">
                                        <button
                                            onClick={() => { setShowMaxRegisterDialog(true); setShowUserMenu(false); }}
                                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-primary/10 hover:text-primary transition uppercase tracking-wider"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            MAX API KEY
                                        </button>
                                        <button
                                            onClick={() => { setShowMintMeRegisterDialog(true); setShowUserMenu(false); }}
                                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-primary/10 hover:text-primary transition uppercase tracking-wider"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                            </svg>
                                            MINTME API KEY
                                        </button>
                                        <a href="https://exchange.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-primary/10 hover:text-primary transition uppercase tracking-wider">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m3 4H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                            EXCHANGE
                                        </a>
                                        <a href="https://wallet.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-primary/10 hover:text-primary transition uppercase tracking-wider">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M6 14h12M9 18h6M12 6v12" />
                                            </svg>
                                            WALLET
                                        </a>
                                        
                                        {isRegistered ? (
                                            <>
                                                <div className="px-4 py-2 text-[10px] text-gray-500 border-t border-border mt-1 pt-2 flex items-center gap-2">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    {registeredEmail}
                                                </div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition uppercase tracking-wider"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    LOGOUT
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => { setShowMaxRegisterDialog(true); setShowUserMenu(false); }}
                                                className="flex items-center gap-3 w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-primary/10 hover:text-primary transition uppercase tracking-wider border-t border-border mt-1 pt-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                </svg>
                                                REGISTER
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ONLY Cryptorank Widget - No other marquee */}
            <div className="fixed top-12 md:top-14 left-0 right-0 z-40 w-full overflow-hidden">
                <div 
                    id="cr-widget-marquee" 
                    data-coins="bitcoin,ethereum,bitcoin-ai,ripple,bnb,dogecoin,tether"
                    data-theme="dark"
                    data-show-symbol="false"
                    data-show-icon="true"
                    data-show-period-change="false"
                    data-period-change="24H"
                    data-api-url="https://api.cryptorank.io/v0"
                >
                    <a href="https://cryptorank.io" className="text-gray-500 text-xs hidden">Coins by Cryptorank</a>
                </div>
            </div>

            {/* Main Content */}
            <div className="min-h-screen flex flex-col items-center justify-center pt-20 md:pt-24 pb-12">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute w-[280px] h-[280px] md:w-[450px] md:h-[450px] rounded-full border-2 border-primary/30 animate-pulse-slow"></div>
                            <div className="absolute w-[260px] h-[260px] md:w-[420px] md:h-[420px] rounded-full border border-primary/20 animate-spin-slow"></div>
                            <div className="absolute w-[240px] h-[240px] md:w-[390px] md:h-[390px] rounded-full bg-gradient-to-r from-primary/10 via-yellow-500/10 to-primary/10 animate-ping-slow"></div>
                            
                            <div className="relative w-[180px] h-[180px] md:w-[280px] md:h-[280px] rounded-full bg-gradient-to-br from-primary/30 via-yellow-500/20 to-primary/10 backdrop-blur-sm flex items-center justify-center shadow-2xl shadow-primary/30 overflow-hidden">
                                <img 
                                    src="https://i.postimg.cc/VNCccDTn/connectpie-favicon-t.png" 
                                    alt="Fixorium Logo" 
                                    className="w-32 h-32 md:w-48 md:h-48 object-contain"
                                />
                            </div>
                        </div>
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
                                    <code className="text-[10px] text-primary break-all text-right ml-2">EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM</code>
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
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.05); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
                @keyframes ping-slow {
                    0% { transform: scale(0.95); opacity: 0.3; }
                    50% { transform: scale(1.05); opacity: 0.1; }
                    100% { transform: scale(0.95); opacity: 0.3; }
                }
                .animate-ping-slow {
                    animation: ping-slow 3s ease-in-out infinite;
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
