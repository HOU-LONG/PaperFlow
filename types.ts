export interface PaperMeta {
    model_name: string;
    publish_year: string;
    journal_venue: string;
    authors_team: string;
    parameter_count: string;
    paper_title: string;
    github_url: string | null;
}

export interface PaperContent {
    downstream_tasks: string;
    pretrain_data_source: string;
    tokenization_method: string;
    pretrain_strategy: string;
    finetuning_eval_protocol: string;
    model_architecture_desc: string;
    benchmarks_comparisons: string;
    ablation_failure_analysis: string;
    key_results: string;
}

export interface AnalyzedPaper {
    id: string;
    fileName: string;
    meta: PaperMeta;
    content_en: PaperContent;
    content_zh: PaperContent;
    is_alive: boolean; // Mocked GitHub status
    imageBase64: string | null; // The extracted visual (Page 1 snapshot)
    processedAt: string;
}

export type LanguageMode = 'en' | 'zh';

export enum ProcessingStatus {
    IDLE = 'IDLE',
    UPLOADING = 'UPLOADING',
    ANALYZING = 'ANALYZING',
    COMPLETE = 'COMPLETE',
    ERROR = 'ERROR'
}