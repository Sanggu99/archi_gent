export interface SiteRequest {
  siteArea: number;
  far: number;
  bcr: number;
  designObjective: string;
  heightLimit?: number;
  setback?: number;
  useZone?: string;
}

export interface GraphNode {
  id: string;
  group: number;
  label: string;
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
  relation?: string;
}

export interface ProgramItem {
  id: string;
  name: string;
  ratio: number;
  fpRatio: number;
  color: string;
  layer?: string;
  area?: number;
}

export interface VariantScores {
  environmental: number;
  economic: number;
  social: number;
  technical: number;
}

export interface RegulationCompliance {
  item: string;
  pass: boolean;
  detail: string;
}

export interface VariantData {
  id: number;
  variantName: string;
  architect: string;
  description: string;
  scoreRationale: string;
  formal_strategy: string;
  overallScore: number;
  scores: VariantScores;
  programs: ProgramItem[];
  graphData: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  regulationCompliance?: RegulationCompliance[];
}

export interface ApiVariant {
  variantName: string;
  architect: string;
  description: string;
  scoreRationale: string;
  formal_strategy: string;
  overallScore: number;
  scores: VariantScores;
  programs: ProgramItem[];
  graphData: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  regulationCompliance: RegulationCompliance[];
}

export interface GenerateResponse {
  variants: ApiVariant[];
}
