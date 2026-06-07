import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, DollarSign, Receipt, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const GROUP_NAME = '⚽ World Cup Watch Party 2026';

export default function SplitwisePanel({ matchId, matchLabel, watchPartyItems = [] }) {
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const invoke = (action, extra = {}) =>
    base44.functions.invoke('splitwiseParty', { action, matchLabel, ...extra });

  const loadExpenses = async (gId) => {
    const expRes = await invoke('getExpenses', { groupId: gId });
    setExpenses(expRes.data?.expenses || []);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await invoke('getOrCreateGroup');
      const g = res.data?.group;
      setGroup(g);
      if (g?.id) await loadExpenses(g.id);
    } catch {
      toast.error('Could not connect to Splitwise');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [matchId]);

  const handleAddExpense = async () => {
    if (!description.trim() || !amount || isNaN(parseFloat(amount))) {
      toast.error('Enter a valid description and amount');
      return;
    }
    setAdding(true);
    try {
      await invoke('addExpense', { groupId: group.id, description: description.trim(), amount: parseFloat(amount) });
      toast.success('Expense added to Splitwise!');
      setDescription('');
      setAmount('');
      setShowForm(false);
      await loadExpenses(group.id);
    } catch {
      toast.error('Failed to add expense');
    } finally {
      setAdding(false);
    }
  };

  const handleSyncItems = async () => {
    const claimed = watchPartyItems.filter(i => i.claimed_by_name);
    if (!claimed.length) {
      toast.info('No claimed items to sync yet');
      return;
    }
    setSyncing(true);
    try {
      const res = await invoke('syncClaimedItems', { groupId: group.id, items: watchPartyItems });
      const { synced, total } = res.data || {};
      if (synced > 0) {
        toast.success(`Synced ${synced} new item${synced !== 1 ? 's' : ''} to Splitwise!`);
      } else {
        toast.info(`All ${total} item${total !== 1 ? 's' : ''} already synced`);
      }
      await loadExpenses(group.id);
    } catch {
      toast.error('Failed to sync items');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-3">
        <Loader2 className="w-4 h-4 animate-spin" />Connecting to Splitwise...
      </div>
    );
  }

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.cost || 0), 0);
  const claimedCount = watchPartyItems.filter(i => i.claimed_by_name).length;

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="text-xs text-muted-foreground">
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} · ${total.toFixed(2)} total
          </span>
        </div>
        {group?.invite_link && (
          <a
            href={group.invite_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Invite <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Sync claimed items button */}
      {claimedCount > 0 && (
        <button
          onClick={handleSyncItems}
          disabled={syncing}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs font-semibold border border-green-500/20 transition-all disabled:opacity-50"
        >
          {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Sync {claimedCount} claimed item{claimedCount !== 1 ? 's' : ''} to Splitwise
        </button>
      )}

      {/* Expense list */}
      {expenses.length > 0 && (
        <div className="space-y-2">
          {expenses.map((e, i) => (
            <div key={e.id || i} className="flex items-center justify-between bg-card rounded-xl border border-border px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Receipt className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate max-w-[160px]">{e.description}</span>
              </div>
              <span className="text-sm font-bold text-green-500 shrink-0">${parseFloat(e.cost).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add manual expense */}
      {showForm ? (
        <div className="bg-card rounded-xl border border-border p-3 space-y-2">
          <Input
            placeholder="What did you buy? (e.g. Beers 🍺)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Amount ($)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          <div className="flex gap-2">
            <Button onClick={handleAddExpense} disabled={adding} className="flex-1 bg-green-600 hover:bg-green-700 text-white" size="sm">
              {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add Expense'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground text-sm font-semibold border border-border transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Expense Manually
        </button>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Shared group: {group?.name || GROUP_NAME} · Edit amounts in Splitwise
      </p>
    </div>
  );
}