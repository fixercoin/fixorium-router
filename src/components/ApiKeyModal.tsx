import React, { useState } from 'react';

interface ApiKeyModalProps {
    onClose: () => void;
    onCreate: (name: string, rateLimit: number) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [rateLimit, setRateLimit] = useState(10);
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [createdKey, setCreatedKey] = useState<{ key: string; secret: string } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API key creation
        setCreatedKey({
            key: `max_${Math.random().toString(36).substring(2, 15)}`,
            secret: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        });
        setStep('success');
        onCreate(name, rateLimit);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
                {step === 'form' ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Create API Key</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm text-gray-400 mb-2">Key Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Production, Development"
                                    className="w-full p-3 bg-darker border border-border rounded-lg text-white focus:border-primary outline-none"
                                    required
                                />
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-sm text-gray-400 mb-2">Rate Limit (requests/second)</label>
                                <input
                                    type="number"
                                    value={rateLimit}
                                    onChange={(e) => setRateLimit(parseInt(e.target.value))}
                                    min={1}
                                    max={100}
                                    className="w-full p-3 bg-darker border border-border rounded-lg text-white focus:border-primary outline-none"
                                />
                            </div>
                            
                            <button type="submit" className="w-full py-3 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition">
                                Create Key
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold">API Key Created!</h2>
                            <p className="text-gray-400 text-sm mt-1">Save these credentials - you won't see them again</p>
                        </div>
                        
                        <div className="bg-darker border border-border rounded-lg p-4 mb-4">
                            <div className="mb-3">
                                <div className="text-xs text-gray-400 mb-1">API Key</div>
                                <code className="text-sm text-primary break-all">{createdKey?.key}</code>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 mb-1">API Secret</div>
                                <code className="text-sm text-yellow-400 break-all">{createdKey?.secret}</code>
                            </div>
                        </div>
                        
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                            <p className="text-xs text-yellow-400 text-center">
                                ⚠️ Store your secret key securely. You will not be able to retrieve it again.
                            </p>
                        </div>
                        
                        <button onClick={onClose} className="w-full py-3 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition">
                            I've Saved My Secret
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ApiKeyModal;
