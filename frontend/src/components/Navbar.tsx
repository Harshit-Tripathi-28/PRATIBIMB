import { 
  Brain, LayoutDashboard, MessageSquare, Network, 
  Database, Target, Flame, User, LogOut 
} from 'lucide-react';

export type MainTabType = 'dashboard' | 'chat' | 'twin' | 'memory' | 'goals' | 'habits' | 'avatar' | 'vision';

interface NavbarProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  twinEvolutionLevel?: number;
  userName?: string;
  onResetDemo?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  twinEvolutionLevel = 1,
  userName,
  onSignOut
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/10 bg-[#030712]/90 backdrop-blur-2xl shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-xl tracking-wider bg-gradient-to-r from-white via-cyan-100 to-indigo-300 bg-clip-text text-transparent">
                PRATIBIMB
              </span>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Lvl {twinEvolutionLevel} Twin
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Personal AI Operating Layer</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Command Center
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            AI Core
          </button>

          <button
            onClick={() => setActiveTab('twin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'twin'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-violet-400" />
            Digital Twin
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'memory'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-pink-400" />
            Second Brain
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'goals'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            Goals & Tasks
          </button>

          <button
            onClick={() => setActiveTab('habits')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'habits'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Habits & Focus
          </button>

          <button
            onClick={() => setActiveTab('avatar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'avatar'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <User className="w-3.5 h-3.5 text-cyan-400" />
            Digital Avatar
          </button>
        </nav>

        {/* Right Status Indicator, User Profile & Sign Out */}
        <div className="flex items-center gap-3">
          {userName && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>{userName}</span>
            </div>
          )}

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-rose-950/40 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 text-xs font-medium transition-colors cursor-pointer"
              title="Sign Out of PRATIBIMB"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="hidden sm:inline font-mono">Twin Live</span>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="lg:hidden flex items-center justify-start gap-1 px-4 py-2 bg-slate-950/80 border-t border-slate-800/60 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
          { id: 'chat', label: 'AI Core', icon: MessageSquare },
          { id: 'twin', label: 'Digital Twin', icon: Network },
          { id: 'memory', label: 'Second Brain', icon: Database },
          { id: 'goals', label: 'Goals & Tasks', icon: Target },
          { id: 'habits', label: 'Habits & Focus', icon: Flame },
          { id: 'avatar', label: 'Avatar', icon: User },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as MainTabType)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap cursor-pointer ${
                activeTab === item.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
