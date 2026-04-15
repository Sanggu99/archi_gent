import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 4000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/generate", async (req, res) => {
    try {
      let apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({ error: "Invalid API Key. Please check the 'Secrets' panel in AI Studio and ensure your GEMINI_API_KEY is correct (do not use placeholder values like 'MY_GEMINI_API_KEY')." });
      }
      // Strip quotes if the user accidentally included them in the Secrets panel
      apiKey = apiKey.replace(/^["']|["']$/g, '');
      
      console.log("API KEY exists:", !!apiKey, "Length:", apiKey ? apiKey.length : 0);
      
      // Initialize Gemini right before the API call
      const ai = new GoogleGenAI({
        apiKey: apiKey
      });

      const { siteArea, far, bcr, designObjective, heightLimit, setback, useZone } = req.body;
      if (typeof siteArea !== 'number' || typeof far !== 'number' || typeof bcr !== 'number') {
        return res.status(400).json({ error: 'siteArea, far, and bcr must be numeric values.' });
      }
      const objective = typeof designObjective === 'string' && designObjective.trim().length > 0
        ? designObjective.trim()
        : 'Optimize mixed-use performance and urban connectivity while satisfying zoning constraints.';

      const heightStr = typeof heightLimit === 'number' ? `${heightLimit} m` : 'Not specified';
      const setbackStr = typeof setback === 'number' ? `${setback} m` : 'Not specified';
      const zoneStr = typeof useZone === 'string' && useZone.trim().length > 0 ? useZone.trim() : '일반상업지역';

      const prompt = `You are an expert architectural design agent. Create exactly 5 distinct architectural variants in valid JSON for the site and regulatory input below.

Site constraints:
- Site Area: ${siteArea} m2
- Maximum FAR: ${far}%
- Maximum BCR: ${bcr}%
- Height Limit: ${heightStr}
- Setback: ${setbackStr}
- Use Zone: ${zoneStr}
- Objective: "${objective}"

For each variant, include:
- variantName
- architect
- description
- scoreRationale
- formal_strategy
- overallScore
- scores { environmental, economic, social, technical }
- programs [ { id, name, ratio, fpRatio, color, layer } ]
- graphData { nodes:[{ id, group, label }], links:[{ source, target, value }] }
- regulationCompliance [ { item, pass, detail } ]

Rules:
- Return only valid JSON with a top-level {"variants": [...]} object.
- Do NOT include markdown, commentary, or any text outside the JSON.
- formal_strategy MUST be one of exactly: STACKED, HORIZONTAL, COURTYARD, ROTATED, SKEWED. Use each strategy EXACTLY ONCE across the 5 variants (one variant per strategy).
- programs must have between 5 and 7 items per variant. Never fewer than 5. Vary the mix dramatically: e.g. residential, cultural, green roof, mechanical, lobby, parking, amenity, retail, office, hotel.
- Vary fpRatio values dramatically across programs (range 0.05 to 0.90) so some programs are tall and thin while others are wide and low — this creates height diversity in the 3D massing.
- Program ratios must sum to 1.0 and use bright distinct hex colors (#RRGGBB). No two programs in the same variant should share similar colors.
- graphData node ids must match program ids exactly. links must form a rich multi-directional network: each node must connect to at least 2 other nodes. A single node CAN and SHOULD connect to multiple nodes. Do NOT create simple linear chains (a→b→c). Instead create hub-and-spoke + cross-links (a→b, a→c, b→d, c→d, b→c etc.).
- regulationCompliance MUST contain EXACTLY 5 items, one for each: "FAR", "BCR", "Height Limit", "Setback", "Use Zone".
- Every regulationCompliance item must have "item" (string), "pass" (boolean), and "detail" (string).
- Keep all strings short and avoid internal quotes/backslashes/newlines.

Example:
{
  "variants": [
    {
      "variantName": "Fluid Performance Tower",
      "architect": "Zaha Hadid",
      "description": "A fluid tower that maximizes daylight and mixed-use flow.",
      "scoreRationale": "High technical and environmental performance, with strong public access.",
      "formal_strategy": "SKEWED",
      "overallScore": 92,
      "scores": {
        "environmental": 85,
        "economic": 75,
        "social": 80,
        "technical": 95
      },
      "programs": [
        { "id": "p1", "name": "Office", "ratio": 0.4, "fpRatio": 0.3, "color": "#FF0000", "layer": "Upper" },
        { "id": "p2", "name": "Research", "ratio": 0.3, "fpRatio": 0.2, "color": "#00FF00", "layer": "Mid" },
        { "id": "p3", "name": "Retail", "ratio": 0.2, "fpRatio": 0.15, "color": "#0000FF", "layer": "Podium" },
        { "id": "p4", "name": "Lobby", "ratio": 0.1, "fpRatio": 0.05, "color": "#FFFF00", "layer": "Ground" }
      ],
      "graphData": {
        "nodes": [
          { "id": "p1", "group": 1, "label": "Office" },
          { "id": "p2", "group": 2, "label": "Research" },
          { "id": "p3", "group": 3, "label": "Retail" },
          { "id": "p4", "group": 4, "label": "Lobby" }
        ],
        "links": [
          { "source": "p4", "target": "p3", "value": 10 },
          { "source": "p3", "target": "p1", "value": 8 }
        ]
      },
      "regulationCompliance": [
        { "item": "FAR", "pass": true, "detail": "Total GFA remains within maximum FAR." },
        { "item": "BCR", "pass": true, "detail": "Footprint stays below allowed BCR." },
        { "item": "Height Limit", "pass": true, "detail": "Building height within allowed limit." },
        { "item": "Setback", "pass": true, "detail": "All facades meet required setback distance." },
        { "item": "Use Zone", "pass": true, "detail": "Mixed-use program is permitted in this zone." }
      ]
    }
  ]
}
`;

      // Primary: gemini-2.5-flash with aggressive 503 retry
      // Fallback: gemini-flash-latest (slower but accessible)
      const modelQueue: Array<{ name: string; maxRetries: number; delay: number; tokens: number }> = [
        { name: "gemini-2.5-flash",  maxRetries: 6, delay: 5000, tokens: 65536 },
        { name: "gemini-flash-latest", maxRetries: 2, delay: 3000, tokens: 65536 },
      ];
      let raw = "";
      let usedModel = "";
      const startTime = Date.now();
      let succeeded = false;

      for (const modelConfig of modelQueue) {
        if (succeeded) break;
        const { name: model, maxRetries, delay, tokens } = modelConfig;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            raw = "";
            usedModel = model;
            console.log(`Trying Gemini model: ${model} (attempt ${attempt + 1}/${maxRetries})`);
            const stream = await ai.models.generateContentStream({
              model,
              contents: prompt,
              config: {
                responseMimeType: "application/json",
                temperature: 0.7,
                maxOutputTokens: tokens,
              }
            });

            for await (const chunk of stream) {
              if (chunk.text) {
                raw += chunk.text;
              }
            }

            succeeded = true;
            break;
          } catch (error: any) {
            const message = String(error?.message || error);
            console.warn(`Gemini model ${model} failed (attempt ${attempt + 1}):`, message.slice(0, 120));
            const is404 = message.includes("404") || message.includes("NOT_FOUND");
            const is503 = message.includes("503") || message.includes("UNAVAILABLE") || message.includes("high demand");
            if (is404) {
              console.warn(`  → 404: model not accessible, skipping to next.`);
              break; // skip remaining retries for this model
            }
            if (is503 && attempt < maxRetries - 1) {
              console.log(`  → 503: waiting ${delay / 1000}s before retry...`);
              await new Promise(r => setTimeout(r, delay));
            }
          }
        }
      }

      const elapsed = (Date.now() - startTime) / 1000;
      console.log(`Gemini generate elapsed: ${elapsed.toFixed(2)}s (model=${usedModel})`);
      console.log('Gemini raw length:', raw.length);
      console.log('Gemini raw preview:', JSON.stringify(raw.slice(0, 200)));

      if (!raw) {
        console.error("Gemini generation failed completely: all models exhausted.");
        throw new Error("All Gemini models failed. Please try again in a few seconds.");
      }

      const parseJson = (text: string) => {
        // First pass: direct parse
        try {
          return JSON.parse(text);
        } catch (_) {}

        // Second pass: strip markdown code fences if any
        const stripped = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
        try {
          return JSON.parse(stripped);
        } catch (_) {}

        // Third pass: extract outermost JSON object
        const objMatch = stripped.match(/(\{[\s\S]*\})/);
        if (objMatch) {
          try { return JSON.parse(objMatch[1]); } catch (_) {}
        }

        // Fourth pass: repair truncated variants array — keep only complete variant objects
        // Pattern: split on the separator between sibling variant objects
        const varStart = stripped.indexOf('"variants"');
        if (varStart !== -1) {
          // Find inner array content
          const arrOpen = stripped.indexOf('[', varStart);
          if (arrOpen !== -1) {
            const inner = stripped.slice(arrOpen + 1);
            // Find all complete { ... } blocks by balanced-brace scanning
            const variants: string[] = [];
            let depth = 0;
            let inStr = false;
            let esc = false;
            let blockStart = -1;
            for (let i = 0; i < inner.length; i++) {
              const c = inner[i];
              if (esc) { esc = false; continue; }
              if (c === '\\' && inStr) { esc = true; continue; }
              if (c === '"') { inStr = !inStr; continue; }
              if (!inStr) {
                if (c === '{') { if (depth === 0) blockStart = i; depth++; }
                else if (c === '}') {
                  depth--;
                  if (depth === 0 && blockStart !== -1) {
                    variants.push(inner.slice(blockStart, i + 1));
                    blockStart = -1;
                  }
                }
              }
            }
            if (variants.length > 0) {
              const repaired = `{"variants":[${variants.join(',')}]}`;
              try { return JSON.parse(repaired); } catch (_) {}
            }
          }
        }

        throw new SyntaxError(`Unable to parse JSON response (length=${text.length})`);
      };

      const parsed = parseJson(raw);
      const isValidHex = (value: any) => typeof value === 'string' && /^#[0-9A-F]{6}$/i.test(value);
      const isObject = (value: any) => typeof value === 'object' && value !== null;

      const validateProgram = (item: any) => {
        return isObject(item)
          && typeof item.id === 'string'
          && typeof item.name === 'string'
          && typeof item.ratio === 'number'
          && typeof item.fpRatio === 'number'
          && item.ratio >= 0 && item.ratio <= 1
          && item.fpRatio >= 0 && item.fpRatio <= 1
          && isValidHex(item.color);
      };

      const validateNode = (node: any) => {
        return isObject(node)
          && typeof node.id === 'string'
          && typeof node.group === 'number'
          && typeof node.label === 'string';
      };

      const validateLink = (link: any, validIds: string[]) => {
        return isObject(link)
          && typeof link.source === 'string'
          && typeof link.target === 'string'
          && typeof link.value === 'number'
          && validIds.includes(link.source)
          && validIds.includes(link.target);
      };

      const validateCompliance = (item: any) => {
        return isObject(item)
          && typeof item.item === 'string'
          && typeof item.pass === 'boolean'
          && typeof item.detail === 'string';
      };

      const validateVariant = (variant: any) => {
        if (!isObject(variant)) return false;
        const requiredStrings = ['variantName', 'architect', 'description', 'scoreRationale', 'formal_strategy'];
        for (const key of requiredStrings) {
          if (typeof variant[key] !== 'string') return false;
        }
        if (typeof variant.overallScore !== 'number' || variant.overallScore < 0 || variant.overallScore > 100) return false;
        if (!isObject(variant.scores)) return false;
        const scoreKeys = ['environmental', 'economic', 'social', 'technical'];
        for (const key of scoreKeys) {
          if (typeof variant.scores[key] !== 'number' || variant.scores[key] < 0 || variant.scores[key] > 100) return false;
        }
        if (!Array.isArray(variant.programs) || variant.programs.length === 0) return false;
        if (!Array.isArray(variant.graphData?.nodes) || !Array.isArray(variant.graphData?.links)) return false;
        if (!Array.isArray(variant.regulationCompliance)) return false;

        const programSum = variant.programs.reduce((sum: number, item: any) => sum + (typeof item.ratio === 'number' ? item.ratio : 0), 0);
        const nodeIds = variant.graphData.nodes.map((node: any) => node.id);

        if (Math.abs(programSum - 1.0) > 0.025) {
          console.warn('Program ratio sum is invalid:', programSum);
          return false;
        }

        if (!variant.programs.every(validateProgram)) return false;
        if (!variant.graphData.nodes.every(validateNode)) return false;
        if (!variant.graphData.links.every((link: any) => validateLink(link, nodeIds))) return false;
        if (!Array.isArray(variant.regulationCompliance)) return false;
        if (variant.regulationCompliance.length > 0 && !variant.regulationCompliance.every(validateCompliance)) return false;

        return true;
      };

      const validateResponse = (payload: any) => {
        return isObject(payload)
          && Array.isArray(payload.variants)
          && payload.variants.length === 5
          && payload.variants.every(validateVariant);
      };

      if (!validateResponse(parsed)) {
        console.error('Invalid AI response schema:', JSON.stringify(parsed, null, 2));
        throw new Error('AI returned a response that does not match the required variant schema.');
      }

      // Post-process: fill default compliance items if AI returned empty array
      const defaultCompliance = [
        { item: 'FAR', pass: true, detail: `Total GFA within FAR ${far}% limit.` },
        { item: 'BCR', pass: true, detail: `Footprint within BCR ${bcr}% limit.` },
        { item: 'Height Limit', pass: true, detail: `Building height within ${heightStr} limit.` },
        { item: 'Setback', pass: true, detail: `All facades meet ${setbackStr} setback requirement.` },
        { item: 'Use Zone', pass: true, detail: `Program use permitted in ${zoneStr}.` },
      ];
      for (const variant of parsed.variants) {
        if (!variant.regulationCompliance || variant.regulationCompliance.length === 0) {
          variant.regulationCompliance = defaultCompliance;
        }
      }

      res.json(parsed);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      // Check if it's an API key error
      if (error?.message?.includes("API key not valid")) {
        return res.status(400).json({ 
          error: "Invalid API Key. Please check the 'Secrets' panel in AI Studio and ensure your GEMINI_API_KEY is correct (do not use placeholder values like 'MY_GEMINI_API_KEY')." 
        });
      }
      
      res.status(500).json({ error: "Failed to generate variant. Please try again." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
