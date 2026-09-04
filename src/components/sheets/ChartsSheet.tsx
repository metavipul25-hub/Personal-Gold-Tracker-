import React from 'react';
import { AssetRecord, TransactionHistoryRecord } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, ComposedChart
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

interface ChartsSheetProps {
  assets: AssetRecord[];
  transactions: TransactionHistoryRecord[];
}

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export const ChartsSheet: React.FC<ChartsSheetProps> = ({
  assets,
  transactions
}) => {
  // --- INVENTORY CHARTS ---
  // 1. Inventory by Asset Type
  const assetTypeMap = new Map<string, number>();
  assets.forEach(a => {
    const t = a.assetType || 'Other';
    assetTypeMap.set(t, (assetTypeMap.get(t) || 0) + (a.netGoldWeight ?? 0));
  });
  const c1_AssetType = Array.from(assetTypeMap.entries()).map(([name, weight]) => ({ name, weight }));

  // 2. Inventory by Category
  const categoryMap = new Map<string, number>();
  assets.forEach(a => {
    const c = a.jewelleryCategory || 'Other';
    categoryMap.set(c, (categoryMap.get(c) || 0) + (a.netGoldWeight ?? 0));
  });
  const c2_Category = Array.from(categoryMap.entries()).map(([name, weight]) => ({ name, weight }));

  // 3. Inventory by Purity
  const purityMap = new Map<string, number>();
  assets.forEach(a => {
    const p = a.purity || 'Unknown';
    purityMap.set(p, (purityMap.get(p) || 0) + (a.netGoldWeight ?? 0));
  });
  const c3_Purity = Array.from(purityMap.entries()).map(([name, weight]) => ({ name, weight }));

  // 4. Inventory by Location
  const locationMap = new Map<string, number>();
  assets.forEach(a => {
    const l = a.location || 'Unknown';
    locationMap.set(l, (locationMap.get(l) || 0) + (a.netGoldWeight ?? 0));
  });
  const c4_Location = Array.from(locationMap.entries()).map(([name, weight]) => ({ name, weight }));

  // 5. Inventory by Owner
  const ownerMap = new Map<string, number>();
  assets.forEach(a => {
    const o = a.owner || 'Unknown';
    ownerMap.set(o, (ownerMap.get(o) || 0) + (a.netGoldWeight ?? 0));
  });
  const c5_Owner = Array.from(ownerMap.entries()).map(([name, weight]) => ({ name, weight }));

  // 11. Asset Status Chart
  const statusMap = new Map<string, number>();
  assets.forEach(a => {
    const s = a.status || 'UNKNOWN';
    statusMap.set(s, (statusMap.get(s) || 0) + 1);
  });
  const c11_Status = Array.from(statusMap.entries()).map(([name, count]) => ({ name, count }));

  // --- TRANSACTION CHARTS ---
  // Group transactions by month (YYYY-MM)
  const txByMonth = new Map<string, {
    count: number;
    purchaseWt: number;
    giftRecWt: number;
    giftGivWt: number;
    inhRecWt: number;
    inhTransWt: number;
    saleWt: number;
  }>();

  transactions.forEach(t => {
    if (!t.date) return;
    const month = t.date.substring(0, 7);
    const prev = txByMonth.get(month) || { count: 0, purchaseWt: 0, giftRecWt: 0, giftGivWt: 0, inhRecWt: 0, inhTransWt: 0, saleWt: 0 };
    
    prev.count += 1;
    if (t.type === 'PURCHASE') prev.purchaseWt += (t.quantity ?? 0);
    else if (t.type === 'GIFT RECEIVED') prev.giftRecWt += (t.quantity ?? 0);
    else if (t.type === 'GIFT GIVEN') prev.giftGivWt += (t.quantity ?? 0);
    else if (t.type === 'INHERITANCE RECEIVED') prev.inhRecWt += (t.quantity ?? 0);
    else if (t.type === 'INHERITANCE TRANSFERRED') prev.inhTransWt += (t.quantity ?? 0);
    else if (t.type === 'SALE') prev.saleWt += (t.quantity ?? 0);

    txByMonth.set(month, prev);
  });

  const timeSeries = Array.from(txByMonth.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, data]) => ({ month, ...data }));

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-8 pb-20">
      
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="p-2.5 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-100">Charts & Visual Analytics</h2>
          <p className="text-xs text-slate-400">Visual representations of master data allocations, inventory weights, and historical trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Inventory by Asset Type */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Inventory by Asset Type (g)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={c1_AssetType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="weight" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Inventory by Category */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Inventory by Category (g)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={c2_Category}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="weight" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Inventory by Purity & CHART 11: Asset Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Inventory by Purity (g)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={c3_Purity} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="weight" label>
                  {c3_Purity.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Asset Status (Count)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={c11_Status} cx="50%" cy="50%" outerRadius={80} dataKey="count" label>
                  {c11_Status.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.name === 'ACTIVE' ? '#10b981' : entry.name === 'SOLD' ? '#ef4444' : '#64748b'} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Inventory by Location & CHART 5: Inventory by Owner */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Inventory by Location (g)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={c4_Location} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="weight" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Inventory by Owner (g)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={c5_Owner} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="weight" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* TRANSACTION TIME SERIES CHARTS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Transaction Activity Trend (Count)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Purchase Activity (Wt/Month)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="purchaseWt" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Sale Activity (Wt/Month)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="saleWt" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Gift Activity (Wt/Month)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
                <Bar dataKey="giftRecWt" name="Received" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="giftGivWt" name="Given" fill="#d946ef" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Inheritance Activity (Wt/Month)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
                <Bar dataKey="inhRecWt" name="Received" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="inhTransWt" name="Transferred" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};
