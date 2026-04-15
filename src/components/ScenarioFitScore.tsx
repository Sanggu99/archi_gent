import React from 'react';

interface ScenarioFitScoreProps {
  scores: { environmental: number; economic: number; social: number; technical: number };
  overallScore: number;
  isGenerating: boolean;
  scoreRationale?: string;
}

export function ScenarioFitScore({ scores, overallScore, isGenerating, scoreRationale }: ScenarioFitScoreProps) {
  const getStatus = () => {
    if (overallScore >= 80) return { status: "Highly Feasible", statusColor: "bg-[#44ff44]" };
    if (overallScore >= 70) return { status: "Feasible", statusColor: "bg-[#ffff44]" };
    return { status: "Suboptimal", statusColor: "bg-[#ff5252]" };
  };

  const statusInfo = getStatus();

  return (
    <div className="flex flex-col h-full relative">
      {isGenerating && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
          <div className="w-6 h-6 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin mb-2"></div>
          <span className="text-white/70 text-[10px] uppercase tracking-widest">Calculating...</span>
        </div>
      )}
      <div className="flex items-baseline gap-2 mb-6">
        <span className={`text-5xl font-light tracking-tighter transition-colors duration-500 ${isGenerating ? 'text-white/20' : 'text-[#44ff44]'}`}>
          {isGenerating ? '--' : overallScore}
        </span>
        <span className="text-sm text-white/40 font-mono">/ 100</span>
      </div>
      
      <div className="flex flex-col gap-4 flex-1">
        <ProgressBar label="Environmental" value={isGenerating ? 0 : scores.environmental} color="bg-[#44ff44]" target="90%" />
        <ProgressBar label="Economic" value={isGenerating ? 0 : scores.economic} color="bg-[#44ffff]" target="70%" />
        <ProgressBar label="Social/Urban" value={isGenerating ? 0 : scores.social} color="bg-[#ff5252]" target="80%" />
        <ProgressBar label="Technical" value={isGenerating ? 0 : scores.technical} color="bg-[#b366ff]" target="85%" />
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Status</span>
          <span className={`text-[9px] text-[#111] font-bold uppercase tracking-wider ${isGenerating ? 'bg-white/20 text-white/50' : statusInfo.statusColor} px-2 py-1 rounded-sm transition-colors duration-500`}>
            {isGenerating ? 'Evaluating' : statusInfo.status}
          </span>
        </div>
        
        {/* Evaluation Rationale */}
        <div className="bg-white/5 rounded p-2 border border-white/10">
          <span className="text-[9px] text-white/40 uppercase tracking-wider block mb-1">AI Evaluation Rationale</span>
          <p className="text-[10px] text-white/70 leading-relaxed italic">
            "{isGenerating ? 'Analyzing layout parameters...' : (scoreRationale || 'No rationale provided.')}"
          </p>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color, target }: { label: string, value: number, color: string, target: string }) {
  return (
    <div className="group">
      <div className="flex justify-between text-[10px] mb-1.5 text-white/60 uppercase tracking-wider">
        <span>{label}</span>
        <span className="font-mono">{value}%</span>
      </div>
      <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden relative border border-white/5">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${value}%` }}
        ></div>
        {/* Target marker */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white z-10 shadow-[0_0_4px_rgba(255,255,255,0.8)]"
          style={{ left: target }}
        ></div>
      </div>
    </div>
  );
}
