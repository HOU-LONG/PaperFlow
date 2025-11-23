import { AnalyzedPaper, LanguageMode } from "../types";

export const generateHtmlReport = (dataList: AnalyzedPaper[], language: LanguageMode) => {
    const title = `PaperFlow Report - ${new Date().toLocaleDateString()}`;
    
    const cardsHtml = dataList.map((data, index) => {
        const content = language === 'en' ? data.content_en : data.content_zh;
        const uniqueId = `card-${index}`;
        
        const formatText = (text: string) => {
            if (!text) return '';
            // Force line breaks before bullets and split
            const safeText = text.replace(/•/g, '\n•');
            return safeText
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => {
                    const isBullet = line.startsWith('•');
                    // Parse markdown bold: **text** -> <strong ...>text</strong>
                    const parsedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a; font-weight: 700;">$1</strong>');
                    // Added leading-loose and mb-3 for better spacing
                    return `<p class="${isBullet ? 'pl-4' : ''} mb-3 leading-loose">${parsedLine}</p>`;
                })
                .join('');
        };
        
        const headerChips = `
            <div class="flex gap-2 mb-4" onclick="event.stopPropagation()">
                <span class="glass-chip">${data.meta.publish_year}</span>
                <span class="glass-chip">${data.meta.journal_venue}</span>
                <span class="glass-chip">${data.meta.parameter_count}</span>
                ${data.meta.github_url ? `
                <a href="${data.meta.github_url}" target="_blank" class="glass-chip" style="color: ${data.is_alive ? '#047857' : '#9ca3af'}; border-color: ${data.is_alive ? '#a7f3d0' : '#e5e7eb'}; background: ${data.is_alive ? 'rgba(236, 253, 245, 0.4)' : ''}">
                    GitHub
                </a>` : ''}
            </div>
        `;

        return `
        <div id="${uniqueId}" class="flip-container mb-12 max-w-5xl mx-auto">
            <div class="flip-inner">
                <!-- FRONT FACE -->
                <div class="flip-face flip-front glass-panel p-8">
                     <div class="relative z-10">
                        ${headerChips}
                        <h2 class="text-3xl font-bold text-slate-800 mb-2" style="background: linear-gradient(to right, #1e293b, #475569); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${data.meta.paper_title}</h2>
                        <div style="display:flex; align-items:center; gap:8px; margin-top:12px; margin-bottom: 32px;">
                            <div style="height:1px; width:30px; background: rgba(148, 163, 184, 0.5);"></div>
                            <p class="text-slate-500" style="font-weight:500; letter-spacing: 0.02em;">${data.meta.authors_team} • <span style="color:#2563eb;">${data.meta.model_name}</span></p>
                        </div>

                        <div class="grid-layout">
                            <div class="visual-content order-2">
                                <div class="image-placeholder" onclick="expandImage(event, '${uniqueId}-img')">
                                    ${data.imageBase64 ? 
                                        `<img id="${uniqueId}-img" src="${data.imageBase64}" style="width:100%; height:100%; object-fit: cover; transition: transform 0.5s;" />` 
                                        : 
                                        `<div style="display:flex; align-items:center; justify-content:center; height: 100%; color: #94a3b8; font-size: 12px;">No Visual Available</div>`
                                    }
                                    <div class="expand-hint">EXPAND</div>
                                </div>
                            </div>

                            <div class="main-content order-1">
                                <div class="section-box etched-glass">
                                    <h3>${language === 'en' ? 'Architecture Spotlight' : '架构亮点'}</h3>
                                    <div style="font-weight: 500;">${formatText(content.model_architecture_desc)}</div>
                                </div>

                                <div class="section-box highlight-box">
                                    <h3 style="color: #4338ca;">${language === 'en' ? 'Key Results' : '核心结论'}</h3>
                                    <div style="font-weight: 500; color: #1e293b;">${formatText(content.key_results)}</div>
                                </div>
                                
                                <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
                                    <button onclick="toggleFlip('${uniqueId}')" class="flip-btn">
                                        ${language === 'en' ? 'Flip for details' : '点击翻转查看详情'} &rarr;
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BACK FACE -->
                <div class="flip-face flip-back glass-panel p-8">
                    <div class="relative z-10">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid rgba(226, 232, 240, 0.5); padding-bottom: 16px;">
                            <h2 style="font-size: 1.25rem; color: #475569; font-weight: 700;">${data.meta.paper_title}</h2>
                            ${headerChips}
                        </div>

                        <div class="section-box">
                            <h3>${language === 'en' ? 'Downstream Tasks' : '下游任务'}</h3>
                            <div style="background: rgba(255,255,255,0.25); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.4); box-shadow: inset 0 1px 4px rgba(0,0,0,0.02);">
                                ${formatText(content.downstream_tasks)}
                            </div>
                        </div>

                        <div class="row-layout">
                            <div class="half-width">
                                <h3>${language === 'en' ? 'Strategy' : '策略'}</h3>
                                <div class="etched-glass" style="padding: 16px; border-radius: 12px;">
                                    <p><strong>Source:</strong> ${content.pretrain_data_source}</p>
                                    <p><strong>Tokenization:</strong> ${content.tokenization_method}</p>
                                    <div style="margin-top: 8px; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 8px;">${formatText(content.pretrain_strategy)}</div>
                                </div>
                            </div>
                            <div class="half-width">
                                <h3>${language === 'en' ? 'Ablation & Failure' : '消融与缺陷'}</h3>
                                <div style="color: #881337; background: rgba(255, 241, 242, 0.3); padding: 16px; border-radius: 12px; border: 1px solid rgba(255, 228, 230, 0.4);">
                                    ${formatText(content.ablation_failure_analysis)}
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 24px; padding-left: 12px; border-left: 2px solid rgba(226, 232, 240, 0.6);">
                            <h3>${language === 'en' ? 'Benchmarks' : '基准测试'}</h3>
                            <div style="font-style: italic; color: #64748b;">${formatText(content.benchmarks_comparisons)}</div>
                        </div>
                        
                        <button onclick="toggleFlip('${uniqueId}')" class="flip-btn" style="position: absolute; bottom: 30px; right: 30px;">
                            &larr; ${language === 'en' ? 'Flip back' : '返回'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            background: radial-gradient(circle at 10% 20%, rgb(239, 246, 255) 0%, rgb(219, 228, 255) 90%);
            margin: 0;
            padding: 60px 20px;
            min-height: 100vh;
        }
        
        /* 3D Flip System */
        .flip-container {
            perspective: 2000px;
            position: relative;
        }
        .flip-inner {
            position: relative;
            width: 100%;
            display: grid;
            grid-template-areas: "stack";
            transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform-style: preserve-3d;
        }
        .flip-container.flipped .flip-inner {
            transform: rotateY(180deg);
        }
        .flip-face {
            grid-area: stack;
            backface-visibility: hidden;
            width: 100%;
        }
        .flip-front { z-index: 2; }
        .flip-back { transform: rotateY(180deg); z-index: 1; }

        /* "Thick Slab" Glassmorphism */
        .glass-panel {
            position: relative;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.45) 100%);
            backdrop-filter: blur(30px) saturate(140%);
            -webkit-backdrop-filter: blur(30px) saturate(140%);
            border-radius: 24px;
            border: 0;
            box-shadow: 0 25px 40px -12px rgba(31, 38, 135, 0.15), 0 10px 15px -3px rgba(31, 38, 135, 0.05);
        }

        /* Highlight Rim (Pseudo) */
        .glass-panel::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 24px;
            padding: 1px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
            z-index: 2;
        }

        /* Inner Volume (Pseudo) */
        .glass-panel::after {
            content: "";
            position: absolute;
            inset: 1px;
            border-radius: 23px;
            box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.5), inset 1px 1px 2px rgba(255, 255, 255, 0.9), inset -1px -1px 2px rgba(0, 0, 0, 0.03);
            pointer-events: none;
            z-index: 2;
        }

        .etched-glass {
            background: rgba(255, 255, 255, 0.3);
            box-shadow: inset 0 2px 6px rgba(0,0,0,0.03);
            border: 1px solid rgba(255, 255, 255, 0.4);
            padding: 20px;
            border-radius: 16px;
        }

        .glass-chip {
            display: inline-block;
            padding: 4px 14px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.5));
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            border-radius: 999px;
            color: #475569;
            margin-right: 8px;
            text-decoration: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.03);
            cursor: default;
        }

        .flip-btn {
            background: rgba(255,255,255,0.6);
            border: 1px solid rgba(255,255,255,0.6);
            padding: 8px 20px;
            border-radius: 99px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #475569;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .flip-btn:hover {
            background: #fff;
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        h2 { font-size: 2.25rem; line-height: 2.5rem; margin: 0; letter-spacing: -0.02em; }
        h3 { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; color: #94a3b8; margin-bottom: 0.75rem; display: block; }
        p { font-size: 0.875rem; color: #334155; margin: 0; }
        .leading-loose { line-height: 1.8; }
        .mb-3 { margin-bottom: 0.75rem; }
        
        .grid-layout { display: grid; grid-template-columns: 1fr; gap: 40px; }
        @media (min-width: 1024px) {
            .grid-layout { grid-template-columns: 1fr 1fr; }
        }
        .section-box { margin-bottom: 24px; }
        .highlight-box { 
            background: linear-gradient(135deg, rgba(239, 246, 255, 0.4), rgba(238, 242, 255, 0.4)); 
            padding: 20px; 
            border-radius: 16px; 
            border: 1px solid rgba(255, 255, 255, 0.6);
            box-shadow: inset 0 0 20px rgba(255,255,255,0.5);
        }
        .row-layout { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 768px) {
            .row-layout { grid-template-columns: 1fr 1fr; }
        }
        .image-placeholder {
            background-color: rgba(255,255,255,0.3);
            border-radius: 16px;
            aspect-ratio: 3/4;
            width: 100%;
            border: 1px solid rgba(255,255,255,0.6);
            overflow: hidden;
            cursor: pointer;
            padding: 8px;
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
            position: relative;
        }
        .expand-hint {
            position: absolute;
            bottom: 15px; left: 50%; transform: translateX(-50%);
            background: rgba(0,0,0,0.3); color: white;
            padding: 4px 12px; border-radius: 20px;
            font-size: 10px; font-weight: bold;
            backdrop-filter: blur(4px);
            opacity: 0; transition: opacity 0.3s;
        }
        .image-placeholder:hover .expand-hint { opacity: 1; }
        .image-placeholder img:hover {
            transform: scale(1.05);
        }
        .max-w-5xl { max-width: 72rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .mb-8 { margin-bottom: 2rem; }
        .p-8 { padding: 2.5rem; }
        .pl-4 { padding-left: 1rem; }
        
        /* Lightbox */
        #lightbox {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.7);
            z-index: 9999;
            align-items: center;
            justify-content: center;
            padding: 40px;
            backdrop-filter: blur(12px);
        }
        #lightbox img {
            max-width: 90%;
            max-height: 90%;
            border-radius: 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
    </style>
</head>
<body>
    <div style="text-align: center; margin-bottom: 60px;">
        <h1 style="font-weight: 200; color: #475569; letter-spacing: 0.2em; text-transform: uppercase; font-size: 14px;">PaperFlow Bilingual Report</h1>
    </div>
    ${cardsHtml}
    
    <div id="lightbox" onclick="this.style.display='none'">
        <img id="lightbox-img" src="" />
    </div>

    <script>
        function toggleFlip(elementId) {
            const el = document.getElementById(elementId);
            if(el) el.classList.toggle('flipped');
        }
        function expandImage(event, imgId) {
            event.stopPropagation();
            const img = document.getElementById(imgId);
            if (!img) return;
            const lightbox = document.getElementById('lightbox');
            const lightboxImg = document.getElementById('lightbox-img');
            lightboxImg.src = img.src;
            lightbox.style.display = 'flex';
        }
    </script>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PaperFlow_Liuli_Report_${language}_${new Date().getTime()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};