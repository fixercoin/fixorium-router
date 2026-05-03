import React, { useState, useEffect } from 'react';

const Dashboard: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [inputMint, setInputMint] = useState('So11111111111111111111111111111111111111112');
    const [outputMint, setOutputMint] = useState('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    const [amount, setAmount] = useState('1000000');
    const [quote, setQuote] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const key = localStorage.getItem('max_api_key');
        if (key) setApiKey(key);
    }, []);

    const testQuote = async () => {
        setLoading(true);
        setError(null);
        setQuote(null);
        
        try {
            const res = await fetch(`/api/max/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}`, {
                headers: { 'X-API-Key': apiKey }
            });
            const data = await res.json();
            
            if (data.success) {
                setQuote(data);
            } else {
                setError(data.error || 'Quote failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-yellow-400 mb-2">Quote Tester</h1>
                    <p className="text-gray-400">Test your swap quotes with 0.01% fee</p>
                </div>

                {/* API Key Status */}
                <div className="mb-6 px-4 py-2 bg-neutral-900 rounded-lg border border-neutral-800 inline-block">
                    <span className="text-xs text-gray-500">API Key: </span>
                    <span className="text-xs text-yellow-400 font-mono">
                        {apiKey ? `${apiKey.slice(0, 16)}...` : 'Not found'}
                    </span>
                </div>

                {/* Input Form */}
                <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 mb-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Input Mint</label>
                            <input 
                                value={inputMint} 
                                onChange={(e) => setInputMint(e.target.value)} 
                                className="w-full p-3 bg-black border border-neutral-800 rounded-lg text-white text-sm font-mono focus:border-yellow-400 focus:outline-none transition"
                                placeholder="Input token address"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Output Mint</label>
                            <input 
                                value={outputMint} 
                                onChange={(e) => setOutputMint(e.target.value)} 
                                className="w-full p-3 bg-black border border-neutral-800 rounded-lg text-white text-sm font-mono focus:border-yellow-400 focus:outline-none transition"
                                placeholder="Output token address"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Amount</label>
                            <input 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                className="w-full p-3 bg-black border border-neutral-800 rounded-lg text-white text-sm font-mono focus:border-yellow-400 focus:outline-none transition"
                                placeholder="Amount in lamports"
                            />
                        </div>
                        
                        <button 
                            onClick={testQuote} 
                            disabled={loading || !apiKey}
                            className="w-full py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Testing Quote...' : 'Test Quote'}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Quote Result */}
                {quote && (
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                        <div className="px-6 py-3 bg-yellow-400/10 border-b border-neutral-800">
                            <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">Quote Result</h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between items-center py-3 border-b border-neutral-800">
                                <span className="text-gray-400 text-sm">Input Token</span>
                                <code className="text-white text-xs font-mono">{quote.quote?.inputMint?.slice(0, 10)}...</code>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-neutral-800">
                                <span className="text-gray-400 text-sm">Input Amount</span>
                                <span className="text-white font-mono text-sm">{quote.quote?.inAmount}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-neutral-800">
                                <span className="text-gray-400 text-sm">Output Token</span>
                                <code className="text-white text-xs font-mono">{quote.quote?.outputMint?.slice(0, 10)}...</code>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-neutral-800">
                                <span className="text-gray-400 text-sm">Output Amount</span>
                                <span className="text-white font-mono text-sm">{quote.quote?.outAmount}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-gray-400 text-sm">Fee</span>
                                <span className="text-yellow-400 font-mono text-sm">
                                    {quote.quote?.fee?.percentage} ({quote.quote?.fee?.amount})
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!quote && !error && !loading && (
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-12 text-center">
                        <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <p className="text-gray-500">Enter token addresses and amount to test your quote</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
