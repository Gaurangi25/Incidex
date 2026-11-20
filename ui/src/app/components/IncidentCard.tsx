
import { Incident } from '../types';
import { MapPin, Clock, ShieldAlert, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';

interface IncidentCardProps {
  incident: Incident;
  onClick: () => void;
  isSelected?: boolean;
}

export function IncidentCard({
  incident,
  onClick,
  isSelected
}: IncidentCardProps) {

  const severityStyles = {
    critical: {
      badge: 'bg-red-500/10 text-red-400 border-red-500/30',
      dot: 'bg-red-500',
      glow: 'shadow-[0_0_12px_rgba(239,68,68,0.35)]'
    },
    high: {
      badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      dot: 'bg-orange-500',
      glow: 'shadow-[0_0_12px_rgba(249,115,22,0.3)]'
    },
    medium: {
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400',
      glow: ''
    },
    low: {
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      dot: 'bg-cyan-400',
      glow: ''
    }
  };

  const statusStyles: Record<string, string> = {
    active: 'bg-red-500/10 text-red-400',
    investigating: 'bg-violet-500/10 text-violet-400',
    resolved: 'bg-emerald-500/10 text-emerald-400',
    escalated: 'bg-orange-500/10 text-orange-400',
    monitoring: 'bg-cyan-500/10 text-cyan-400'
  };

  const severity = severityStyles[incident.severity] || severityStyles.low;
  const status = statusStyles[incident.status] || 'bg-slate-500/10 text-slate-400';

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`
        group relative w-full text-left p-4 rounded-xl
        border transition-all duration-300 overflow-hidden
        ${
          isSelected
            ? 'bg-cyan-500/[0.07] border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.08)]'
            : 'bg-[#101A2B]/80 border-white/[0.07] hover:border-cyan-400/30 hover:bg-[#152238]'
        }
      `}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-cyan-400 rounded-r-full" />
      )}

      {/* Subtle hover glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.03] to-violet-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative z-10">

        {/* Top row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert size={14} className="text-slate-500 shrink-0" />
            <span className="text-[11px] font-mono tracking-wider text-slate-400 truncate">
              {incident.id}
            </span>
          </div>

          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0 ${severity.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${severity.dot} ${severity.glow}`} />
            {incident.severity}
          </span>
        </div>

        {/* Incident title */}
        <h3 className="text-[13px] font-semibold text-slate-100 leading-relaxed mb-4 line-clamp-2 group-hover:text-cyan-100 transition-colors">
          {incident.title}
        </h3>

        {/* Divider */}
        <div className="h-px bg-white/[0.06] mb-3" />

        {/* Bottom metadata */}
        <div className="flex items-center justify-between gap-2 flex-wrap">

          <div className="flex items-center gap-2 min-w-0">
            <span className={`px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide ${status}`}>
              {incident.status}
            </span>

            <span className="flex items-center gap-1 text-[11px] text-slate-400 min-w-0">
              <MapPin size={11} className="shrink-0 text-slate-500" />
              <span className="truncate max-w-[100px]">
                {incident.location || 'Unknown location'}
              </span>
            </span>
          </div>

          <span className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0">
            <Clock size={11} />
            {formatDistanceToNow(new Date(incident.updatedAt), { addSuffix: true })}
          </span>
        </div>

        {/* Bottom hover indicator */}
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      </div>
    </motion.button>
  );
}
