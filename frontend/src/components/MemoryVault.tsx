import { 
  Database, Search, Plus, Sparkles, 
  Calendar, Star, RefreshCw, Trash2 
} from 'lucide-react';
import type { MemoryItem, DigitalTwin } from '../types';
import { api } from '../services/api';

interface MemoryVaultProps {
  twin: DigitalTwin;
  onRefreshTwin: () => void;
}

export const MemoryVault: React.FC<MemoryVaultProps> = ({ twin, onRefreshTwin }) => {
  const [memories, setMemories] = useState<MemoryItem[]>(twin.memories || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<string>('all');
  const [searching, setSearching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Memory Form State
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'short_term' | 'episodic' | 'semantic' | 'behavioral' | 'goal'>('episodic');
  const [newImportance, setNewImportance] = useState(7);
  const [newTags, setNewTags] = useState('productivity, twin');
  const [addingMemory, setAddingMemory] = useState(false);

  const handleDeleteMemory = async (id: string) => {
    try {
      await api.deleteMemory(id);
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to delete memory', e);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setMemories(twin.memories || []);
    }
  }, [twin.memories, searchQuery]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setMemories(twin.memories || []);
      return;
    }

    try {
      setSearching(true);
      const res = await api.searchMemory(searchQuery);
      setMemories(res.results || []);
    } catch (e) {
      console.error('Search memory error', e);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      setAddingMemory(true);
      await api.addMemory({
        content: newContent,
        type: newType,
        importance: newImportance,
        tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
        created_at: 'Just now',
        source: 'user_vault',
      });
      setShowAddModal(false);
      setNewContent('');
      onRefreshTwin();
    } catch (e) {
      console.error('Failed to add memory', e);
    } finally {
      setAddingMemory(false);
    }
  };

  const filteredMemories = memories.filter((m) => {
    if (activeType === 'all') return true;
    return m.type === activeType;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Second Brain & Semantic Memory</h1>
            <p className="text-xs text-slate-400">
              Vectorized long-term memory store indexed with TF-IDF cosine similarity.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-sm font-semibold shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest New Memory</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Semantic Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 w-full relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search semantic memory (e.g. 'morning focus deep work', 'stress trigger')..."
            className="w-full pl-10 pr-24 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium hover:bg-cyan-500/30 transition-all cursor-pointer flex items-center gap-1"
          >
            {searching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Retrieve</span>
          </button>
        </form>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['all', 'episodic', 'semantic', 'behavioral', 'goal', 'short_term'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveType(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                activeType === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards Grid or Empty State */}
      {filteredMemories.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <Database className="w-12 h-12 text-cyan-400 mx-auto opacity-50" />
          <h3 className="text-base font-bold text-white">Your Second Brain is Empty</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Ingest personal reflections, architectural decisions, core philosophies, or learning notes to calibrate your Digital Twin.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
          >
            Ingest First Memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg backdrop-blur-sm group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[10px] font-mono uppercase tracking-wider text-cyan-300 border border-cyan-500/20">
                    {mem.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-mono">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{mem.importance}/10</span>
                    </div>
                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed group-hover:text-white transition-colors">
                  {mem.content}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                <div className="flex flex-wrap gap-1">
                  {mem.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-950 text-[10px] text-slate-400 border border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {mem.created_at}
                  </span>
                  {mem.similarity_score !== undefined && (
                    <span className="text-cyan-400 font-bold">Sim: {mem.similarity_score}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                Ingest New Knowledge
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Memory Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe an event, decision rule, preference, or learned insight..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="episodic">Episodic (Event/Experience)</option>
                    <option value="semantic">Semantic (Fact/Concept)</option>
                    <option value="behavioral">Behavioral (Routine/Pattern)</option>
                    <option value="goal">Goal (Vision/Priority)</option>
                    <option value="short_term">Short Term Context</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Importance Score ({newImportance}/10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={newImportance}
                    onChange={(e) => setNewImportance(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. routine, morning, productivity"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingMemory}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {addingMemory && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save to Memory Vault</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
