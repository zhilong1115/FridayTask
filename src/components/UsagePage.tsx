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

function formatCost(n: number) {
  return `$${n.toFixed(2)}`;
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

type Period = 'today' | 'week' | 'month' | 'all';
type GroupBy = 'model' | 'agent' | 'provider';

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
  const [groupBy, setGroupBy] = useState<GroupBy>('model');
  const [data, setData] = useState<UsageData | null>(null);
  const [dailyData, setDailyData] = useState<UsageGroup[]>([]);
  const [allData, setAllData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch grouped data for the selected period
  useEffect(() => {
    const range = getDateRange(period);
    const params = new URLSearchParams();
    if (range.from) params.set('from', range.from);
    if (range.to) params.set('to', range.to);
    params.set('groupBy', groupBy);

    fetch(`${API}/api/usage?${params}`)
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, [period, groupBy]);

  // Fetch daily breakdown
  useEffect(() => {
    const range = getDateRange(period);
    const params = new URLSearchParams();
    if (range.from) params.set('from', range.from);
    if (range.to) params.set('to', range.to);
    params.set('groupBy', period === 'today' ? 'hour' : 'day');

    fetch(`${API}/api/usage?${params}`)
      .then(r => r.json())
      .then(d => setDailyData(d.groups.sort((a: UsageGroup, b: UsageGroup) => a.key.localeCompare(b.key))))
      .catch(console.error);
  }, [period]);

  // Fetch all-time totals for summary cards
  useEffect(() => {
    fetch(`${API}/api/usage?groupBy=day`)
      .then(r => r.json())
      .then(d => { setAllData(d); setLoading(false); })
      .catch(console.error);
  }, []);

  // Summary card data
  const summaryCards = useMemo(() => {
    if (!allData) return [];
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStr = weekStart.toISOString().slice(0, 10);
    const monthStr = todayStr.slice(0, 7);

    let todayCost = 0, weekCost = 0, monthCost = 0;
    let todayTokens = 0, weekTokens = 0, monthTokens = 0;
    for (const g of allData.groups) {
      if (g.key === todayStr) { todayCost += g.cost; todayTokens += g.tokens; }
      if (g.key >= weekStr) { weekCost += g.cost; weekTokens += g.tokens; }
      if (g.key >= monthStr + '-01') { monthCost += g.cost; monthTokens += g.tokens; }
    }
    return [
      { label: 'Today', cost: todayCost, tokens: todayTokens },
      { label: 'This Week', cost: weekCost, tokens: weekTokens },
      { label: 'This Month', cost: monthCost, tokens: monthTokens },
      { label: 'All Time', cost: allData.totalCost, tokens: allData.totalTokens },
    ];
  }, [allData]);

  const maxDailyCost = Math.max(...dailyData.map(d => d.cost), 0.01);

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
          <h1 className="text-xl font-semibold text-[#3c4043]">Usage & Cost</h1>
          <p className="text-xs text-[#70757a]">OpenClaw API usage analytics</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {summaryCards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-[#dadce0] p-4">
            <p className="text-[10px] font-semibold text-[#70757a] uppercase tracking-wider mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-[#f9ab00]">{formatCost(c.cost)}</p>
            <p className="text-xs text-[#70757a] mt-0.5">{formatTokens(c.tokens)} tokens</p>
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

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border border-[#dadce0] p-4 mb-6">
        <h2 className="text-sm font-semibold text-[#3c4043] mb-3">
          {period === 'today' ? 'Hourly' : 'Daily'} Cost
        </h2>
        {dailyData.length === 0 ? (
          <p className="text-xs text-[#70757a] py-4 text-center">No data for this period</p>
        ) : (
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {dailyData.map(d => (
              <div key={d.key} className="flex items-center gap-3 text-xs">
                <span className="w-20 shrink-0 text-[#70757a] font-mono text-[11px]">
                  {period === 'today' ? d.key.slice(11) + ':00' : d.key.slice(5)}
                </span>
                <div className="flex-1 h-5 bg-[#f1f3f4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f9ab00] rounded-full transition-all"
                    style={{ width: `${Math.max((d.cost / maxDailyCost) * 100, 1)}%` }}
                  />
                </div>
                <span className="w-16 text-right font-medium text-[#3c4043]">{formatCost(d.cost)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Group By Tabs + Table */}
      <div className="bg-white rounded-xl border border-[#dadce0] p-4">
        <div className="flex gap-2 mb-4">
          {(['model', 'agent', 'provider'] as GroupBy[]).map(g => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                groupBy === g
                  ? 'bg-[#e8f0fe] text-[#1a73e8]'
                  : 'text-[#70757a] hover:bg-[#f1f3f4]'
              }`}
            >
              By {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>

        {data && data.groups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[#70757a] border-b border-[#dadce0]">
                  <th className="py-2 font-medium">{groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</th>
                  <th className="py-2 font-medium text-right">Requests</th>
                  <th className="py-2 font-medium text-right">Tokens</th>
                  <th className="py-2 font-medium text-right">Input</th>
                  <th className="py-2 font-medium text-right">Output</th>
                  <th className="py-2 font-medium text-right">Cache Read</th>
                  <th className="py-2 font-medium text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {data.groups.map(g => (
                  <tr key={g.key} className="border-b border-[#f1f3f4] hover:bg-[#f8f9fa]">
                    <td className="py-2.5 font-medium text-[#3c4043]">{g.key}</td>
                    <td className="py-2.5 text-right text-[#70757a]">{g.count.toLocaleString()}</td>
                    <td className="py-2.5 text-right text-[#70757a]">{formatTokens(g.tokens)}</td>
                    <td className="py-2.5 text-right text-[#70757a]">{formatTokens(g.input)}</td>
                    <td className="py-2.5 text-right text-[#70757a]">{formatTokens(g.output)}</td>
                    <td className="py-2.5 text-right text-[#70757a]">{formatTokens(g.cacheRead)}</td>
                    <td className="py-2.5 text-right font-semibold text-[#f9ab00]">{formatCost(g.cost)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#dadce0] font-semibold text-[#3c4043]">
                  <td className="py-2.5">Total</td>
                  <td className="py-2.5 text-right">{data.totalRecords.toLocaleString()}</td>
                  <td className="py-2.5 text-right">{formatTokens(data.totalTokens)}</td>
                  <td colSpan={3}></td>
                  <td className="py-2.5 text-right text-[#f9ab00]">{formatCost(data.totalCost)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[#70757a] py-4 text-center">No usage data found</p>
        )}
      </div>
    </div>
  );
}
