import React, { useState } from 'react';
import { Main3DViewer } from './components/Main3DViewer';
import { NodeLinkView } from './components/NodeLinkView';
import { GeneratedAssetsList } from './components/GeneratedAssetsList';
import { VariantSnapshots } from './components/VariantSnapshots';
import { ScenarioFitScore } from './components/ScenarioFitScore';
import { AnalysisPanel } from './components/AnalysisPanel';
import { ProjectContextBar } from './components/ProjectContextBar';
import { Settings, Maximize2, Download, RefreshCw, Box } from 'lucide-react';
import { ApiVariant, GenerateResponse, VariantData } from './types';

const initialVariants: VariantData[] = [
  {
    id: 1,
    variantName: 'Variant_01_Base',
    architect: 'Baseline System',
    description: 'Initial massing based on zoning constraints. The agents have established a baseline configuration prioritizing structural efficiency and standard programmatic distribution.',
    scoreRationale: 'Balanced scores based on standard zoning compliance without radical optimizations.',
    formal_strategy: 'STACKED',
    overallScore: 75,
    scores: { environmental: 65, economic: 85, social: 70, technical: 80 },
    programs: [
      { id: 'retail', name: 'Retail', ratio: 0.15, fpRatio: 1.0, color: '#ff5252' },
      { id: 'officeA', name: 'Office A', ratio: 0.30, fpRatio: 0.3, color: '#44ff44' },
      { id: 'officeB', name: 'Office B', ratio: 0.30, fpRatio: 0.3, color: '#44ffff' },
      { id: 'hotel', name: 'Hotel', ratio: 0.15, fpRatio: 0.3, color: '#b366ff' },
      { id: 'core', name: 'Core', ratio: 0.10, fpRatio: 0.1, color: '#ffff44' }
    ],
    graphData: {
      nodes: [
        { id: 'core', group: 1, label: 'Core' },
        { id: 'retail', group: 2, label: 'Retail' },
        { id: 'office1', group: 3, label: 'Office A' },
        { id: 'office2', group: 3, label: 'Office B' },
        { id: 'hotel', group: 4, label: 'Hotel' },
      ],
      links: [
        { source: 'core', target: 'retail', value: 1 },
        { source: 'core', target: 'office1', value: 1 },
        { source: 'core', target: 'office2', value: 1 },
        { source: 'office2', target: 'hotel', value: 1 },
      ]
    }
  }
];

