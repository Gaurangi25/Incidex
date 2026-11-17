
import { useState } from 'react';
import { Incident, SeverityLevel } from '../types';
import { IncidentCard } from './IncidentCard';
import {
  Plus, Activity, CheckCircle2, AlertTriangle,
  Layers3, ShieldAlert
} from 'lucide-react';

interface IncidentListProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  selectedIncidentId?: string;
  onNewIncident: () => void;
}

type FilterType = 'all' | SeverityLevel;

export function IncidentList({
  incidents,
  onSelectIncident,
  selectedIncidentId,
  onNewIncident
}: IncidentListProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  const [filter, setFilter] = useState<FilterType>('all');

  const isActive = (status: string) =>
    ['open', 'investigating', 'escalated', 'active', 'monitor'].includes(status.toLowerCase());

  const isResolved = (status: string) =>
    ['resolved', 'closed'].includes(status.toLowerCase());

  const tabIncidents = incidents.filter(inc =>
    activeTab === 'active'
      ? isActive(inc.status || '')
      : isResolved(inc.status || '')
  );

  const filteredIncidents = filter === 'all'
    ? tabIncidents
    : tabIncidents.filter(
        inc => (inc.severity || '').toLowerCase() === filter
      );

  const activeCount = incidents.filter(inc => isActive(inc.status || '')).length;
  const resolvedCount = incidents.filter(inc => isResolved(inc.status || '')).length;
  const criticalCount = incidents.filter(
    inc => (inc.severity || '').toLowerCase() === 'critical' && isActive(inc.status || '')
  ).length;

  const filters: { label: string; value: FilterType; color: string }[] = [
    { label: 'All', value: 'all', color: 'cyan' },
    { label: 'Critical', value: 'critical', color: 'rose' },
    { label: 'High', value: 'high', color: 'orange' },
    { label: 'Medium', value: 'medium', color: 'amber' },
    { label: 'Low', value: 'low', color: 'blue' }
  ];

  const activeStyles: Record<string, string> = {
    all: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300',
    critical: 'border-rose-400/40 bg-rose-400/10 text-rose-300',
    high: 'border-orange-400/40 bg-orange-400/10 text-orange-300',
    medium: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
    low: 'border-blue-400/40 bg-blue-400/10 text-blue-300'
  };

  return (
    <section className="flex h-full w-80 shrink-0 flex-col overflow-hidden border-r border-white/[0.08] bg-[#0D1525] text-white xl:w-[340px]">
      {/* Panel heading */}
      <div className="border-b border-white/[0.07] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-cyan-400" />
              <h2 className="text-base font-bold tracking-wide text-white">Incident Center</h2>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Monitor and manage incidents</p>
          </div>

          <button
            onClick={onNewIncident}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-500/20"
          >
            <Plus className="h-4 w-4" />
            New Incident
          </button>
        </div>

        {/* Quick metric */}
        <div className="flex items-center justify-between rounded-xl border border-rose-400/15 bg-gradient-to-r from-rose-500/[0.09] to-transparent px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Critical threats</p>
              <p className="text-xs font-semibold text-slate-200">Requires attention</p>
            </div>
          </div>
          <span className="text-2xl font-bold tabular-nums text-rose-400">{criticalCount}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 border-b border-white/[0.07] p-4">
        <button
          onClick={() => { setActiveTab('active'); setFilter('all'); }}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
            activeTab === 'active'
              ? 'border border-cyan-400/20 bg-cyan-400/10 text-cyan-300'
              : 'border border-transparent bg-white/[0.03] text-slate-400 hover:bg-white/[0.07]'
          }`}
        >
          <Activity className="h-4 w-4" />
          Active
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px]">{activeCount}</span>
        </button>

        <button
          onClick={() => { setActiveTab('resolved'); setFilter('all'); }}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
            activeTab === 'resolved'
              ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
              : 'border border-transparent bg-white/[0.03] text-slate-400 hover:bg-white/[0.07]'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          Resolved
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px]">{resolvedCount}</span>
        </button>
      </div>

      {/* Severity filters */}
      <div className="border-b border-white/[0.07] px-4 py-3">
        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[1.5px] text-slate-500">
          Filter by severity
        </p>
        <div className="flex flex-wrap gap-1.5">
          {filters.map(item => {
            const count = item.value === 'all'
              ? tabIncidents.length
              : tabIncidents.filter(
                  i => (i.severity || '').toLowerCase() === item.value
                ).length;

            return (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition-all ${
                  filter === item.value
                    ? activeStyles[item.value]
                    : 'border-white/[0.07] bg-white/[0.025] text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {item.label} <span className="ml-1 opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Incident cards */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#0A1120] p-3">
        <div className="flex items-center justify-between px-1 py-1">
          <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-500">
            {activeTab === 'active' ? 'Ongoing incidents' : 'Resolved incidents'}
          </span>
          <span className="text-[10px] text-slate-600">{filteredIncidents.length} records</span>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.07]">
              {activeTab === 'active'
                ? <Activity className="h-5 w-5 text-cyan-400" />
                : <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              }
            </div>
            <p className="text-sm font-semibold text-slate-300">
              No {activeTab} incidents
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {filter === 'all'
                ? 'Everything looks quiet. New incidents will appear here.'
                : `No ${filter} incidents found in this view.`}
            </p>
            {activeTab === 'active' && filter === 'all' && (
              <button
                onClick={onNewIncident}
                className="mt-4 flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Create first incident
              </button>
            )}
          </div>
        ) : (
          filteredIncidents.map(incident => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onClick={() => onSelectIncident(incident)}
              isSelected={selectedIncidentId === incident.id}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.07] px-4 py-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Monitoring active
          </span>
          <span className="text-slate-600">Live incident stream</span>
        </div>
      </div>
    </section>
  );
}
