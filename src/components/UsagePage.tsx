import { useState, useEffect, useMemo } from 'react';

const API = import.meta.env.VITE_API_URL || '';

interface UsageGroup {
  key: string;
  cost: number;
  tokens: number;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  count: number;
}

interface UsageData {
  totalCost: number;
  totalTokens: number;
  totalRecords: number;
  groups: UsageGroup[];
}

interface ChartData {
  timeKeys: string[];
  dimensions: string[];
  buckets: Record<string, Record<string, number>>;
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

type Period = 'today' | 'week' | 'month' | 'all';
type GroupBy = 'model' | 'agent' | 'provider';

// Color palette for stacked bars
const COLORS = [
  '#1a73e8', '#f9ab00', '#34a853', '#ea4335', '#9334e6',
  '#ff6d01', '#46bdc6', '#7baaf7', '#f07b72', '#fdd663',
  '#57bb8a', '#a142f4', '#24c1e0', '#e37400', '#185abc',
];

function getDateRange(period: Period): { from?: string; to?: string } {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  if (period === 'today') return { from: todayStr + 'T00:00:00Z', to: todayStr + 'T23:59:59Z' };
  if (period === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    return { from: d.toISOString().slice(0, 10) + 'T00:00:00Z' };
  }
  if (period === 'month') {
    return { from: todayStr.slice(0, 7) + '-01T00:00:00Z' };
  }
  return {};
}

export default function UsagePage({ onBack }: { onBack: () => void }) {
  const [period, setPeriod] = useState<Period>('month');
  const [chartGroupBy, setChartGroupBy] = useState<GroupBy>('model');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [allData, setAllData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<{ time: string; dim: string; tokens: number; x: number; y: number } | null>(null);

  // Fetch chart data
  useEffect(() => {
    const range = getDateRange(period);
    const params = new URLSearchParams();
    if (range.from) params.set('from', range.from);
    if (range.to) params.set('to', range.to);
    params.set('groupBy', chartGroupBy);
    params.set('period', period);
    fetch(`${API}/api/usage/chart?${params}`)
      .then(r => r.json())
      .then(setChartData)
      .catch(console.error);
  }, [period, chartGroupBy]);

  // Fetch all-time totals
  useEffect(() => {
    fetch(`${API}/api/usage?groupBy=day`)
      .then(r => r.json())
      .then(d => { setAllData(d); setLoading(false); })
      .catch(console.error);
  }, []);

  const summaryCards = useMemo(() => {
    if (!allData) return [];
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStr = weekStart.toISOString().slice(0, 10);
    const monthStr = todayStr.slice(0, 7);

    let todayTokens = 0, weekTokens = 0, monthTokens = 0;
    for (const g of allData.groups) {
      if (g.key === todayStr) todayTokens += g.tokens;
      if (g.key >= weekStr) weekTokens += g.tokens;
      if (g.key >= monthStr + '-01') monthTokens += g.tokens;
    }
    return [
      { label: 'Today', tokens: todayTokens },
      { label: 'This Week', tokens: weekTokens },
      { label: 'This Month', tokens: monthTokens },
      { label: 'All Time', tokens: allData.totalTokens },
    ];
  }, [allData]);

  // Compute chart rendering
  const chartRender = useMemo(() => {
    if (!chartData || chartData.timeKeys.length === 0) return null;
    const { timeKeys, dimensions, buckets } = chartData;
    // Max stacked total
    let maxTotal = 0;
    for (const t of timeKeys) {
      let sum = 0;
      for (const d of dimensions) sum += (buckets[t]?.[d] || 0);
      if (sum > maxTotal) maxTotal = sum;
    }
    if (maxTotal === 0) maxTotal = 1;
    return { timeKeys, dimensions, buckets, maxTotal };
  }, [chartData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full bg-[#f9ab00] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#f1f3f4] transition-colors"
        >
          <svg className="w-5 h-5 text-[#3c4043]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[#3c4043]">Usage</h1>
          <p className="text-xs text-[#70757a]">OpenClaw API usage analytics</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {summaryCards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-[#dadce0] p-4">
            <p className="text-[10px] font-semibold text-[#70757a] uppercase tracking-wider mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-[#f9ab00]">{formatTokens(c.tokens)}</p>
            <p className="text-xs text-[#70757a] mt-0.5">tokens</p>
          </div>
        ))}
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-4">
        {(['today', 'week', 'month', 'all'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              period === p
                ? 'bg-[#f9ab00] text-white'
                : 'bg-white border border-[#dadce0] text-[#70757a] hover:bg-[#f8f9fa]'
            }`}
          >
            {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl border border-[#dadce0] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#3c4043]">
            {period === 'today' ? 'Hourly' : 'Daily'} Token Usage
          </h2>
          <div className="flex gap-1">
            {(['model', 'agent', 'provider'] as GroupBy[]).map(g => (
              <button
                key={g}
                onClick={() => setChartGroupBy(g)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                  chartGroupBy === g
                    ? 'bg-[#e8f0fe] text-[#1a73e8]'
                    : 'text-[#70757a] hover:bg-[#f1f3f4]'
                }`}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {!chartRender ? (
          <p className="text-xs text-[#70757a] py-4 text-center">No data for this period</p>
        ) : (
          <>
            {/* Desktop: Stacked vertical bar chart */}
            <div className="hidden md:block relative">
              {/* Y axis labels */}
              <div className="flex">
                <div className="w-12 shrink-0 flex flex-col justify-between text-[10px] text-[#70757a] text-right pr-2" style={{ height: 200 }}>
                  <span>{formatTokens(chartRender.maxTotal)}</span>
                  <span>{formatTokens(chartRender.maxTotal / 2)}</span>
                  <span>0</span>
                </div>
                {/* Chart area */}
                <div className="flex-1 relative" style={{ height: 200 }} onMouseLeave={() => setHoveredBar(null)}>
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-b border-[#f1f3f4]" />
                    <div className="border-b border-[#f1f3f4]" />
                    <div className="border-b border-[#f1f3f4]" />
                  </div>
                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end gap-[2px]">
                    {chartRender.timeKeys.map((t) => {
                      let total = 0;
                      for (const d of chartRender.dimensions) total += (chartRender.buckets[t]?.[d] || 0);
                      const barWidth = `${100 / chartRender.timeKeys.length}%`;
                      let yOffset = 0;
                      return (
                        <div key={t} className="relative flex flex-col-reverse" style={{ width: barWidth, height: '100%' }}>
                          {chartRender.dimensions.map((d, i) => {
                            const val = chartRender.buckets[t]?.[d] || 0;
                            if (val === 0) return null;
                            const pct = (val / chartRender.maxTotal) * 100;
                            const bottom = (yOffset / chartRender.maxTotal) * 100;
                            yOffset += val;
                            return (
                              <div
                                key={d}
                                className="absolute w-full cursor-pointer transition-opacity hover:opacity-80"
                                style={{
                                  bottom: `${bottom}%`,
                                  height: `${Math.max(pct, 0.5)}%`,
                                  backgroundColor: COLORS[i % COLORS.length],
                                  borderRadius: yOffset === total ? '2px 2px 0 0' : '0',
                                }}
                                onMouseEnter={(e) => {
                                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                                  setHoveredBar({ time: t, dim: d, tokens: val, x: rect.left + rect.width / 2, y: rect.top });
                                }}
                              />
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                  {/* Tooltip */}
                  {hoveredBar && (
                    <div
                      className="fixed z-50 bg-[#3c4043] text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
                      style={{ left: hoveredBar.x, top: hoveredBar.y - 40, transform: 'translateX(-50%)' }}
                    >
                      <span className="font-medium">{hoveredBar.dim}</span>: {formatTokens(hoveredBar.tokens)} tokens
                      <div className="text-[10px] text-[#9aa0a6]">{period === 'today' ? hoveredBar.time.slice(11) + ':00' : hoveredBar.time}</div>
                    </div>
                  )}
                </div>
              </div>
              {/* X axis labels */}
              <div className="flex ml-12">
                {chartRender.timeKeys.map((t, i) => {
                  const show = chartRender.timeKeys.length <= 14 || i % Math.ceil(chartRender.timeKeys.length / 10) === 0;
                  return (
                    <div key={t} className="text-[10px] text-[#70757a] text-center" style={{ width: `${100 / chartRender.timeKeys.length}%` }}>
                      {show ? (period === 'today' ? t.slice(11) + 'h' : t.slice(5)) : ''}
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-3">
                {chartRender.dimensions.map((d, i) => (
                  <div key={d} className="flex items-center gap-1.5 text-[11px] text-[#3c4043]">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {d}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile: Horizontal bar chart (aggregated by group dimension) */}
            <div className="md:hidden">
              {(() => {
                // Aggregate tokens by dimension across all time keys
                const agg: Record<string, number> = {};
                for (const t of chartRender.timeKeys) {
                  for (const d of chartRender.dimensions) {
                    agg[d] = (agg[d] || 0) + (chartRender.buckets[t]?.[d] || 0);
                  }
                }
                const sorted = Object.entries(agg).sort((a, b) => b[1] - a[1]);
                const maxVal = sorted.length > 0 ? sorted[0][1] : 1;
                return (
                  <div className="space-y-2">
                    {sorted.map(([label, tokens], i) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="w-24 shrink-0 text-[11px] text-[#3c4043] font-medium truncate text-right">{label}</span>
                        <div className="flex-1 h-6 bg-[#f1f3f4] rounded overflow-hidden">
                          <div
                            className="h-full rounded transition-all"
                            style={{
                              width: `${Math.max((tokens / maxVal) * 100, 1)}%`,
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                        </div>
                        <span className="w-14 shrink-0 text-[11px] text-[#70757a] font-semibold text-right">{formatTokens(tokens)}</span>
                      </div>
                    ))}
                    {sorted.length === 0 && (
                      <p className="text-xs text-[#70757a] py-4 text-center">No data</p>
                    )}
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
