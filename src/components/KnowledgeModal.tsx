import { useState, useEffect } from 'react';

interface KnowledgeArticle {
  folder: string;
  filename: string;
  title: string;
  date: string;
}

interface KnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KnowledgeModal({ isOpen, onClose }: KnowledgeModalProps) {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'finance'>('ai');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [articleContent, setArticleContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const openInNewTab = () => {
    if (selectedArticle) {
      window.open(`/knowledge/${selectedArticle.folder}/${selectedArticle.filename}`, '_blank');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchArticles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedArticle(null);
      setArticleContent('');
    }
  }, [isOpen]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/knowledge');
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (err) {
      console.error('Failed to fetch knowledge articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleContent = async (article: KnowledgeArticle) => {
    setLoadingContent(true);
    setSelectedArticle(article);
    try {
      const res = await fetch(`/api/knowledge/${article.folder}/${article.filename}`);
      if (res.ok) {
        const html = await res.text();
        setArticleContent(html);
      }
    } catch (err) {
      console.error('Failed to fetch article content:', err);
      setArticleContent('<p>Failed to load article</p>');
    } finally {
      setLoadingContent(false);
    }
  };

  const aiArticles = articles.filter((a) => a.folder === 'ai');
  const financeArticles = articles.filter((a) => a.folder === 'finance');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-black/30 hidden md:block" onClick={onClose} />

      <div className={`relative bg-white md:rounded-2xl border-0 md:border border-[#dadce0] shadow-2xl overflow-hidden flex flex-col transition-all duration-200
        ${isFullscreen 
          ? 'w-full h-full md:max-w-none md:max-h-none md:rounded-none md:m-0' 
          : 'w-full h-full md:h-auto md:max-w-6xl md:max-h-[90vh]'
        }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#dadce0] shrink-0">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-[#f9ab00]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
            </svg>
            <h2 className="text-lg font-semibold text-[#3c4043] tracking-wide">Knowledge Base</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Open in new tab button */}
            {selectedArticle && (
              <button
                onClick={openInNewTab}
                className="hidden md:flex w-8 h-8 items-center justify-center rounded-full hover:bg-[#f1f3f4] transition-colors text-[#70757a] hover:text-[#3c4043]"
                title="Open in new tab"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            )}
            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-full hover:bg-[#f1f3f4] transition-colors text-[#70757a] hover:text-[#3c4043]"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
            {/* Close button */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f1f3f4] transition-colors text-[#70757a] hover:text-[#3c4043]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar with tabs and articles */}
          <div className={`${selectedArticle ? 'hidden md:flex md:w-72 border-r border-[#dadce0]' : 'flex-1'} flex flex-col shrink-0 transition-all`}>
            {/* Tabs */}
            <div className="flex border-b border-[#dadce0] px-4">
              <button
                onClick={() => { setActiveTab('ai'); setSelectedArticle(null); }}
                className={`px-4 py-3 text-sm font-medium transition-colors relative
                  ${activeTab === 'ai'
                    ? 'text-[#1a73e8]'
                    : 'text-[#70757a] hover:text-[#3c4043]'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12zM12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z"/>
                  </svg>
                  AI
                </span>
                {activeTab === 'ai' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a73e8]" />
                )}
              </button>
              <button
                onClick={() => { setActiveTab('finance'); setSelectedArticle(null); }}
                className={`px-4 py-3 text-sm font-medium transition-colors relative
                  ${activeTab === 'finance'
                    ? 'text-[#1a73e8]'
                    : 'text-[#70757a] hover:text-[#3c4043]'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                  </svg>
                  Finance
                </span>
                {activeTab === 'finance' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a73e8]" />
                )}
              </button>
            </div>

            {/* Articles list */}
            <div className="overflow-y-auto flex-1 p-4">
              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-[#e8f0fe] border-t-[#1a73e8] rounded-full animate-spin" />
                  <p className="text-xs text-[#70757a] mt-2">Loading...</p>
                </div>
              )}

              {!loading && (activeTab === 'ai' ? aiArticles : financeArticles).length === 0 && (
                <div className="text-center py-8">
                  <svg className="w-10 h-10 mx-auto text-[#dadce0] mb-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                  </svg>
                  <p className="text-sm text-[#70757a]">No articles yet</p>
                  <p className="text-xs text-[#9aa0a6] mt-1">
                    Add HTML files to public/knowledge/{activeTab}/
                  </p>
                </div>
              )}

              {!loading && (activeTab === 'ai' ? aiArticles : financeArticles).map((article) => (
                <button
                  key={`${article.folder}-${article.filename}`}
                  onClick={() => fetchArticleContent(article)}
                  className={`w-full text-left p-3 rounded-lg transition-colors mb-2 group
                    ${selectedArticle?.filename === article.filename
                      ? 'bg-[#e8f0fe] border border-[#1a73e8]/20'
                      : 'hover:bg-[#f8f9fa] border border-transparent'
                    }`}
                >
                  <div className={`text-sm font-medium mb-1 transition-colors
                    ${selectedArticle?.filename === article.filename
                      ? 'text-[#1a73e8]'
                      : 'text-[#3c4043] group-hover:text-[#1a73e8]'
                    }`}>
                    {article.title}
                  </div>
                  <div className="text-xs text-[#70757a]">
                    {formatDate(article.date)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Article content viewer */}
          {selectedArticle && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Article header */}
              <div className="px-6 py-4 border-b border-[#dadce0] bg-[#f8f9fa]">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="flex md:hidden items-center gap-1 text-xs text-[#70757a] hover:text-[#1a73e8] mb-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to list
                </button>
                <h3 className="text-base font-semibold text-[#3c4043]">{selectedArticle.title}</h3>
                <p className="text-xs text-[#70757a] mt-1">{formatDate(selectedArticle.date)}</p>
              </div>

              {/* Article content */}
              <div className="flex-1 overflow-auto">
                {loadingContent ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="inline-block w-8 h-8 border-4 border-[#e8f0fe] border-t-[#1a73e8] rounded-full animate-spin" />
                  </div>
                ) : (
                  <iframe
                    srcDoc={articleContent}
                    className="w-full h-full border-0"
                    title={selectedArticle.title}
                    sandbox="allow-same-origin"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
