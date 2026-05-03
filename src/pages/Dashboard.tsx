import React, { useState, useEffect } from 'react';

const Dashboard: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [inputMint, setInputMint] = useState('So11111111111111111111111111111111111111112');
    const [outputMint, setOutputMint] = useState('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    const [amount, setAmount] = useState('1000000');
    const [quote, setQuote] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const key = localStorage.getItem('max_api_key');
        if (key) setApiKey(key);
    }, []);

    const testQuote = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/max/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}`, {
                headers: { 'X-API-Key': apiKey }
            });
            const data = await res.json();
            setQuote(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-dark p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-primary mb-6">Quote Tester</h1>
                
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Input Mint</label>
                        <input 
                            value={inputMint} 
                            onChange={(e) => setInputMint(e.target.value)} 
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Output Mint</label>
                        <input 
                            value={outputMint} 
                            onChange={(e) => setOutputMint(e.target.value)} 
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Amount</label>
                        <input 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                        />
                    </div>
                    
                    <button 
                        onClick={testQuote} 
                        disabled={loading}
                        className="w-full py-2 bg-primary text-black font-bold rounded-lg hover:bg-[#e8d58a] transition"
                    >
                        {loading ? 'Loading...' : 'Test Quote'}
                    </button>
                </div>

                {quote && (
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-primary mb-3">Quote Result</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Input:</span>
                                <span className="text-white">{quote.quote?.inAmount} {quote.quote?.inputMint?.slice(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Output:</span>
                                <span className="text-white">{quote.quote?.outAmount} {quote.quote?.outputMint?.slice(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Fee:</span>
                                <span className="text-primary">{quote.quote?.fee?.percentage} ({quote.quote?.fee?.amount})</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
