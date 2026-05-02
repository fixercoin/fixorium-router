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
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
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
    const MAX_PROGRAM_ID = "EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM";

    useEffect(() => {
        const userEmail = localStorage.getItem('user_email');
        const userRegistered = localStorage.getItem('user_registered');
        const savedApiKey = localStorage.getItem('max_api_key');
        
        if (userEmail && userRegistered === 'true') {
            setRegisteredEmail(userEmail);
            setIsRegistered(true);
            if (savedApiKey) {
                setApiKey(savedApiKey);
            }
        }
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
                localStorage.setItem('user_registered', 'true');
                localStorage.setItem('max_api_key', data.apiKey || '');
                localStorage.setItem('max_api_secret', data.apiSecret || '');
                localStorage.setItem('mintme_contract', data.mintmeContract || '');
                localStorage.setItem('max_program_id', data.maxProgramId || '');
                setRegisteredEmail(loginEmail);
                setIsRegistered(true);
                setApiKey(data.apiKey || '');
                setApiSecret(data.apiSecret || '');
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
                localStorage.setItem('max_api_key', data.apiKey);
                localStorage.setItem('max_api_secret', data.apiSecret);
                localStorage.setItem('mintme_contract', data.mintmeContract || MINTME_CONTRACT);
                setRegisteredEmail(email);
                setIsRegistered(true);
                setShowMaxRegisterDialog(false);
                setShowMaxApiDialog(true);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                window.location.reload();
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
        localStorage.removeItem('max_api_key');
        localStorage.removeItem('max_api_secret');
        localStorage.removeItem('mintme_contract');
        localStorage.removeItem('max_program_id');
        setIsRegistered(false);
        setRegisteredEmail('');
        setApiKey('');
        setApiSecret('');
        setShowUserMenu(false);
        if (onLogout) {
            onLogout();
        } else {
            window.location.reload();
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDexService = () => {
        setCurrentPage('dashboard');
    };

    const handleLoginClick = () => {
        setShowLoginDialog(true);
        setShowUserMenu(false);
    };

    const handleRegisterClick = () => {
        setShowLoginDialog(false);
        setShowMaxRegisterDialog(true);
    };

    return (
        <div className="min-h-screen bg-dark">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 bg-darker/95 backdrop-blur-md border-b border-border z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-12 md:h-14">
                        <div className="text-[10px] md:text-xs font-semibold text-primary uppercase tracking-wider">
                            DEFI PLATFORM
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6">
                            <a href="https://exchange.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                EXCHANGE
                            </a>
                            <button onClick={handleDexService} className="text-xs text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                DEX SERVICE
                            </button>
                            <a href="https://wallet.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                WALLET
                            </a>
                            <a href="https://fixorium.com.pk/team" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                TEAM
                            </a>
                        </nav>

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 text-gray-400 hover:text-primary transition p-2">
                                <svg className="w-5 h-5 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider">PROFILE</span>
                            </button>
                            
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50">
                                    <div className="py-1">
                                        {isRegistered ? (
                                            <>
                                                <div className="px-4 py-3 border-b border-border">
                                                    <div className="text-[10px] text-gray-400 uppercase mb-1">ACCOUNT</div>
                                                    <div className="text-xs text-white break-all">{registeredEmail}</div>
                                                </div>
                                                <div className="px-4 py-3">
                                                    <div className="text-[10px] text-gray-400 uppercase mb-1">MAX API KEY</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <code className="flex-1 text-[10px] text-primary break-all bg-darker p-1.5 rounded">
                                                            {apiKey || 'Not registered'}
                                                        </code>
                                                        {apiKey && (
                                                            <button onClick={() => copyToClipboard(apiKey)} className="text-gray-400 hover:text-white p-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="px-4 py-3">
                                                    <div className="text-[10px] text-gray-400 uppercase mb-1">MINTME CONTRACT</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <code className="flex-1 text-[10px] text-green-400 break-all bg-darker p-1.5 rounded">
                                                            {MINTME_CONTRACT}
                                                        </code>
                                                        <button onClick={() => copyToClipboard(MINTME_CONTRACT)} className="text-gray-400 hover:text-white p-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition uppercase tracking-wider"
                                                >
                                                    LOGOUT
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={handleLoginClick}
                                                className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-primary/10 hover:text-primary transition uppercase tracking-wider"
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

            {/* Custom Marquee */}
            <div className="fixed top-12 md:top-14 left-0 right-0 bg-primary/10 border-y border-primary/20 overflow-hidden whitespace-nowrap py-2 z-40">
                <div className="inline-block animate-marquee whitespace-nowrap">
                    <span className="mx-4 inline-flex items-center gap-2">
                        <span className="text-yellow-400 text-[10px] md:text-xs uppercase tracking-wider font-semibold">NEW</span>
                        <span className="text-white text-[9px] md:text-xs uppercase tracking-wider">FIXORIUM EXCHANGE — MULTICHAIN DEX AGGREGATOR WITH NEW CRYPTO TRADE IDEAS</span>
                    </span>
                    <span className="mx-4 inline-flex items-center gap-2">
                        <span className="text-yellow-400 text-[10px] md:text-xs uppercase tracking-wider font-semibold">WALLET</span>
                        <span className="text-white text-[9px] md:text-xs uppercase tracking-wider">FIXORIUM WALLET — MULTICHAIN WALLET SUPPORTING SOLANA, EVM, MINTME BLOCKCHAIN WITH POOL CREATION SYSTEM</span>
                    </span>
                    <span className="mx-4 inline-flex items-center gap-2">
                        <span className="text-yellow-400 text-[10px] md:text-xs uppercase tracking-wider font-semibold">ROUTER</span>
                        <span className="text-white text-[9px] md:text-xs uppercase tracking-wider">MINTME FIXORIUM ROUTER — FREE TO USE FIXORIUM DEX ROUTER AVAILABLE AFTER REGISTRATION</span>
                    </span>
                    <span className="mx-4 inline-flex items-center gap-2">
                        <span className="text-yellow-400 text-[10px] md:text-xs uppercase tracking-wider font-semibold">MAX</span>
                        <span className="text-white text-[9px] md:text-xs uppercase tracking-wider">MAX AGGREGATOR — SUPER FAST • VERY LOW FEES • MULTICHAIN AGGREGATOR</span>
                    </span>
                    <span className="mx-4 inline-flex items-center gap-2">
                        <span className="text-yellow-400 text-[10px] md:text-xs uppercase tracking-wider font-semibold">API</span>
                        <span className="text-white text-[9px] md:text-xs uppercase tracking-wider">GET MAX API KEY & SECRET KEY AFTER REGISTRATION — EASY TO INTEGRATE WITH SIMPLE ICONS</span>
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="min-h-screen flex flex-col items-center justify-center pt-32 md:pt-40 pb-20 md:pb-12">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center justify-center">
                            <img 
                                src="https://i.postimg.cc/VNCccDTn/connectpie-favicon-t.png" 
                                alt="Fixorium Logo" 
                                className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation Bar - Mobile Only */}
            <div className="fixed bottom-0 left-0 right-0 bg-darker/95 backdrop-blur-md border-t border-border z-50 md:hidden">
                <div className="flex items-center justify-around py-2">
                    <a href="https://exchange.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m3 4H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span className="text-[8px] uppercase tracking-wider">EXCHANGE</span>
                    </a>
                    <button onClick={handleDexService} className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-[8px] uppercase tracking-wider">DEX SERVICE</span>
                    </button>
                    <a href="https://wallet.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M6 14h12M9 18h6M12 6v12" />
                        </svg>
                        <span className="text-[8px] uppercase tracking-wider">WALLET</span>
                    </a>
                    <a href="https://fixorium.com.pk/team" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-[8px] uppercase tracking-wider">TEAM</span>
                    </a>
                </div>
            </div>

            {/* Login Dialog */}
            {showLoginDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-primary uppercase tracking-wider">LOGIN</h2>
                            <button onClick={() => setShowLoginDialog(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-3">
                            {loginError && (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2">
                                    <p className="text-[10px] text-red-400">{loginError}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-[10px] text-gray-400 uppercase mb-1">EMAIL</label>
                                <input
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full p-2 bg-darker border border-border rounded-lg text-white text-xs focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 uppercase mb-1">PASSWORD</label>
                                <input
                                    type="password"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    placeholder="PASSWORD"
                                    className="w-full p-2 bg-darker border border-border rounded-lg text-white text-xs focus:border-primary outline-none"
                                />
                            </div>
                            <button
                                onClick={handleLogin}
                                disabled={isLoggingIn}
                                className="w-full py-2 bg-primary text-black text-xs font-bold rounded-xl hover:bg-[#e8d58a] transition uppercase tracking-wider disabled:opacity-50"
                            >
                                {isLoggingIn ? 'LOGGING IN...' : 'LOGIN'}
                            </button>
                            <div className="text-center mt-2">
                                <button
                                    onClick={handleRegisterClick}
                                    className="text-[10px] text-primary hover:underline"
                                >
                                    Don't have an account? Register here
                                </button>
                            </div>
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
                    animation: marquee 40s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Home;
