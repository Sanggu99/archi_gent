import React from 'react';
import { Layers, Box, Maximize } from 'lucide-react';
import { VariantData } from '../types';

interface GeneratedAssetsListProps {
  variants: VariantData[];
  activeVariantId: number;
  onSelectVariant: (id: number) => void;
}

export function GeneratedAssetsList({ variants, activeVariantId, onSelectVariant }: GeneratedAssetsListProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Generated Variants</h3>
        <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full text-white/70 font-mono">{variants.length} items</span>
      </div>
      
      <div className="flex flex-col gap-2">
        {variants.map((variant) => {
          const isActive = variant.id === activeVariantId;
          return (
            <div 
              key={variant.id} 
              onClick={() => onSelectVariant(variant.id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex gap-3 ${
                isActive 
                  ? 'bg-white/10 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.03)]' 
                  : 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="w-12 h-12 rounded bg-[#1a1a1a] border border-white/10 flex items-center justify-center shrink-0 relative overflow-hidden">
                 <Box size={20} color={isActive ? '#44ff44' : '#ffffff'} opacity={isActive ? 1 : 0.6} />
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/5"></div>
              </div>
              <div className="flex flex-col justify-center overflow-hidden flex-1">
                <h4 className={`text-xs font-medium truncate ${isActive ? 'text-white' : 'text-white/80'}`}>{variant.variantName}</h4>
                <p className="text-[10px] text-white/50 truncate mt-0.5">{variant.description}</p>
                <div className="flex gap-2 mt-1.5">
                  <span className="text-[8px] uppercase tracking-wider bg-black/40 px-1.5 py-0.5 rounded text-white/40 flex items-center gap-1 border border-white/5">
                    <Layers size={8} /> 3D
                  </span>
                  <span className="text-[8px] uppercase tracking-wider bg-black/40 px-1.5 py-0.5 rounded text-white/40 flex items-center gap-1 border border-white/5">
                    <Maximize size={8} /> {variant.overallScore} Score
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