export default function App() {
  const [variants, setVariants] = useState<VariantData[]>(initialVariants);
  const [activeVariantId, setActiveVariantId] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Input states
  const [siteArea, setSiteArea] = useState(12500);
  const [far, setFar] = useState(800);
  const [bcr, setBcr] = useState(60);
  const [designObjective, setDesignObjective] = useState("Maximize office daylight autonomy while creating a porous retail podium for public engagement.");
  const [heightLimit, setHeightLimit] = useState(60);
  const [setback, setSetback] = useState(6);
  const [useZone, setUseZone] = useState('일반상업지역');

  const activeVariant = variants.find(v => v.id === activeVariantId) || variants[0];

  const handleExportActiveVariant = () => {
    const variant = activeVariant;
    if (!variant) {
      setErrorMessage('No active variant is available for export.');
      return;
    }

    const fileName = `variant_export_${variant.variantName.replace(/[^a-zA-Z0-9-_]/g, '_')}.json`;
    const payload = {
      type: 'architectural_variant_export',
      generatedAt: new Date().toISOString(),
      siteConstraints: { siteArea, far, bcr, designObjective },
      variant,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/generate', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteArea, far, bcr, designObjective, heightLimit, setback, useZone })
      });
      
      let data: GenerateResponse;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Server returned an invalid response. Please try again.");
      }
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate");
      }
      
      console.log("Generated from Gemini:", data);

      if (!data.variants || !Array.isArray(data.variants)) {
         throw new Error("Invalid response format from AI.");
      }
      
      const newVariants: VariantData[] = data.variants.map((v: ApiVariant, idx: number) => ({
        id: variants.length + idx + 1,
        variantName: v.variantName || `AI Variant ${idx + 1}`,
        architect: v.architect || 'Unknown Architect',
        description: v.description || 'AI Generated Variant',
        scoreRationale: v.scoreRationale || 'Generated based on standard heuristics.',
        formal_strategy: v.formal_strategy || 'STACKED',
        overallScore: v.overallScore || 80,
        scores: v.scores || initialVariants[0].scores,
        programs: v.programs && v.programs.length > 0 ? v.programs : initialVariants[0].programs,
        graphData: {
          nodes: v.graphData?.nodes || initialVariants[0].graphData.nodes,
          links: v.graphData?.links || initialVariants[0].graphData.links
        },
        regulationCompliance: v.regulationCompliance || [{ item: 'Compliance Unknown', pass: false, detail: 'AI response did not include regulation assessment.' }]
      }));

      setVariants(prev => [...prev, ...newVariants]);
      setActiveVariantId(newVariants[0].id);
    } catch (error: any) {
      console.error("Failed to generate:", error);
      setErrorMessage(error.message || "An error occurred while generating the variant.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Dynamic Calculations based on inputs
  const totalGFA = siteArea * (far / 100);

  return (
    <div className="flex flex-col h-screen w-full bg-[#121212] text-white font-sans overflow-hidden">
      {/* Top Bar */}
      <header className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-[#1a1a1a] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Box size={16} className="text-white" />
          </div>
          <h1 className="text-sm font-medium tracking-wide text-white/90">AI Architect Studio <span className="text-white/30 font-light ml-2">| Multi-Agent Ontology System</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"><RefreshCw size={14} /></button>
          <button onClick={handleExportActiveVariant} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"><Download size={14} /></button>
          <button className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"><Maximize2 size={14} /></button>
          <div className="w-px h-4 bg-white/10 mx-1"></div>
          <button className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"><Settings size={14} /></button>
        </div>
      </header>

      {/* Project Context Dashboard */}
      <ProjectContextBar 
        onGenerate={handleGenerate} 
        isGenerating={isGenerating} 
        siteArea={siteArea}
        setSiteArea={setSiteArea}
        far={far}
        setFar={setFar}
        bcr={bcr}
        setBcr={setBcr}
        designObjective={designObjective}
        setDesignObjective={setDesignObjective}
        heightLimit={heightLimit}
        setHeightLimit={setHeightLimit}
        setback={setback}
        setSetback={setSetback}
        useZone={useZone}
        setUseZone={setUseZone}
      />

      {errorMessage && (
        <div className="bg-red-500/20 border-b border-red-500/50 text-red-200 px-4 py-2 text-xs flex justify-between items-center shrink-0">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-200 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-[320px] h-full border-r border-white/10 flex flex-col bg-[#161616] overflow-y-auto shrink-0 custom-scrollbar">
          <div className="p-5 border-b border-white/10">
            <AnalysisPanel variantData={activeVariant} isGenerating={isGenerating} />
          </div>
          <div className="p-5">
            <GeneratedAssetsList variants={variants} activeVariantId={activeVariantId} onSelectVariant={setActiveVariantId} />
          </div>
        </div>

        {/* Center Panel */}
        <div className="flex-1 h-full relative bg-[#0a0a0a]">
          <Main3DViewer 
            isGenerating={isGenerating} 
            siteArea={siteArea}
            far={far}
            bcr={bcr}
            programs={activeVariant.programs}
            formal_strategy={activeVariant.formal_strategy}
            variantName={activeVariant.variantName}
          />
          
          {/* Floating Overlay on Center Panel */}
          <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
             <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-[10px] font-mono text-white/70 uppercase tracking-wider">
               {activeVariant.variantName}
             </div>
             <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-[10px] font-mono text-[#44ff44] uppercase tracking-wider flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-[#44ff44] animate-pulse"></span>
               Live Sync
             </div>
          </div>
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-md p-3 pointer-events-none min-w-[220px]">
            <div className="flex justify-between items-end mb-2 border-b border-white/10 pb-2">
              <h4 className="text-[9px] uppercase tracking-widest text-white/50">Program Legend</h4>
              <div className="text-right">
                <div className="text-[8px] text-white/40 uppercase">Total GFA</div>
                <div className="text-xs font-mono text-white">{totalGFA.toLocaleString()} m²</div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {activeVariant.programs.map(p => (
                <LegendItem key={p.id} color={p.color} label={p.name} area={totalGFA * p.ratio} pct={p.ratio * 100} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-[360px] h-full border-l border-white/10 flex flex-col bg-[#161616] overflow-y-auto shrink-0 custom-scrollbar">
          <div className="h-[35%] border-b border-white/10 relative">
            <div className="absolute top-3 left-4 z-10 text-[10px] font-semibold text-white/50 uppercase tracking-widest bg-black/40 backdrop-blur-sm px-2 py-1 rounded">Spatial Ontology Graph</div>
            <NodeLinkView graphData={activeVariant.graphData} programs={activeVariant.programs} isGenerating={isGenerating} />
          </div>
          <div className="p-5 border-b border-white/10">
            <div className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-3">Variant Snapshots</div>
            <VariantSnapshots />
          </div>
          <div className="p-5 flex-1">
            <div className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-3">Scenario Fit</div>
            <ScenarioFitScore 
              scores={activeVariant.scores} 
              overallScore={activeVariant.overallScore} 
              isGenerating={isGenerating} 
              scoreRationale={activeVariant.scoreRationale}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, area, pct }: { color: string, label: string, area: number, pct: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }}></div>
        <span className="text-[10px] text-white/80">{label}</span>
      </div>
      <div className="text-right flex items-center gap-2">
        <span className="text-[9px] font-mono text-white/40">{pct.toFixed(0)}%</span>
        <span className="text-[10px] font-mono text-white/90 w-14 text-right">{area.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
      </div>
    </div>
  );
}
