import { Incident } from '../types';
import {
  X, MapPin, Clock, TrendingUp, MessageSquare,
  CheckCircle2, Lightbulb, Edit, Trash2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from 'motion/react';

interface IncidentDetailModalProps {
  incident: Incident;
  onClose: () => void;
  onAskAI: (question: string) => void;
  onMarkResolved: () => void;
  onEscalate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function IncidentDetailModal({
  incident,
  onClose,
  onAskAI,
  onMarkResolved,
  onEscalate,
  onEdit,
  onDelete
}: IncidentDetailModalProps) {

  const severityColors: Record<string, string> = {
    critical: 'bg-red-500/15 text-red-400 border-red-500/30',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
  };

  const statusColors: Record<string, string> = {
    open: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    active: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    investigating: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    resolved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f1623] border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-[#131b2b]">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-slate-400 text-xs font-mono bg-slate-800/80 px-2 py-0.5 rounded">
              {incident.id}
            </span>

            <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase border ${severityColors[incident.severity] || severityColors.medium}`}>
              {incident.severity}
            </span>

            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize border ${statusColors[incident.status] || statusColors.open}`}>
              {incident.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {incident.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span className="capitalize">{incident.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Updated {formatDistanceToNow(incident.updatedAt, { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Description
            </h3>
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl px-4 py-3">
              <p className="text-slate-300 text-sm leading-relaxed">
                {incident.description && incident.description.trim() !== '..'
                  ? incident.description
                  : 'No detailed description provided for this incident.'}
              </p>
            </div>
          </div>

          {/* AI Insights (Clickable to trigger AI analysis) */}
          <div
            onClick={() => {
              onAskAI(`Analyze root cause and insights for ${incident.id}: ${incident.title}`);
              onClose();
            }}
            className="group cursor-pointer bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 hover:from-blue-500/15 hover:to-purple-500/15 border border-blue-500/20 hover:border-blue-400/40 rounded-xl p-4 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-500/15 rounded-lg group-hover:scale-105 transition-transform">
                  <Lightbulb className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white leading-none">
                    AI Insights
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click to generate root-cause & pattern summary
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-medium text-blue-400 group-hover:translate-x-0.5 transition-transform">
                Analyze →
              </span>
            </div>

            {incident.aiInsights && incident.aiInsights.length > 0 ? (
              <ul className="space-y-2 mt-3">
                {incident.aiInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="text-blue-400 mt-0.5">✦</span>
                    <span className="leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 pl-9">
                Tap here or click <span className="text-blue-400 font-medium">Ask AI</span> below to analyze this incident.
              </p>
            )}
          </div>

          {/* Unified Timeline & Activity */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Activity & Timeline
            </h3>
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
              {incident.timeline && incident.timeline.length > 0 && incident.timeline.map((event) => (
                <div key={event.id} className="flex items-start gap-3 text-xs">
                  <span className="w-2 h-2 mt-1.5 rounded-full bg-blue-400 shrink-0" />
                  <div>
                    <p className="text-slate-200 font-medium">{event.event}</p>
                    <p className="text-slate-500 mt-0.5">
                      {format(event.timestamp, 'MMM d, yyyy HH:mm')} {event.user ? `• ${event.user}` : ''}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-3 text-xs">
                <Clock className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-300">System monitoring detected anomaly</p>
                  <p className="text-slate-500 mt-0.5">{format(incident.createdAt, 'MMM d, yyyy HH:mm')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800/80 bg-[#131b2b] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onAskAI(`Analyze incident ${incident.id}: ${incident.title}`);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Ask AI
            </button>

            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>

            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 rounded-lg text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEscalate}
              className="flex items-center gap-1.5 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/25 text-orange-400 rounded-lg text-xs font-medium transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Escalate
            </button>

            <button
              onClick={onMarkResolved}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Resolve
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}