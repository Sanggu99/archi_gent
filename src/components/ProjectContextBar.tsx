import React from 'react';
import { MapPin, Target, Scale, Play } from 'lucide-react';

interface ProjectContextBarProps {
  onGenerate: () => void;
  isGenerating: boolean;
  siteArea: number;
  setSiteArea: (val: number) => void;
  far: number;
  setFar: (val: number) => void;
  bcr: number;
  setBcr: (val: number) => void;
  designObjective: string;
  setDesignObjective: (val: string) => void;
  heightLimit: number;
  setHeightLimit: (val: number) => void;
  setback: number;
  setSetback: (val: number) => void;
  useZone: string;
  setUseZone: (val: string) => void;
}

export function ProjectContextBar({ 
  onGenerate, 
  isGenerating,
  siteArea,
  setSiteArea,
  far,
  setFar,
  bcr,
  setBcr,
  designObjective,
  setDesignObjective,
  heightLimit,
  setHeightLimit,
  setback,
  setSetback,
  useZone,
  setUseZone,
}: ProjectContextBarProps) {
  return (
    <div className="w-full bg-[#161616] border-b border-white/10 p-3 flex items-center gap-6 shrink-0 overflow-x-auto custom-scrollbar">
      {/* Site Info */}
      <div className="flex items-center gap-3 min-w-max">
        <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
          <MapPin size={14} className="text-blue-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-white/50 uppercase tracking-wider">Site Location & Area (m²)</span>
          <div className="flex items-center gap-2 text-xs font-medium text-white/90">
            <span>Seoul, Gangnam-gu</span>
            <span className="text-white/30">|</span>
            <input 
              type="number" 
              value={siteArea}
              onChange={(e) => setSiteArea(Number(e.target.value))}
              className="font-mono text-blue-400 bg-transparent border-b border-blue-500/30 w-20 focus:outline-none focus:border-blue-400 px-1"
            />
          </div>
        </div>
      </div>

      <div className="w-px h-6 bg-white/10"></div>

      {/* Regulations */}
      <div className="flex items-center gap-3 min-w-max">
        <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <Scale size={14} className="text-purple-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-white/50 uppercase tracking-wider">Zoning & Regulations (%)</span>
          <div className="flex items-center gap-3 text-xs font-medium text-white/90">
            <span className="font-mono flex items-center gap-1">
              FAR: 
              <input 
                type="number" 
                value={far}
                onChange={(e) => setFar(Number(e.target.value))}
                className="text-purple-400 bg-transparent border-b border-purple-500/30 w-14 focus:outline-none focus:border-purple-400 px-1"
              />
            </span>
            <span className="text-white/30">|</span>
            <span className="font-mono flex items-center gap-1">
              BCR: 
              <input 
                type="number" 
                value={bcr}
                onChange={(e) => setBcr(Number(e.target.value))}
                className="text-purple-400 bg-transparent border-b border-purple-500/30 w-12 focus:outline-none focus:border-purple-400 px-1"
              />
            </span>
          </div>
        </div>
      </div>

      <div className="w-px h-6 bg-white/10"></div>

      {/* Extended Regulations */}
      <div className="flex items-center gap-3 min-w-max">
        <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-white/50 uppercase tracking-wider">Height / Setback / Use Zone</span>
          <div className="flex items-center gap-3 text-xs font-medium text-white/90">
            <span className="font-mono flex items-center gap-1">
              H:
              <input 
                type="number"
                value={heightLimit}
                onChange={(e) => setHeightLimit(Number(e.target.value))}
                className="text-orange-400 bg-transparent border-b border-orange-500/30 w-12 focus:outline-none focus:border-orange-400 px-1"
                title="Height Limit (m)"
              />
              m
            </span>
            <span className="text-white/30">|</span>
            <span className="font-mono flex items-center gap-1">
              SB:
              <input 
                type="number"
                value={setback}
                onChange={(e) => setSetback(Number(e.target.value))}
                className="text-orange-400 bg-transparent border-b border-orange-500/30 w-10 focus:outline-none focus:border-orange-400 px-1"
                title="Setback (m)"
              />
              m
            </span>
            <span className="text-white/30">|</span>
            <input 
              type="text"
              value={useZone}
              onChange={(e) => setUseZone(e.target.value)}
              className="text-orange-400 bg-transparent border-b border-orange-500/30 w-24 focus:outline-none focus:border-orange-400 px-1 text-xs"
              title="Use Zone"
            />
          </div>
        </div>
      </div>

      <div className="w-px h-6 bg-white/10"></div>

      {/* Design Goal */}
      <div className="flex items-center gap-3 min-w-max flex-1">
        <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <Target size={14} className="text-emerald-400" />
        </div>
        <div className="flex flex-col w-full">
          <span className="text-[9px] text-white/50 uppercase tracking-wider">Design Objective</span>
          <input 
            type="text" 
            value={designObjective}
            onChange={(e) => setDesignObjective(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-white/90 w-full focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded px-1 -ml-1"
          />
        </div>
      </div>

      {/* Generate Button */}
      <button 
        onClick={onGenerate}
        disabled={isGenerating}
        className={`min-w-max flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
          isGenerating 
            ? 'bg-white/10 text-white/40 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]'
        }`}
      >
        {isGenerating ? (
          <>
            <span className="w-3 h-3 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></span>
            Agents Computing...
          </>
        ) : (
          <>
            <Play size={12} fill="currentColor" />
            Run AI Agents
          </>
        )}
      </button>
    </div>
  );
}
