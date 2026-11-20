
import {
  ChevronDown, Shield, GitBranch, Sparkles
} from 'lucide-react';

interface HeaderProps {
  onSearch: (query: string) => void;
  notificationCount: number;
}

export function Header({ onSearch }: HeaderProps) {

  const navigateToFlow = () => {
    window.location.href = '/flow';
  };

  return (
    <header className="relative z-20 border-b border-white/10 bg-[#090F1D] text-white overflow-hidden">

      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.08] via-transparent to-violet-500/[0.10] pointer-events-none" />

      <div className="relative flex min-h-[76px] items-center justify-between gap-5 px-6">

        {/* Brand */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Shield className="h-6 w-6 text-white" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#090F1D] bg-emerald-400 shadow-[0_0_10px_#34d399]" />
          </div>

          <div>
            <h1 className="text-[19px] font-bold tracking-tight text-white">
              Incidex<span className="text-cyan-400"></span>
            </h1>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[2px] text-slate-500">
              AI Operations Center
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-4">

          {/* Systems Live */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-2 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
            <span className="text-xs font-semibold text-emerald-300">
              Systems Live
            </span>
          </div>

          {/* Glowing AI Architecture Button */}
          <button
            onClick={navigateToFlow}
            title="View AI Flow Explanation"
            className="
              group relative flex items-center gap-2.5
              rounded-xl border border-violet-400/40
              bg-gradient-to-r from-violet-600/20 via-blue-500/15 to-cyan-500/20
              px-4 py-2.5 text-xs font-semibold text-white
              shadow-[0_0_15px_rgba(139,92,246,0.18)]
              transition-all duration-300
              hover:border-cyan-300/70
              hover:shadow-[0_0_25px_rgba(34,211,238,0.25),0_0_40px_rgba(139,92,246,0.2)]
              hover:-translate-y-0.5
            "
          >
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/10 to-cyan-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <GitBranch className="relative h-4 w-4 text-violet-300 transition-all duration-300 group-hover:text-cyan-300 group-hover:rotate-6" />

            <span className="relative tracking-wide">
              AI Architecture
            </span>

            <Sparkles className="relative h-4 w-4 text-cyan-300 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
          </button>

          {/* Divider */}
          <div className="hidden h-8 w-px bg-white/10 sm:block" />

          {/* Admin profile */}
          <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-white/[0.06]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
              A
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-white">ALISS</p>
              <p className="text-[10px] text-slate-500">Administrator</p>
            </div>

            <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
          </button>

        </div>
      </div>
    </header>
  );
}
