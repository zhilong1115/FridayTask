import { useState, useEffect, useMemo } from 'react';

const API = import.meta.env.VITE_API_URL || '';

interface ChartData {
  timeKeys: string[];
  dimensions: string[];
  buckets: Record<string, Record<string, number>>;
  billableBuckets: Record<string, Record<string, number>>;
  cacheBuckets: Record<string, Record<string, number>>;
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

type Period = 'day' | 'week' | 'month' | 'year';
type GroupBy = 'none' | 'model' | 'agent' | 'provider';
type TokenMode = 'billable' | 'cache' | 'all';

const COLORS = [
  '#f9ab00', '#1a73e8', '#34a853', '#ea4335', '#9334e6',
  '#ff6d01', '#46bdc6', '#7baaf7', '#f07b72', '#fdd663',
  '#57bb8a', '#a142f4', '#24c1e0', '#e37400', '#185abc',
];

const BILLABLE_COLOR = '#f9ab00';
const CACHE_COLOR = '#c4c4c4';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getDateRange(period: Period, offset: number): { from: string; to: string } {
  const now = new Date();
  if (period === 'day') {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
    return { from: start.toISOString(), to: end.toISOString() };
  }
  if (period === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay() + offset * 7);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 6, 23, 59, 59);
    return { from: start.toISOString(), to: end.toISOString() };
  }
  if (period === 'month') {
    const m = now.getMonth() + offset;
    const y = now.getFullYear();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59);
    return { from: start.toISOString(), to: end.toISOString() };
  }
  // year
  const yr = now.getFullYear() + offset;
  const start = new Date(yr, 0, 1);
  const end = new Date(yr, 11, 31, 23, 59, 59);
  return { from: start.toISOString(), to: end.toISOString() };
}

function getPeriodLabel(period: Period, offset: number): string {
  const now = new Date();
  if (period === 'day') {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    return `${DAYS[d.getDay()]}, ${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`;
  }
  if (period === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay() + offset * 7);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 6);
    return `${SHORT_MONTHS[start.getMonth()]} ${start.getDate()} – ${SHORT_MONTHS[end.getMonth()]} ${end.getDate()}`;
  }
  if (period === 'month') {
    const m = now.getMonth() + offset;
    const d = new Date(now.getFullYear(), m, 1);
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  return String(now.getFullYear() + offset);
}

