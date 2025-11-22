import React, { useState } from 'react';
import { AnalyzedPaper, LanguageMode } from '../types';

interface GlassCardProps {
    data: AnalyzedPaper;
    language: LanguageMode;
}

const GlassCard: React.FC<GlassCardProps> = ({ data, language }) => {
    const content = language === 'en' ? data.content_en : data.content_zh;
    const [isFlipped, setIsFlipped] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Helper to render bullet points with airy spacing
    const renderFormattedText = (text: string) => {
        if (!text) return null;
        
        // Safety: Ensure bullet points force a newline if the model missed it
        // Then split by newline
        const safeText = text.replace(/•/g, '\n•');
        
        const lines = safeText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        return (
            <div className="space-y-3">
                {lines.map((line, idx) => (
                    <p key={idx} className={`leading-loose text-sm ${line.startsWith('•') ? 'pl-4' : ''}`}>
                        {line}
                    </p>
                ))}
            </div>
        );
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const stopProp = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    // Header Component used on both sides
    const HeaderChips = () => (
        <div className="flex flex-wrap gap-3 mb-4" onClick={stopProp}>
            <span className="glass-chip px-3 py-1 text-xs font-bold rounded-full text-slate-600 uppercase tracking-wider shadow-sm">
                {data.meta.publish_year}
            </span>
            <span className="glass-chip px-3 py-1 text-xs font-bold rounded-full text-slate-600 uppercase tracking-wider shadow-sm">
                {data.meta.journal_venue}
            </span>
            <span className="glass-chip px-3 py-1 text-xs font-bold rounded-full text-slate-600 uppercase tracking-wider shadow-sm">
                {data.meta.parameter_count}
            </span>
            {data.meta.github_url && (
                <a 
                    href={data.meta.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`glass-chip px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider transition-all shadow-sm hover:scale-105 ${
                        data.is_alive 
                            ? 'text-emerald-700 border-emerald-200/50 bg-emerald-50/30' 
                            : 'text-gray-400'
                    }`}
                >
                    GitHub {data.is_alive ? 'Available' : 'Unavailable'}
                </a>
            )}
        </div>
    );

    return (
        <div className={`flip-container mb-10 w-full max-w-5xl mx-auto ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
            <div className="flip-inner">
                
                {/* ================= FRONT FACE ================= */}
                <div className="flip-face flip-front glass-panel p-6 md:p-8 text-slate-800 group">
                    
                     {/* Decorative Orbs (Front Only) */}
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-300/20 rounded-full blur-[80px] pointer-events-none mix-blend-overlay z-[3]" />

                    {/* Header */}
                    <div className="relative z-10 mb-6">
                        <HeaderChips />
                        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 mb-3 drop-shadow-sm">
                            {data.meta.paper_title}
                        </h2>
                        <div className="flex items-center gap-2">
                             <div className="h-px w-8 bg-slate-400/50"></div>
                             <p className="text-sm text-slate-500 font-medium tracking-wide">
                                {data.meta.authors_team} • <span className="text-blue-600/80">{data.meta.model_name}</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                        {/* Visual Abstract */}
                        <div className="lg:col-span-5 order-2 lg:order-1">
                            <div 
                                className="w-full aspect-[3/4] rounded-2xl overflow-hidden relative group cursor-pointer p-2 bg-white/30 border border-white/60 shadow-xl backdrop-blur-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (data.imageBase64) setIsExpanded(true);
                                }}
                            >
                                <div className="w-full h-full relative rounded-xl overflow-hidden">
                                     {data.imageBase64 ? (
                                        <>
                                            <img 
                                                src={data.imageBase64} 
                                                alt="Paper Visual" 
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter contrast-105" 
                                            />
                                            <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors duration-300" />
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs p-4 text-center bg-slate-100/50">
                                            No Preview Available
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/30 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    Expand
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-400 text-center tracking-widest uppercase opacity-70 mt-2">
                                {language === 'en' ? 'Click image to expand' : '点击图片放大'}
                            </div>
                        </div>

                        {/* Key Highlights */}
                        <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
                            {/* Architecture Spotlight */}
                            <div className="etched-glass p-5 rounded-2xl">
                                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                    {language === 'en' ? 'Architecture Spotlight' : '架构亮点'}
                                </h3>
                                <div className="text-slate-700 font-medium">
                                    {renderFormattedText(content.model_architecture_desc)}
                                </div>
                            </div>

                            {/* Key Results */}
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/40 to-indigo-50/40 border border-white/60 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)]">
                                <h3 className="text-xs font-extrabold text-indigo-400/80 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                     {language === 'en' ? 'Key Results & Takeaways' : '核心结论'}
                                </h3>
                                <div className="text-slate-800 font-medium">
                                    {renderFormattedText(content.key_results)}
                                </div>
                            </div>
                            
                            <div className="flex justify-end mt-4">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 animate-pulse">
                                    {language === 'en' ? 'Flip for details' : '点击翻转查看详情'} &rarr;
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= BACK FACE ================= */}
                <div className="flip-face flip-back glass-panel p-6 md:p-8 text-slate-800">
                     {/* Decorative Orbs (Back Only - Different Colors) */}
                     <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-violet-300/20 rounded-full blur-[80px] pointer-events-none mix-blend-overlay z-[3]" />

                    {/* Mini Header */}
                    <div className="flex items-center justify-between mb-6 border-b border-slate-200/50 pb-4 relative z-10">
                         <h2 className="text-xl font-bold text-slate-600">
                            {data.meta.paper_title.substring(0, 40)}...
                        </h2>
                        <HeaderChips />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                         {/* Downstream Tasks */}
                         <div className="col-span-1 md:col-span-2">
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-3 pl-2">
                                {language === 'en' ? 'Downstream Tasks Map' : '下游任务梳理'}
                            </h3>
                            <div className="text-sm text-slate-700 bg-white/20 p-5 rounded-2xl border border-white/40 shadow-inner backdrop-blur-sm">
                                {renderFormattedText(content.downstream_tasks)}
                            </div>
                        </div>

                         {/* Strategy */}
                        <div>
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-3 pl-1">
                                {language === 'en' ? 'Data & Strategy' : '数据与策略'}
                            </h3>
                            <div className="etched-glass p-4 rounded-xl text-xs text-slate-600 space-y-3">
                                <p><strong className="text-slate-800 block mb-0.5">Source:</strong> {content.pretrain_data_source}</p>
                                <p><strong className="text-slate-800 block mb-0.5">Tokenization:</strong> {content.tokenization_method}</p>
                                <div className="pt-2 border-t border-slate-200/50">
                                    <strong className="text-slate-800 block mb-1">Strategy:</strong>
                                    {renderFormattedText(content.pretrain_strategy)}
                                </div>
                            </div>
                        </div>

                        {/* Failures */}
                        <div>
                            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-3 pl-1">
                                {language === 'en' ? 'Ablation & Failure' : '消融与缺陷分析'}
                            </h3>
                            <div className="text-xs text-rose-800/80 bg-rose-50/20 p-4 rounded-xl border border-rose-100/40 shadow-sm h-full">
                                {renderFormattedText(content.ablation_failure_analysis)}
                            </div>
                        </div>
                        
                        {/* Benchmarks */}
                        <div className="col-span-1 md:col-span-2 pl-2 border-l-2 border-slate-200/50 mt-2">
                             <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-2">
                                {language === 'en' ? 'Benchmarks' : '基准测试'}
                            </h3>
                            <div className="text-sm text-slate-600 leading-loose italic">
                                {renderFormattedText(content.benchmarks_comparisons)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="absolute bottom-8 right-8 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 animate-pulse z-10">
                         &larr; {language === 'en' ? 'Flip back' : '返回正面'}
                    </div>
                </div>
            </div>

            {/* Lightbox (Outside Flip Inner to prevent 3D issues) */}
            {isExpanded && data.imageBase64 && (
                <div 
                    className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(false);
                    }}
                >
                     <div className="max-w-6xl max-h-[90vh] w-full bg-transparent rounded-2xl overflow-hidden flex items-center justify-center p-4 relative">
                            <div className="absolute top-4 right-4 text-white/80 text-sm bg-black/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 cursor-pointer hover:bg-black/40 transition">
                                Close
                            </div>
                             <img 
                                src={data.imageBase64} 
                                alt="Architecture" 
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl drop-shadow-2xl"
                             />
                     </div>
                </div>
            )}
        </div>
    );
};

export default GlassCard;