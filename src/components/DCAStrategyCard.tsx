import React, { useState } from 'react';
import { DCAStrategy } from '../sdk/dca';

interface DCAStrategyCardProps {
  strategy: DCAStrategy;
  onUpdate: () => void;
}

export const DCAStrategyCard: React.FC<DCAStrategyCardProps> = ({ strategy, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);

  const progressPercentage = strategy.executedCycles && strategy.totalCycles 
    ? (strategy.executedCycles / strategy.totalCycles) * 100 
    : 0;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">Strategy #{strategy.strategyId}</h3>
          <p className="text-sm text-gray-400">
            {strategy.inputMint.slice(0, 6)}...{strategy.inputMint.slice(-6)} → {strategy.outputMint.slice(0, 6)}...{strategy.outputMint.slice(-6)}
          </p>
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            strategy.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
          }`}>
            {strategy.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Amount</p>
          <p className="text-lg font-semibold text-white">{strategy.totalAmount.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Per Cycle</p>
          <p className="text-lg font-semibold text-white">{strategy.amountPerCycle.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Executed</p>
          <p className="text-lg font-semibold text-primary">{strategy.executedCycles}/{strategy.totalCycles}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Cycle Frequency</p>
          <p className="text-lg font-semibold text-white">{(strategy.cycleSeconds / 86400).toFixed(0)}d</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <p className="text-xs text-gray-400">Progress</p>
          <p className="text-xs text-gray-400">{progressPercentage.toFixed(0)}%</p>
        </div>
        <div className="w-full bg-darker rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full py-2 text-sm text-primary font-semibold hover:text-[#e8d58a] transition"
      >
        {showDetails ? 'Hide Details' : 'Show Details'}
      </button>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-border text-xs text-gray-400 space-y-2">
          <div className="flex justify-between">
            <span>Created:</span>
            <span>{formatDate(strategy.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Next Cycle:</span>
            <span>{formatDate(strategy.nextCycleTime)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Spent:</span>
            <span>{(strategy.amountPerCycle * strategy.executedCycles).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Remaining:</span>
            <span>{(strategy.totalAmount - (strategy.amountPerCycle * strategy.executedCycles)).toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
