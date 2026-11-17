
import { LiveUpdate } from '../types';
import {
  Activity, TrendingUp, Clock, CheckCircle2,
  AlertTriangle, Database, BrainCircuit, Zap,
  Radio, ShieldCheck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LiveFeedProps {
  updates: LiveUpdate[];
  stats: {
    totalActive: number;
    criticalCount: number;
    avgResolutionTime: string;
  };
  lastAIContext?: {
    mode: string;
    dataSource: string;
    contextSize: number | null;
  };
}

export function LiveFeed({ updates, stats, lastAIContext }: LiveFeedProps) {
  const updateIcons: Record<string, typeof Activity> = {
    status_change: Activity,
    new_incident: AlertTriangle,
    resolved: CheckCircle2,
    escalated: TrendingUp
  };

  const updateColors: Record<string, string> = {
    status_change: 'text-blue-400 bg-blue-400/10 border-blue-400/15',
    new_incident: 'text-rose-400 bg-rose-400/10 border-rose-400/15',
    resolved: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/15',
    escalated: 'text-orange-400 bg-orange-400/10 border-orange-400/15'
  };

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col overflow-y-auto border-l border-white/[0.08] bg-[#0D1525] text-white xl:w-[340px]">
      {/* Heading */}
      <div className="border-b border-white/[0.07] p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <h2 className="text-base font-bold text-white">System Intelligence</h2>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Real-time operational overview</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">Live</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="border-b border-white/[0.07] p-4">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[1.5px] text-slate-500">
          Operational metrics
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/[0.10] to-transparent p-3">
            <div className="mb-3 flex items-center justify-between">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span className="text-[9px] font-semibold uppercase text-cyan-300/70">Active</span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-white">{stats.totalActive}</p>
            <p className="mt-1 text-[10px] text-slate-500">Total incidents</p>
          </div>

          <div className="rounded-xl border border-rose-400/15 bg-gradient-to-br from-rose-400/[0.10] to-transparent p-3">
            <div className="mb-3 flex items-center justify-between">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span className="text-[9px] font-semibold uppercase text-rose-300/70">Priority</span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-white">{stats.criticalCount}</p>
            <p className="mt-1 text-[10px] text-slate-500">Critical incidents</p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-400/10">
              <Clock className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Avg. resolution time</p>
              <p className="text-sm font-bold text-white">{stats.avgResolutionTime}</p>
            </div>
          </div>
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        </div>
      </div>

      {/* AI Context */}
      <div className="border-b border-white/[0.07] p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-400/10">
            <BrainCircuit className="h-4 w-4 text-violet-300" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">AI Intelligence</h3>
            <p className="text-[10px] text-slate-500">Context and retrieval details</p>
          </div>
          <span className="ml-auto rounded-md bg-violet-400/10 px-2 py-1 text-[9px] font-bold text-violet-300">
            RAG
          </span>
        </div>

        {lastAIContext ? (
          <div className="space-y-2 rounded-xl border border-violet-400/10 bg-violet-400/[0.035] p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Reasoning mode</span>
              <span className="font-semibold text-violet-300">{lastAIContext.mode}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Data source</span>
              <span className="font-semibold text-slate-200">{lastAIContext.dataSource}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Context retrieved</span>
              <span className="font-semibold text-cyan-300">
                {lastAIContext.contextSize !== null ? lastAIContext.contextSize : 'N/A'}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center">
            <BrainCircuit className="mx-auto mb-2 h-5 w-5 text-violet-400/60" />
            <p className="text-xs font-medium text-slate-400">AI is ready</p>
            <p className="mt-1 text-[10px] text-slate-600">Ask a question to see retrieval context here</p>
          </div>
        )}
      </div>

      {/* Activity timeline */}
      <div className="flex-1 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white">Live Activity</h3>
            <p className="mt-1 text-[10px] text-slate-500">Latest incident events</p>
          </div>
          <Radio className="h-4 w-4 animate-pulse text-cyan-400" />
        </div>

        {updates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 py-8 text-center">
            <Activity className="mx-auto mb-2 h-5 w-5 text-slate-600" />
            <p className="text-xs text-slate-400">No recent activity</p>
            <p className="mt-1 text-[10px] text-slate-600">New events will appear here</p>
          </div>
        ) : (
          <div className="relative space-y-3">
            <div className="absolute bottom-5 left-[15px] top-5 w-px bg-gradient-to-b from-cyan-400/30 to-transparent" />

            {updates.map(update => {
              const Icon = updateIcons[update.type] || Activity;
              const color = updateColors[update.type] || 'text-cyan-400 bg-cyan-400/10 border-cyan-400/15';

              return (
                <div key={update.id} className="relative flex gap-3">
                  <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 transition hover:border-white/15 hover:bg-white/[0.045]">
                    <p className="text-xs font-medium leading-relaxed text-slate-200">
                      {update.message}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                      <span className="font-semibold text-cyan-400">{update.incidentId}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Health footer */}
      <div className="border-t border-white/[0.07] bg-[#0A1120] p-4">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white">Connected services</h3>
          <span className="ml-auto rounded-md bg-emerald-400/10 px-2 py-1 text-[9px] font-bold text-emerald-300">
            DEMO STATUS
          </span>
        </div>

        {[
          { name: 'Backend API', icon: Zap },
          { name: 'Supabase Database', icon: Database },
          { name: 'AI Engine', icon: BrainCircuit }
        ].map(service => {
          const Icon = service.icon;
          return (
            <div key={service.name} className="flex items-center justify-between py-2">
              <span className="flex items-center gap-2 text-[11px] text-slate-400">
                <Icon className="h-3.5 w-3.5 text-slate-500" />
                {service.name}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Connected
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
