import React, { useState, useEffect } from 'react';

interface DashboardProps {
    walletAddress?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ walletAddress = '' }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [mintMeApiKey, setMintMeApiKey] = useState('');
    const [mintMeApiSecret, setMintMeApiSecret] = useState('');
    const [copied, setCopied] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    
    // API testing states
    const [maxEndpoint, setMaxEndpoint] = useState('quote');
    const [maxParams, setMaxParams] = useState('{\n  "inputMint": "So11111111111111111111111111111111111111112",\n  "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",\n  "amount": "1000000"\n}');
    const [maxResponse, setMaxResponse] = useState('');
    const [maxLoading, setMaxLoading] = useState(false);
    
    const [mintMeEndpoint, setMintMeEndpoint] = useState('quote');
    const [mintMeParams, setMintMeParams] = useState('{\n  "tokenIn": "0x...",\n  "tokenOut": "0x...",\n  "amountIn": "1000000000000000000"\n}');
    const [mintMeResponse, setMintMeResponse] = useState('');
    const [mintMeLoading, setMintMeLoading] = useState(false);
    
    const [apiUsage, setApiUsage] = useState({
        maxCalls: 0,
        maxLimit: 10000,
        mintMeCalls: 0,
        mintMeLimit: 5000
    });

    const MINTME_CONTRACT = "0x33C60168f237146647891BAae4ca4DF8Ac58D03E";
    const MAX_PROGRAM_ID = "EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM";

    useEffect(() => {
        const userEmail = localStorage.getItem('user_email');
        const userRegistered = localStorage.getItem('user_registered');
        const savedApiKey = localStorage.getItem('max_api_key');
        const savedApiSecret = localStorage.getItem('max_api_secret');
        const savedMintMeKey = localStorage.getItem('mintme_api_key');
        const savedMintMeSecret = localStorage.getItem('mintme_api_secret');
        
        if (userEmail && userRegistered === 'true') {
            setRegisteredEmail(userEmail);
            setIsRegistered(true);
            if (savedApiKey) setApiKey(savedApiKey);
            if (savedApiSecret) setApiSecret(savedApiSecret);
            if (savedMintMeKey) setMintMeApiKey(savedMintMeKey);
            if (savedMintMeSecret) setMintMeApiSecret(savedMintMeSecret);
        }
        
        // Load API usage from localStorage
        const savedUsage = localStorage.getItem('api_usage');
        if (savedUsage) {
            setApiUsage(JSON.parse(savedUsage));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_registered');
        localStorage.removeItem('max_api_key');
        localStorage.removeItem('max_api_secret');
        localStorage.removeItem('mintme_api_key');
        localStorage.removeItem('mintme_api_secret');
        setIsRegistered(false);
        setRegisteredEmail('');
        setApiKey('');
        setApiSecret('');
        window.location.href = '/';
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const testMaxEndpoint = async () => {
        setMaxLoading(true);
        setMaxResponse('');
        
        try {
            let url = `/api/max/v1/${maxEndpoint}`;
            let options: RequestInit = {
                method: 'GET',
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                }
            };
            
            if (maxEndpoint === 'quote') {
                const params = JSON.parse(maxParams);
                const queryParams = new URLSearchParams(params).toString();
                url += `?${queryParams}`;
            } else if (maxEndpoint === 'swap') {
                options.method = 'POST';
                options.body = maxParams;
            }
            
            const response = await fetch(url, options);
            const data = await response.json();
            setMaxResponse(JSON.stringify(data, null, 2));
            
            // Update API usage
            const newUsage = { ...apiUsage, maxCalls: apiUsage.maxCalls + 1 };
            setApiUsage(newUsage);
            localStorage.setItem('api_usage', JSON.stringify(newUsage));
        } catch (error) {
            setMaxResponse(`Error: ${error.message}`);
        } finally {
            setMaxLoading(false);
        }
    };

    const testMintMeEndpoint = async () => {
        setMintMeLoading(true);
        setMintMeResponse('');
        
        try {
            let url = `/api/mintme/v1/${mintMeEndpoint}`;
            let options: RequestInit = {
                method: 'GET',
                headers: {
                    'X-API-Key': mintMeApiKey,
                    'Content-Type': 'application/json'
                }
            };
            
            if (mintMeEndpoint === 'quote') {
                const params = JSON.parse(mintMeParams);
                const queryParams = new URLSearchParams(params).toString();
                url += `?${queryParams}`;
            } else if (mintMeEndpoint === 'swap') {
                options.method = 'POST';
                options.body = mintMeParams;
            }
            
            const response = await fetch(url, options);
            const data = await response.json();
            setMintMeResponse(JSON.stringify(data, null, 2));
            
            // Update API usage
            const newUsage = { ...apiUsage, mintMeCalls: apiUsage.mintMeCalls + 1 };
            setApiUsage(newUsage);
            localStorage.setItem('api_usage', JSON.stringify(newUsage));
        } catch (error) {
            setMintMeResponse(`Error: ${error.message}`);
        } finally {
            setMintMeLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark">
            {/* Fixed Header - Same as Home.tsx */}
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
                            <button onClick={() => window.location.href = '/'} className="text-xs text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                HOME
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
                                        {isRegistered && (
                                            <>
                                                <div className="px-4 py-3 border-b border-border">
                                                    <div className="text-[10px] text-gray-400 uppercase mb-1">ACCOUNT</div>
                                                    <div className="text-xs text-white break-all">{registeredEmail}</div>
                                                </div>
                                                <div className="px-4 py-3">
                                                    <div className="text-[10px] text-gray-400 uppercase mb-1">MAX API KEY</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <code className="flex-1 text-[10px] text-primary break-all bg-darker p-1.5 rounded">
                                                            {apiKey || 'Not available'}
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
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Custom Marquee - Same as Home.tsx */}
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
                        <span className="text-white text-[9px] md:text-xs uppercase tracking-wider">TEST YOUR API ENDPOINTS DIRECTLY FROM DASHBOARD</span>
                    </span>
                </div>
            </div>

            {/* Main Content - API Testing Dashboard */}
            <div className="pt-28 md:pt-32 pb-20 md:pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Welcome Section */}
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-primary uppercase tracking-wider mb-2">
                            API DASHBOARD
                        </h1>
                        <p className="text-gray-400 text-xs md:text-sm">
                            Welcome back, <span className="text-primary">{registeredEmail}</span>
                        </p>
                    </div>

                    {/* API Usage Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">MAX API USAGE</h3>
                                <div className="px-2 py-1 bg-primary/10 rounded-lg">
                                    <span className="text-[10px] text-primary uppercase">Solana</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-gray-400">API Calls Today</span>
                                    <span className="text-xs text-white font-bold">{apiUsage.maxCalls} / {apiUsage.maxLimit}</span>
                                </div>
                                <div className="w-full bg-darker rounded-full h-2">
                                    <div 
                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(apiUsage.maxCalls / apiUsage.maxLimit) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-[10px] text-gray-400">Program ID</span>
                                    <code className="text-[9px] text-primary break-all text-right ml-2">{MAX_PROGRAM_ID.slice(0, 20)}...</code>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">MINTME API USAGE</h3>
                                <div className="px-2 py-1 bg-green-500/10 rounded-lg">
                                    <span className="text-[10px] text-green-400 uppercase">EVM</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-gray-400">API Calls Today</span>
                                    <span className="text-xs text-white font-bold">{apiUsage.mintMeCalls} / {apiUsage.mintMeLimit}</span>
                                </div>
                                <div className="w-full bg-darker rounded-full h-2">
                                    <div 
                                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(apiUsage.mintMeCalls / apiUsage.mintMeLimit) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-[10px] text-gray-400">Contract Address</span>
                                    <code className="text-[9px] text-green-400 break-all text-right ml-2">{MINTME_CONTRACT.slice(0, 20)}...</code>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MAX API Tester */}
                    <div className="bg-card border border-border rounded-xl p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-primary uppercase tracking-wider">MAX API TESTER</h2>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setMaxEndpoint('quote')}
                                    className={`px-3 py-1 text-[10px] rounded-lg transition ${maxEndpoint === 'quote' ? 'bg-primary text-black' : 'bg-darker text-gray-400'}`}
                                >
                                    QUOTE
                                </button>
                                <button 
                                    onClick={() => setMaxEndpoint('swap')}
                                    className={`px-3 py-1 text-[10px] rounded-lg transition ${maxEndpoint === 'swap' ? 'bg-primary text-black' : 'bg-darker text-gray-400'}`}
                                >
                                    SWAP
                                </button>
                                <button 
                                    onClick={() => setMaxEndpoint('pools')}
                                    className={`px-3 py-1 text-[10px] rounded-lg transition ${maxEndpoint === 'pools' ? 'bg-primary text-black' : 'bg-darker text-gray-400'}`}
                                >
                                    POOLS
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] text-gray-400 uppercase mb-2">REQUEST PARAMETERS (JSON)</label>
                                <textarea
                                    value={maxParams}
                                    onChange={(e) => setMaxParams(e.target.value)}
                                    className="w-full h-64 p-3 bg-darker border border-border rounded-lg text-white text-xs font-mono focus:border-primary outline-none resize-none"
                                    placeholder="Enter JSON parameters..."
                                />
                                <div className="flex items-center justify-between mt-3">
                                    <div className="text-[10px] text-gray-400">
                                        API Key: {apiKey ? `${apiKey.slice(0, 15)}...` : 'Not available'}
                                    </div>
                                    <button
                                        onClick={testMaxEndpoint}
                                        disabled={maxLoading || !apiKey}
                                        className="px-4 py-2 bg-primary text-black text-xs font-bold rounded-lg hover:bg-[#e8d58a] transition uppercase tracking-wider disabled:opacity-50"
                                    >
                                        {maxLoading ? 'TESTING...' : 'TEST ENDPOINT'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 uppercase mb-2">RESPONSE</label>
                                <pre className="w-full h-64 p-3 bg-darker border border-border rounded-lg text-[10px] text-gray-300 font-mono overflow-auto resize-none">
                                    {maxResponse || 'Click "TEST ENDPOINT" to see response...'}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* MintMe API Tester */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-primary uppercase tracking-wider">MINTME API TESTER</h2>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setMintMeEndpoint('quote')}
                                    className={`px-3 py-1 text-[10px] rounded-lg transition ${mintMeEndpoint === 'quote' ? 'bg-primary text-black' : 'bg-darker text-gray-400'}`}
                                >
                                    QUOTE
                                </button>
                                <button 
                                    onClick={() => setMintMeEndpoint('swap')}
                                    className={`px-3 py-1 text-[10px] rounded-lg transition ${mintMeEndpoint === 'swap' ? 'bg-primary text-black' : 'bg-darker text-gray-400'}`}
                                >
                                    SWAP
                                </button>
                                <button 
                                    onClick={() => setMintMeEndpoint('liquidity')}
                                    className={`px-3 py-1 text-[10px] rounded-lg transition ${mintMeEndpoint === 'liquidity' ? 'bg-primary text-black' : 'bg-darker text-gray-400'}`}
                                >
                                    LIQUIDITY
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] text-gray-400 uppercase mb-2">REQUEST PARAMETERS (JSON)</label>
                                <textarea
                                    value={mintMeParams}
                                    onChange={(e) => setMintMeParams(e.target.value)}
                                    className="w-full h-64 p-3 bg-darker border border-border rounded-lg text-white text-xs font-mono focus:border-primary outline-none resize-none"
                                    placeholder="Enter JSON parameters..."
                                />
                                <div className="flex items-center justify-between mt-3">
                                    <div className="text-[10px] text-gray-400">
                                        Contract: {MINTME_CONTRACT.slice(0, 15)}...
                                    </div>
                                    <button
                                        onClick={testMintMeEndpoint}
                                        disabled={mintMeLoading || !mintMeApiKey}
                                        className="px-4 py-2 bg-primary text-black text-xs font-bold rounded-lg hover:bg-[#e8d58a] transition uppercase tracking-wider disabled:opacity-50"
                                    >
                                        {mintMeLoading ? 'TESTING...' : 'TEST ENDPOINT'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-400 uppercase mb-2">RESPONSE</label>
                                <pre className="w-full h-64 p-3 bg-darker border border-border rounded-lg text-[10px] text-gray-300 font-mono overflow-auto resize-none">
                                    {mintMeResponse || 'Click "TEST ENDPOINT" to see response...'}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation Bar - Mobile Only - Same as Home.tsx */}
            <div className="fixed bottom-0 left-0 right-0 bg-darker/95 backdrop-blur-md border-t border-border z-50 md:hidden">
                <div className="flex items-center justify-around py-2">
                    <a href="https://exchange.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m3 4H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span className="text-[8px] uppercase tracking-wider">EXCHANGE</span>
                    </a>
                    <button onClick={() => window.location.href = '/'} className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-[8px] uppercase tracking-wider">HOME</span>
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

export default UserDashboard;
