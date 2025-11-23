import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalyzedPaper } from "../types";
import { v4 as uuidv4 } from 'uuid';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs';

// Schema Definition matching the prompt's requirements
const analysisSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        meta: {
            type: Type.OBJECT,
            properties: {
                model_name: { type: Type.STRING },
                publish_year: { type: Type.STRING },
                journal_venue: { type: Type.STRING },
                authors_team: { type: Type.STRING },
                parameter_count: { type: Type.STRING },
                paper_title: { type: Type.STRING },
                github_url: { type: Type.STRING, nullable: true },
            },
            required: ["model_name", "publish_year", "paper_title"]
        },
        content_en: {
            type: Type.OBJECT,
            properties: {
                downstream_tasks: { type: Type.STRING, description: "Use bullet points •, grouped by task categories" },
                pretrain_data_source: { type: Type.STRING },
                tokenization_method: { type: Type.STRING },
                pretrain_strategy: { type: Type.STRING, description: "Use bullet points •" },
                finetuning_eval_protocol: { type: Type.STRING },
                model_architecture_desc: { type: Type.STRING },
                benchmarks_comparisons: { type: Type.STRING },
                ablation_failure_analysis: { type: Type.STRING, description: "Use bullet points •" },
                key_results: { type: Type.STRING },
            },
            required: ["downstream_tasks", "pretrain_strategy", "ablation_failure_analysis", "key_results"]
        },
        content_zh: {
            type: Type.OBJECT,
            properties: {
                downstream_tasks: { type: Type.STRING, description: "Translated to Chinese. Use bullet points •, grouped by task categories" },
                pretrain_data_source: { type: Type.STRING },
                tokenization_method: { type: Type.STRING },
                pretrain_strategy: { type: Type.STRING, description: "Translated to Chinese. Use bullet points •" },
                finetuning_eval_protocol: { type: Type.STRING },
                model_architecture_desc: { type: Type.STRING },
                benchmarks_comparisons: { type: Type.STRING },
                ablation_failure_analysis: { type: Type.STRING, description: "Translated to Chinese. Use bullet points •" },
                key_results: { type: Type.STRING },
            },
            required: ["downstream_tasks", "pretrain_strategy", "ablation_failure_analysis", "key_results"]
        }
    }
};

const SYSTEM_INSTRUCTION = `
You are an expert AI researcher and Technical Analyst.
Your task is to analyze the provided academic paper (PDF) and extract a structured knowledge report.

Specific Formatting Rules:
1.  **Downstream Tasks**: Group tasks by category (e.g., Classification, Generation, Reasoning). Use bullet points (•). **Each bullet point must be on a new line.**
2.  **Ablation & Failure Analysis**: Do NOT use a wall of text. Use bullet points (•) to list specific failures, instability issues, or negative results. **Each bullet point must be on a new line.**
3.  **Bilingual Output**: You must provide ALL content fields in both English (content_en) and professional Chinese (content_zh).
4.  **GitHub**: If a GitHub URL is mentioned, extract it.
5.  **Emphasis**: Use standard Markdown bold syntax (**text**) for key terms or metrics within the summaries.

Constraint: Ensure the "downstream_tasks" and "ablation_failure_analysis" fields use the bullet point format strictly with line breaks.
`;

// Helper to render the first page of PDF as an image
const generatePdfPreview = async (arrayBuffer: ArrayBuffer): Promise<string | null> => {
    try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1); // Render Page 1
        
        const scale = 2.0; // High quality
        const viewport = page.getViewport({ scale });
        
        // Create a canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) return null;

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // Export to JPEG base64 (smaller than PNG)
        return canvas.toDataURL('image/jpeg', 0.8);
    } catch (e) {
        console.error("Error generating PDF preview:", e);
        return null;
    }
};

export const analyzePaper = async (file: File, apiKey: string): Promise<AnalyzedPaper> => {
    const genAI = new GoogleGenAI({ apiKey });
    
    // 1. Prepare File Data
    const arrayBuffer = await file.arrayBuffer();
    
    // 2. Parallel: Generate Preview Image & Encode for Gemini
    const previewPromise = generatePdfPreview(arrayBuffer);
    
    const base64Promise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(new Blob([arrayBuffer]));
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
    });

    const [imageBase64, base64Data] = await Promise.all([previewPromise, base64Promise]);

    try {
        // 3. Call Gemini
        // Using gemini-3-pro-preview for complex STEM tasks as per guidelines
        const response = await genAI.models.generateContent({
            model: 'gemini-3-pro-preview',
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: 'application/json',
                responseSchema: analysisSchema,
            },
            contents: [
                {
                    parts: [
                        {
                            inlineData: {
                                mimeType: file.type,
                                data: base64Data
                            }
                        },
                        {
                            text: "Analyze this paper and generate the bilingual report."
                        }
                    ]
                }
            ]
        });

        const text = response.text;
        if (!text) throw new Error("No response from Gemini");

        const jsonResult = JSON.parse(text);
        
        // Mock GitHub Alive check (Real check requires CORS proxy usually)
        const isAlive = !!jsonResult.meta.github_url; 

        return {
            id: uuidv4(),
            fileName: file.name,
            meta: jsonResult.meta,
            content_en: jsonResult.content_en,
            content_zh: jsonResult.content_zh,
            is_alive: isAlive,
            imageBase64: imageBase64, // Store the generated preview
            processedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error("Analysis Error:", error);
        throw error;
    }
};