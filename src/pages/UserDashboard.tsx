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
    const [activeTab, setActiveTab] = useState<'max' | 'mintme'>('max');
    
    // API testing states
    const [maxEndpoint, setMaxEndpoint] = useState('quote');
    const [maxParams, setMaxParams] = useState('{\n  "inputMint": "So11111111111111111111111111111111111111112",\n  "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",\n  "amount": "1000000"\n}');
    const [maxResponse, setMaxResponse] = useState('');
    const [maxLoading, setMaxLoading] = useState(false);
    
    const [mintMeEndpoint, setMintMeEndpoint] = useState('quote');
    const [mintMeParams, setMintMeParams] = useState('{\n  "tokenIn": "0x0000000000000000000000000000000000000000",\n  "tokenOut": "0x091da08c5bf888252ed1ab3e44246cbf72d63307",\n  "amountIn": "1000000000000000000"\n}');
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
        if (maxEndpoint === 'quote') {
            setMaxParams('{\n  "inputMint": "So11111111111111111111111111111111111111112",\n  "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",\n  "amount": "1000000"\n}');
        } else if (maxEndpoint === 'swap') {
            setMaxParams('{\n  "userPublicKey": "YourSolanaWalletAddressHere",\n  "quoteResponse": {\n    "inputMint": "So11111111111111111111111111111111111111112",\n    "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",\n    "inAmount": "1000000",\n    "outAmount": "999900",\n    "fee": {\n      "bps": 1,\n      "percentage": "0.01%",\n      "amount": "100"\n    }\n  }\n}');
        } else if (maxEndpoint === 'pools') {
            setMaxParams('{\n  "mint": "So11111111111111111111111111111111111111112"\n}');
        }
    }, [maxEndpoint]);

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
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                }
            };
            
            if (maxEndpoint === 'quote') {
                options.method = 'GET';
                let params;
                try {
                    params = JSON.parse(maxParams);
                } catch (e) {
                    setMaxResponse(`Error: Invalid JSON\n\n${e.message}`);
                    setMaxLoading(false);
                    return;
                }
                const queryParams = new URLSearchParams(params).toString();
                url += `?${queryParams}`;
            } else if (maxEndpoint === 'swap') {
                options.method = 'POST';
                let body;
                try {
                    body = JSON.parse(maxParams);
                } catch (e) {
                    setMaxResponse(`Error: Invalid JSON\n\n${e.message}`);
                    setMaxLoading(false);
                    return;
                }
                if (!body.userPublicKey) {
                    setMaxResponse('Error: Missing "userPublicKey"');
                    setMaxLoading(false);
                    return;
                }
                if (!body.quoteResponse) {
                    setMaxResponse('Error: Missing "quoteResponse"');
                    setMaxLoading(false);
                    return;
                }
                options.body = JSON.stringify(body);
            } else if (maxEndpoint === 'pools') {
                options.method = 'GET';
                let params;
                try {
                    params = JSON.parse(maxParams);
                } catch (e) {
                    setMaxResponse(`Error: Invalid JSON\n\n${e.message}`);
                    setMaxLoading(false);
                    return;
                }
                const queryParams = new URLSearchParams(params).toString();
                url += `?${queryParams}`;
            }
            
            const response = await fetch(url, options);
            const data = await response.json();
            setMaxResponse(JSON.stringify(data, null, 2));
            
            const newUsage = { ...apiUsage, maxCalls: apiUsage.maxCalls + 1 };
            setApiUsage(newUsage);
            localStorage.setItem('api_usage', JSON.stringify(newUsage));
        } catch (error: any) {
            setMaxResponse(`Error: ${error.message}`);
        } finally {
            setMaxLoading(false);
        }
    };

    const testMintMeEndpoint = async () => {
        console.log('MintMe API Key:', mintMeApiKey);
        console.log('MintMe Endpoint:', mintMeEndpoint);
        console.log('MintMe Params:', mintMeParams);
        
        setMintMeLoading(true);
        setMintMeResponse('');
        
        if (!mintMeApiKey) {
            setMintMeResponse('Error: No MintMe API key found. Please register for MintMe API first.');
            setMintMeLoading(false);
            return;
        }
        
        try {
            let url = `/api/mintme/v1/${mintMeEndpoint}`;
            let options: RequestInit = {
                method: 'POST',
                headers: {
                    'X-API-Key': mintMeApiKey,
                    'Content-Type': 'application/json'
                }
            };
            
            if (mintMeEndpoint === 'quote') {
                let body;
                try {
                    body = JSON.parse(mintMeParams);
                } catch (e) {
                    setMintMeResponse(`Error: Invalid JSON in parameters\n\n${e.message}`);
                    setMintMeLoading(false);
                    return;
                }
                options.body = JSON.stringify(body);
                console.log('Sending request to:', url, options);
            } else if (mintMeEndpoint === 'swap') {
                options.method = 'POST';
                options.body = mintMeParams;
            } else if (mintMeEndpoint === 'liquidity') {
                options.method = 'GET';
                const params = JSON.parse(mintMeParams);
                const queryParams = new URLSearchParams(params).toString();
                url += `?${queryParams}`;
            }
            
            const response = await fetch(url, options);
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            setMintMeResponse(JSON.stringify(data, null, 2));
            
            const newUsage = { ...apiUsage, mintMeCalls: apiUsage.mintMeCalls + 1 };
            setApiUsage(newUsage);
            localStorage.setItem('api_usage', JSON.stringify(newUsage));
        } catch (error: any) {
            console.error('MintMe API error:', error);
            setMintMeResponse(`Error: ${error.message}\n\nMake sure the MintMe API endpoint is implemented.`);
        } finally {
            setMintMeLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 bg-darker/95 backdrop-blur-md border-b border-border z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-8">
                            <div className="text-base font-semibold text-primary uppercase tracking-wider">
                                DEFI PLATFORM
                            </div>
                            <nav className="hidden md:flex items-center gap-6">
                                <a href="https://exchange.fixorium.com.pk" target="_blank" className="text-xs text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                    EXCHANGE
                                </a>
                                <button onClick={() => window.location.href = '/'} className="text-xs text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                    HOME
                                </button>
                                <a href="https://wallet.fixorium.com.pk" target="_blank" className="text-xs text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                    WALLET
                                </a>
                                <a href="https://fixorium.com.pk/team" target="_blank" className="text-xs text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                    TEAM
                                </a>
                            </nav>
                        </div>

                        <div className="relative">
                            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 text-gray-400 hover:text-primary transition p-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-[10px] font-medium uppercase tracking-wider">PROFILE</span>
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
                                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition uppercase tracking-wider">LOGOUT</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Custom Marquee */}
            <div className="fixed top-14 left-0 right-0 bg-primary/10 border-y border-primary/20 overflow-hidden whitespace-nowrap py-2 z-40">
                <div className="inline-block animate-marquee whitespace-nowrap">
                    <span className="mx-4 inline-flex items-center gap-2">
                        <span className="text-yellow-400 text-[10px] uppercase tracking-wider font-semibold">NEW</span>
                        <span className="text-white text-[9px] uppercase tracking-wider">FIXORIUM EXCHANGE — MULTICHAIN DEX AGGREGATOR</span>
                    </span>
                    <span className="mx-4 inline-flex items-center gap-2">
                        <span className="text-yellow-400 text-[10px] uppercase tracking-wider font-semibold">WALLET</span>
                        <span className="text-white text-[9px] uppercase tracking-wider">FIXORIUM WALLET — MULTICHAIN WALLET</span>
                    </span>
                    <span className="mx-4 inline-flex items-center gap-2">
                        <span className="text-yellow-400 text-[10px] uppercase tracking-wider font-semibold">API</span>
                        <span className="text-white text-[9px] uppercase tracking-wider">TEST YOUR API ENDPOINTS DIRECTLY FROM DASHBOARD</span>
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left Column - 30% */}
                        <div className="lg:w-[30%]">
                            <div className="border border-gray-700 rounded-xl overflow-hidden sticky top-32 bg-transparent">
                                <div className="p-5 border-b border-gray-700">
                                    <h1 className="text-lg font-bold text-primary uppercase tracking-wider">API DASHBOARD</h1>
                                    <p className="text-xs text-gray-400 mt-1">Welcome back, <span className="text-primary">{registeredEmail}</span></p>
                                </div>

                                <div className="p-5 border-b border-gray-700">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">API USAGE</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-[10px] mb-1">
                                                <span>MAX API (Solana)</span>
                                                <span>{apiUsage.maxCalls} / {apiUsage.maxLimit}</span>
                                            </div>
                                            <div className="w-full bg-darker rounded-full h-1.5">
                                                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(apiUsage.maxCalls / apiUsage.maxLimit) * 100}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] mb-1">
                                                <span>MintMe API (EVM)</span>
                                                <span>{apiUsage.mintMeCalls} / {apiUsage.mintMeLimit}</span>
                                            </div>
                                            <div className="w-full bg-darker rounded-full h-1.5">
                                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(apiUsage.mintMeCalls / apiUsage.mintMeLimit) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Simple Buttons */}
                                <div className="p-5 border-b border-gray-700">
                                    <button
                                        onClick={() => setActiveTab('max')}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all mb-3 ${activeTab === 'max' ? 'bg-primary/20 border border-primary' : 'border border-gray-700 hover:border-primary/30'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-bold text-primary uppercase tracking-wider">MAX API</div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">Solana DEX Aggregator</div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('mintme')}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === 'mintme' ? 'bg-primary/20 border border-primary' : 'border border-gray-700 hover:border-primary/30'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-bold text-primary uppercase tracking-wider">MINTME API</div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">EVM DEX Aggregator</div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                </svg>
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                <div className="p-5">
                                    <div className="text-[10px] text-gray-400 uppercase mb-2">Your API Key</div>
                                    <div className="bg-darker rounded-lg p-2 mb-3 border border-gray-700">
                                        <code className="text-[9px] text-primary break-all">{activeTab === 'max' ? (apiKey ? `${apiKey.slice(0, 20)}...` : 'Not available') : (mintMeApiKey ? `${mintMeApiKey.slice(0, 20)}...` : 'Not available')}</code>
                                    </div>
                                    {(activeTab === 'max' ? apiKey : mintMeApiKey) && (
                                        <button onClick={() => copyToClipboard(activeTab === 'max' ? apiKey : mintMeApiKey)} className="w-full py-2 bg-primary/10 text-primary text-[10px] font-semibold rounded-lg hover:bg-primary/20 transition border border-gray-700">
                                            COPY API KEY
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - 70% */}
                        <div className="lg:w-[70%]">
                            {activeTab === 'max' ? (
                                <div className="border border-gray-700 rounded-xl overflow-hidden bg-transparent">
                                    <div className="p-6 border-b border-gray-700">
                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <div>
                                                <h2 className="text-lg font-bold text-primary uppercase tracking-wider">MAX API TESTER</h2>
                                                <p className="text-[11px] text-gray-400 mt-1">Solana DEX Aggregator - 0.01% Fee</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setMaxEndpoint('quote')} className={`px-4 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${maxEndpoint === 'quote' ? 'bg-primary text-black' : 'border border-gray-700 text-gray-400 hover:text-white'}`}>QUOTE</button>
                                                <button onClick={() => setMaxEndpoint('swap')} className={`px-4 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${maxEndpoint === 'swap' ? 'bg-primary text-black' : 'border border-gray-700 text-gray-400 hover:text-white'}`}>SWAP</button>
                                                <button onClick={() => setMaxEndpoint('pools')} className={`px-4 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${maxEndpoint === 'pools' ? 'bg-primary text-black' : 'border border-gray-700 text-gray-400 hover:text-white'}`}>POOLS</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] text-gray-400 uppercase mb-2 font-semibold">REQUEST PARAMETERS</label>
                                                <textarea value={maxParams} onChange={(e) => setMaxParams(e.target.value)} className="w-full h-80 p-3 bg-darker border border-gray-700 rounded-lg text-white text-xs font-mono focus:border-primary outline-none resize-none" />
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="text-[9px] text-gray-400">Program ID: {MAX_PROGRAM_ID.slice(0, 16)}...</div>
                                                    <button onClick={testMaxEndpoint} disabled={maxLoading || !apiKey} className="px-5 py-2 bg-primary text-black text-[11px] font-bold rounded-lg hover:bg-[#e8d58a] transition disabled:opacity-50">
                                                        {maxLoading ? 'SENDING...' : 'SEND REQUEST'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-400 uppercase mb-2 font-semibold">RESPONSE</label>
                                                <pre className="w-full h-80 p-3 bg-darker border border-gray-700 rounded-lg text-[10px] text-gray-300 font-mono overflow-auto whitespace-pre-wrap break-all">{maxResponse || 'Click "SEND REQUEST" to test the endpoint...'}</pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-gray-700 rounded-xl overflow-hidden bg-transparent">
                                    <div className="p-6 border-b border-gray-700">
                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <div>
                                                <h2 className="text-lg font-bold text-primary uppercase tracking-wider">MINTME API TESTER</h2>
                                                <p className="text-[11px] text-gray-400 mt-1">EVM DEX Aggregator - 0.01% Fee</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setMintMeEndpoint('quote')} className={`px-4 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${mintMeEndpoint === 'quote' ? 'bg-primary text-black' : 'border border-gray-700 text-gray-400 hover:text-white'}`}>QUOTE</button>
                                                <button onClick={() => setMintMeEndpoint('swap')} className={`px-4 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${mintMeEndpoint === 'swap' ? 'bg-primary text-black' : 'border border-gray-700 text-gray-400 hover:text-white'}`}>SWAP</button>
                                                <button onClick={() => setMintMeEndpoint('liquidity')} className={`px-4 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${mintMeEndpoint === 'liquidity' ? 'bg-primary text-black' : 'border border-gray-700 text-gray-400 hover:text-white'}`}>LIQUIDITY</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] text-gray-400 uppercase mb-2 font-semibold">REQUEST PARAMETERS</label>
                                                <textarea value={mintMeParams} onChange={(e) => setMintMeParams(e.target.value)} className="w-full h-80 p-3 bg-darker border border-gray-700 rounded-lg text-white text-xs font-mono focus:border-primary outline-none resize-none" />
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="text-[9px] text-gray-400">Contract: {MINTME_CONTRACT.slice(0, 16)}...</div>
                                                    <button onClick={testMintMeEndpoint} disabled={mintMeLoading || !mintMeApiKey} className="px-5 py-2 bg-primary text-black text-[11px] font-bold rounded-lg hover:bg-[#e8d58a] transition disabled:opacity-50">
                                                        {mintMeLoading ? 'SENDING...' : 'SEND REQUEST'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-400 uppercase mb-2 font-semibold">RESPONSE</label>
                                                <pre className="w-full h-80 p-3 bg-darker border border-gray-700 rounded-lg text-[10px] text-gray-300 font-mono overflow-auto whitespace-pre-wrap break-all">{mintMeResponse || 'Click "SEND REQUEST" to test the endpoint...'}</pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-darker/95 backdrop-blur-md border-t border-border z-50 md:hidden">
                <div className="flex items-center justify-around py-2">
                    <a href="https://exchange.fixorium.com.pk" target="_blank" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m3 4H4m0 0l4 4m-4-4l4-4" /></svg>
                        <span className="text-[8px] uppercase">EXCHANGE</span>
                    </a>
                    <button onClick={() => window.location.href = '/'} className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        <span className="text-[8px] uppercase">HOME</span>
                    </button>
                    <a href="https://wallet.fixorium.com.pk" target="_blank" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M6 14h12M9 18h6M12 6v12" /></svg>
                        <span className="text-[8px] uppercase">WALLET</span>
                    </a>
                    <a href="https://fixorium.com.pk/team" target="_blank" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        <span className="text-[8px] uppercase">TEAM</span>
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

export default Dashboard;
