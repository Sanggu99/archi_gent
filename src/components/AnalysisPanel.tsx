import React from 'react';
import { Activity, Users, Database, Cpu } from 'lucide-react';
import { RegulationCompliance, VariantData } from '../types';

interface AnalysisPanelProps {
  variantData: VariantData;
  isGenerating: boolean;
}

export function AnalysisPanel({ variantData, isGenerating }: AnalysisPanelProps) {
  return (
    <div className="flex flex-col gap-5 relative">
      {isGenerating && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
          <div className="w-6 h-6 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin mb-2"></div>
          <span className="text-white/70 text-[10px] uppercase tracking-widest">Analyzing...</span>
        </div>
      )}
      <div>
        <h2 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
          <Activity size={14} className="text-blue-400" />
          Ontology Agent Analysis
        </h2>
        <p className="text-white/60 text-[11px] leading-relaxed transition-opacity duration-300">
          {variantData.description}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={<Users size={12} />} label="Active Agents" value={isGenerating ? "..." : "4"} />
        <StatCard icon={<Database size={12} />} label="Graph Nodes" value={isGenerating ? "..." : "128"} />
        <StatCard icon={<Cpu size={12} />} label="Compute Time" value={isGenerating ? "..." : "2.4s"} />
        <StatCard icon={<Activity size={12} />} label="Iterations" value={isGenerating ? "..." : "42"} />
      </div>

      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] uppercase tracking-widest text-white/50">Live Agent Dialogue</h4>
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isGenerating ? 'bg-emerald-400' : 'bg-[#44ff44]'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isGenerating ? 'bg-emerald-400' : 'bg-[#44ff44]'}`}></span>
          </span>
        </div>
        <div className="space-y-2.5 text-[10px] bg-black/40 p-3 rounded-lg border border-white/5 font-mono shadow-inner h-32 overflow-y-auto custom-scrollbar">
          {isGenerating ? (
            <div className="flex gap-2 animate-pulse">
              <span className="text-blue-400 shrink-0">[System]</span>
              <span className="text-white/50 italic">Agents are currently debating spatial configurations...</span>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <span className="text-[#ff5252] shrink-0">[Zaha_Agent]</span>
                <span className="text-white/70">The transition between retail and office is too abrupt. We need a fluid connective tissue.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#44ffff] shrink-0">[Foster_Agent]</span>
                <span className="text-white/70">Fluidity compromises the structural core. I suggest a diagrid exoskeleton for the transition zone.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#44ff44] shrink-0">[Rem_Agent]</span>
                <span className="text-white/70">Embrace the abruptness. The collision of programs is the point. Keep the core rigid.</span>
              </div>
              <div className="flex gap-2 pt-1 border-t border-white/10 mt-1">
                <span className="text-blue-400 shrink-0">[System]</span>
                <span className="text-white/50 italic">Applying structural constraints to Rem_Agent's proposal...</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-black/30 border border-white/10 rounded-xl p-3 text-[10px] text-white/80 space-y-2">
        <div className="flex items-center justify-between mb-2 text-white/50 uppercase tracking-widest text-[10px]">
          <span>Regulation Compliance</span>
          <span className="text-[9px]">{variantData.regulationCompliance?.length ?? 0} checks</span>
        </div>
        {variantData.regulationCompliance && variantData.regulationCompliance.length > 0 ? (
          variantData.regulationCompliance.slice(0, 4).map((item: RegulationCompliance, index: number) => (
            <div key={index} className="flex items-start gap-2">
              <span className={`mt-0.5 inline-flex h-2.5 w-2.5 rounded-full ${item.pass ? 'bg-emerald-400' : 'bg-red-500'}`}></span>
              <div>
                <div className="text-white/80">{item.item}</div>
                <div className="text-white/50">{item.detail}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-white/50 italic">No compliance summary available yet.</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-black/20 border border-white/5 rounded-md p-2.5 flex flex-col gap-1.5 hover:border-white/20 transition-colors">
      <div className="flex items-center gap-1.5 text-white/40">
        {icon}
        <span className="text-[9px] uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-medium text-white/90 font-mono">{value}</span>
    </div>
  );
}