export default function UsagePage({ onBack }: { onBack: () => void }) {
  const [period, setPeriod] = useState<Period>('month');
  const [offset, setOffset] = useState(0);
  const [chartGroupBy, setChartGroupBy] = useState<GroupBy>('model');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<{ time: string; dim: string; tokens: number; x: number; y: number } | null>(null);
  const [tokenMode, setTokenMode] = useState<TokenMode>('billable');

  // Reset offset when period changes
  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    setOffset(0);
  };

  // Fetch chart data
  useEffect(() => {
    setLoading(true);
    const range = getDateRange(period, offset);
    const params = new URLSearchParams();
    params.set('from', range.from);
    params.set('to', range.to);
    params.set('groupBy', chartGroupBy === 'none' ? 'model' : chartGroupBy);
    params.set('period', period);
    fetch(`${API}/api/usage/chart?${params}`)
      .then(r => r.json())
      .then(d => { setChartData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period, offset, chartGroupBy]);

  // Summary: billable + cache from current chart data
  const summary = useMemo(() => {
    if (!chartData) return { billable: 0, cache: 0 };
    let billable = 0, cache = 0;
    for (const t of chartData.timeKeys) {
      for (const d of chartData.dimensions) {
        billable += (chartData.billableBuckets[t]?.[d] || 0);
        cache += (chartData.cacheBuckets[t]?.[d] || 0);
      }
    }
    return { billable, cache };
  }, [chartData]);

  // Select which buckets to use based on tokenMode
  const activeBuckets = useMemo(() => {
    if (!chartData) return null;
    if (tokenMode === 'billable') return chartData.billableBuckets;
    if (tokenMode === 'cache') return chartData.cacheBuckets;
    return chartData.buckets;
  }, [chartData, tokenMode]);

  const chartRender = useMemo(() => {
    if (!chartData || chartData.timeKeys.length === 0 || !activeBuckets) return null;
    const { timeKeys, dimensions: rawDims } = chartData;
    const buckets = activeBuckets;
    const dimTotals = new Map<string, number>();
    for (const d of rawDims) {
      let total = 0;
      for (const t of timeKeys) total += (buckets[t]?.[d] || 0);
      dimTotals.set(d, total);
    }
    const dimensions = [...rawDims].sort((a, b) => (dimTotals.get(b) || 0) - (dimTotals.get(a) || 0));
    let maxTotal = 0;
    for (const t of timeKeys) {
      let sum = 0;
      for (const d of dimensions) sum += (buckets[t]?.[d] || 0);
      if (sum > maxTotal) maxTotal = sum;
    }
    if (maxTotal === 0) maxTotal = 1;
    return { timeKeys, dimensions, buckets, maxTotal };
  }, [chartData, activeBuckets]);

  const chartRenderDual = useMemo(() => {
    if (!chartData || chartData.timeKeys.length === 0 || chartGroupBy !== 'none') return null;
    const { timeKeys, dimensions: rawDims, billableBuckets, cacheBuckets } = chartData;
    const dualDims = ['Billable', 'Cache'];
    let maxTotal = 0;
    const buckets: Record<string, Record<string, number>> = {};
    for (const t of timeKeys) {
      let billable = 0, cache = 0;
      for (const d of rawDims) {
        billable += (billableBuckets[t]?.[d] || 0);
        cache += (cacheBuckets[t]?.[d] || 0);
      }
      buckets[t] = { Billable: billable, Cache: cache };
      const total = tokenMode === 'all' ? billable + cache : tokenMode === 'billable' ? billable : cache;
      if (total > maxTotal) maxTotal = total;
    }
    if (maxTotal === 0) maxTotal = 1;
    return { timeKeys, dimensions: dualDims, buckets, maxTotal };
  }, [chartData, chartGroupBy, tokenMode]);

  const useNoneDual = chartGroupBy === 'none';
  const renderData = useNoneDual ? chartRenderDual : chartRender;

  const getVisibleDims = () => {
    if (!useNoneDual || !chartRenderDual) return renderData?.dimensions || [];
    if (tokenMode === 'billable') return ['Billable'];
    if (tokenMode === 'cache') return ['Cache'];
    return ['Billable', 'Cache'];
  };

  const getBarColor = (dim: string, idx: number) => {
    if (useNoneDual) {
      if (dim === 'Billable') return BILLABLE_COLOR;
      if (dim === 'Cache') return CACHE_COLOR;
    }
    return COLORS[idx % COLORS.length];
  };

  const getMaxForNone = () => {
    if (!useNoneDual || !chartRenderDual) return renderData?.maxTotal || 1;
    const { timeKeys, buckets } = chartRenderDual;
    const dims = getVisibleDims();
    let max = 0;
    for (const t of timeKeys) {
      let sum = 0;
      for (const d of dims) sum += (buckets[t]?.[d] || 0);
      if (sum > max) max = sum;
    }
    return max || 1;
  };

  const formatTimeLabel = (t: string) => {
    if (period === 'day') return String(new Date(t + ':00:00Z').getHours()).padStart(2, '0') + 'h';
    if (period === 'year') return SHORT_MONTHS[parseInt(t.slice(5, 7)) - 1] || t.slice(5);
    return t.slice(5);
  };

  const chartTitle = period === 'day' ? 'Hourly' : period === 'year' ? 'Monthly' : 'Daily';

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
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-[#dadce0] p-4">
          <p className="text-[10px] font-semibold text-[#70757a] uppercase tracking-wider mb-1">Billable Tokens</p>
          <p className="text-2xl font-bold text-[#f9ab00]">{formatTokens(summary.billable)}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#dadce0] p-4">
          <p className="text-[10px] font-semibold text-[#70757a] uppercase tracking-wider mb-1">Cache Tokens</p>
          <p className="text-2xl font-bold text-[#9aa0a6]">{formatTokens(summary.cache)}</p>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-2 mb-3">
        {(['day', 'week', 'month', 'year'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              period === p
                ? 'bg-[#f9ab00] text-white'
                : 'bg-white border border-[#dadce0] text-[#70757a] hover:bg-[#f8f9fa]'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => setOffset(o => o - 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f1f3f4] transition-colors text-[#3c4043]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-medium text-[#3c4043] min-w-[160px] text-center">
          {getPeriodLabel(period, offset)}
        </span>
        <button
          onClick={() => setOffset(o => o + 1)}
          disabled={offset >= 0}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            offset >= 0 ? 'text-[#dadce0] cursor-not-allowed' : 'hover:bg-[#f1f3f4] text-[#3c4043]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl border border-[#dadce0] p-4">
        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#3c4043]">
              {chartTitle} Token Usage
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex gap-1 bg-[#f1f3f4] rounded-full p-0.5">
              {(['billable', 'cache', 'all'] as TokenMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setTokenMode(m)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                    tokenMode === m ? 'bg-white text-[#3c4043] shadow-sm' : 'text-[#70757a]'
                  }`}
                >
                  {m === 'billable' ? 'Billable' : m === 'cache' ? 'Cache' : 'All'}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-[#dadce0]" />
            <div className="flex gap-1">
              {(['none', 'model', 'agent', 'provider'] as GroupBy[]).map(g => (
                <button
                  key={g}
                  onClick={() => setChartGroupBy(g)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                    chartGroupBy === g ? 'bg-[#fef7e0] text-[#f9ab00]' : 'text-[#70757a] hover:bg-[#f1f3f4]'
                  }`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 rounded-full bg-[#f9ab00] animate-pulse" />
          </div>
        ) : !renderData ? (
          <p className="text-xs text-[#70757a] py-4 text-center">No data for this period</p>
        ) : (() => {
          const effectiveBuckets = useNoneDual ? chartRenderDual!.buckets : renderData.buckets;
          const effectiveDims = useNoneDual ? getVisibleDims() : renderData.dimensions;
          const effectiveMax = useNoneDual ? getMaxForNone() : renderData.maxTotal;
          const timeKeys = renderData.timeKeys;

          return (
            <>
              {/* Desktop chart */}
              <div className="hidden md:block relative">
                <div className="flex">
                  <div className="w-12 shrink-0 flex flex-col justify-between text-[10px] text-[#70757a] text-right pr-2" style={{ height: 200 }}>
                    <span>{formatTokens(effectiveMax)}</span>
                    <span>{formatTokens(effectiveMax / 2)}</span>
                    <span>0</span>
                  </div>
                  <div className="flex-1 relative" style={{ height: 200 }} onMouseLeave={() => setHoveredBar(null)}>
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      <div className="border-b border-[#f1f3f4]" />
                      <div className="border-b border-[#f1f3f4]" />
                      <div className="border-b border-[#f1f3f4]" />
                    </div>
                    <div className="absolute inset-0 flex items-end gap-[2px]">
                      {timeKeys.map((t) => {
                        let total = 0;
                        for (const d of effectiveDims) total += (effectiveBuckets[t]?.[d] || 0);
                        const barWidth = `${100 / timeKeys.length}%`;
                        let yOffset = 0;
                        return (
                          <div key={t} className="relative flex flex-col-reverse" style={{ width: barWidth, height: '100%' }}>
                            {effectiveDims.map((d, i) => {
                              const val = effectiveBuckets[t]?.[d] || 0;
                              if (val === 0) return null;
                              const pct = (val / effectiveMax) * 100;
                              const bottom = (yOffset / effectiveMax) * 100;
                              yOffset += val;
                              return (
                                <div
                                  key={d}
                                  className="absolute w-full cursor-pointer transition-opacity hover:opacity-80"
                                  style={{
                                    bottom: `${bottom}%`,
                                    height: `${Math.max(pct, 0.5)}%`,
                                    backgroundColor: getBarColor(d, i),
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
                    {hoveredBar && (
                      <div
                        className="fixed z-50 bg-[#3c4043] text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
                        style={{ left: hoveredBar.x, top: hoveredBar.y - 40, transform: 'translateX(-50%)' }}
                      >
                        <span className="font-medium">{hoveredBar.dim}</span>: {formatTokens(hoveredBar.tokens)} tokens
                        <div className="text-[10px] text-[#9aa0a6]">{formatTimeLabel(hoveredBar.time)}</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex ml-12">
                  {timeKeys.map((t, i) => {
                    const show = timeKeys.length <= 14 || i % Math.ceil(timeKeys.length / 10) === 0;
                    return (
                      <div key={t} className="text-[10px] text-[#70757a] text-center" style={{ width: `${100 / timeKeys.length}%` }}>
                        {show ? formatTimeLabel(t) : ''}
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  {effectiveDims.map((d, i) => (
                    <div key={d} className="flex items-center gap-1.5 text-[11px] text-[#3c4043]">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getBarColor(d, i) }} />
                      {d}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile chart */}
              <div className="md:hidden">
                <div className="space-y-1.5" style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {timeKeys.map((t) => {
                    let total = 0;
                    for (const d of effectiveDims) total += (effectiveBuckets[t]?.[d] || 0);
                    const barPct = effectiveMax > 0 ? (total / effectiveMax) * 100 : 0;
                    return (
                      <div key={t} className="flex items-center gap-2">
                        <span className="w-12 shrink-0 text-[10px] text-[#70757a] font-medium text-right">{formatTimeLabel(t)}</span>
                        <div className="flex-1 h-5 bg-[#f1f3f4] rounded overflow-hidden flex">
                          {effectiveDims.length === 1 ? (
                            <div className="h-full rounded" style={{ width: `${Math.max(barPct, total > 0 ? 1 : 0)}%`, backgroundColor: getBarColor(effectiveDims[0], 0) }} />
                          ) : (
                            effectiveDims.map((d, i) => {
                              const val = effectiveBuckets[t]?.[d] || 0;
                              if (val === 0) return null;
                              const pct = (val / effectiveMax) * 100;
                              return <div key={d} className="h-full" style={{ width: `${Math.max(pct, 0.5)}%`, backgroundColor: getBarColor(d, i) }} />;
                            })
                          )}
                        </div>
                        <span className="w-12 shrink-0 text-[10px] text-[#70757a] font-semibold text-right">{total > 0 ? formatTokens(total) : ''}</span>
                      </div>
                    );
                  })}
                </div>
                {effectiveDims.length > 1 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {effectiveDims.map((d, i) => (
                      <div key={d} className="flex items-center gap-1 text-[10px] text-[#3c4043]">
                        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: getBarColor(d, i) }} />
                        {d}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
