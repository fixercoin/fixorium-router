import React, { useState, useEffect } from 'react';
import { MAXDCA, DCAStrategy, DCAParams } from '../sdk/dca';
import { DCAStrategyCard } from '../components/DCAStrategyCard';

interface DCAPageProps {
  apiKey: string;
}

export const DCAPage: React.FC<DCAPageProps> = ({ apiKey }) => {
  const [strategies, setStrategies] = useState<DCAStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<DCAParams>({
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    totalAmount: 0,
    amountPerCycle: 0,
    cycleSeconds: 86400,
    totalCycles: 30
  });

  const dca = new MAXDCA(apiKey);

  const fetchStrategies = async () => {
    setLoading(true);
    try {
      const fetchedStrategies = await dca.getAllStrategies();
      setStrategies(fetchedStrategies);
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
    }
    setLoading(false);
  };

  const handleCreateStrategy = async () => {
    try {
      const newStrategy = await dca.createStrategy(formData);
      setStrategies([newStrategy, ...strategies]);
      setShowCreateModal(false);
      setFormData({
        inputMint: 'So11111111111111111111111111111111111111112',
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        totalAmount: 0,
        amountPerCycle: 0,
        cycleSeconds: 86400,
        totalCycles: 30
      });
    } catch (error) {
      console.error('Failed to create strategy:', error);
    }
  };

  useEffect(() => {
    fetchStrategies();
    const interval = setInterval(fetchStrategies, 30000);
    return () => clearInterval(interval);
  }, []);

  const cycleOptions = [
    { label: 'Daily', seconds: 86400 },
    { label: 'Weekly', seconds: 604800 },
    { label: 'Monthly', seconds: 2592000 }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Dollar Cost Averaging</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition"
        >
          + Create Strategy
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading strategies...</div>
      ) : strategies.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No DCA strategies yet. Create your first strategy!
        </div>
      ) : (
        <div className="space-y-4">
          {strategies.map((strategy) => (
            <DCAStrategyCard key={strategy.strategyId} strategy={strategy} onUpdate={fetchStrategies} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create DCA Strategy</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Buy Token</label>
                <input
                  type="text"
                  value={formData.outputMint}
                  onChange={(e) => setFormData({ ...formData, outputMint: e.target.value })}
                  placeholder="Token mint address"
                  className="w-full p-2 bg-darker border border-border rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Total Investment</label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  className="w-full p-2 bg-darker border border-border rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount per Cycle</label>
                <input
                  type="number"
                  value={formData.amountPerCycle}
                  onChange={(e) => setFormData({ ...formData, amountPerCycle: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  className="w-full p-2 bg-darker border border-border rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Cycle Frequency</label>
                <select
                  value={formData.cycleSeconds}
                  onChange={(e) => setFormData({ ...formData, cycleSeconds: parseInt(e.target.value) })}
                  className="w-full p-2 bg-darker border border-border rounded-lg text-white"
                >
                  {cycleOptions.map(option => (
                    <option key={option.seconds} value={option.seconds}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Total Cycles</label>
                <input
                  type="number"
                  value={formData.totalCycles}
                  onChange={(e) => setFormData({ ...formData, totalCycles: parseInt(e.target.value) })}
                  placeholder="30"
                  className="w-full p-2 bg-darker border border-border rounded-lg text-white"
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-xs text-yellow-400">Fee: 0.01% per cycle execution</p>
              </div>

              <button
                onClick={handleCreateStrategy}
                className="w-full py-3 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition"
              >
                Create Strategy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
