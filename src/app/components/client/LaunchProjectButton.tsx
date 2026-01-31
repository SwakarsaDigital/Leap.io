'use client';

import { useState, useRef, useEffect } from 'react';
import { PlusCircle, X, Rocket, Loader2, User, Search, Check, ChevronDown } from 'lucide-react';
import { launchProject } from '../../../app/lib/client-actions'; // Import Server Action

// Definisi tipe data freelancer yang diterima dari parent
type Freelancer = {
  id: string;
  name: string | null;
  image: string | null;
  level: number;
  role: string;
};

export default function LaunchProjectButton({ freelancers = [] }: { freelancers?: Freelancer[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- SEARCHABLE DROPDOWN STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Menutup dropdown saat klik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter logika pencarian
  const filteredFreelancers = freelancers.filter(f => 
    (f.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    // Panggil Server Action
    const result = await launchProject(formData);
    
    setIsLoading(false);
    
    if (result?.success) {
      setIsOpen(false);
      // Reset form state
      setSearchQuery('');
      setSelectedFreelancer(null);
    } else {
      alert(result?.message || 'Gagal membuat proyek. Silakan coba lagi.');
    }
  };

  // Handle saat item dipilih dari list
  const handleSelectFreelancer = (agent: Freelancer | null) => {
    if (agent) {
        setSelectedFreelancer(agent);
        setSearchQuery(agent.name || '');
    } else {
        setSelectedFreelancer(null);
        setSearchQuery('');
    }
    setIsDropdownOpen(false);
  };

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/40"
      >
        <PlusCircle size={16} /> Launch New Project
      </button>

      {/* MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Rocket className="text-blue-500" /> Initialize Deployment
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* HIDDEN INPUT UNTUK MENYIMPAN ID FREELANCER YANG DIPILIH */}
              <input type="hidden" name="freelancerId" value={selectedFreelancer?.id || ''} />

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Project Codename</label>
                <input 
                  name="name" 
                  type="text" 
                  required 
                  placeholder="e.g. Project Manhattan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors placeholder:text-slate-600"
                />
              </div>

              {/* --- SEARCHABLE AGENT SELECTOR --- */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Assign Lead Agent (Optional)</label>
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-500" size={16} />
                    <input 
                        type="text"
                        placeholder="Cari agen atau biarkan kosong..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 pl-10 pr-10 text-white focus:border-blue-500 outline-none transition-colors placeholder:text-slate-600"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            // Jangan reset selectedFreelancer langsung agar user bisa memperbaiki ketikan tanpa kehilangan seleksi,
                            // tapi logika ini bisa disesuaikan. Di sini kita biarkan user mengetik bebas untuk mencari.
                            if (selectedFreelancer && e.target.value !== selectedFreelancer.name) {
                                setSelectedFreelancer(null); 
                            }
                            setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                    />
                    <div className="absolute right-3 top-3 text-slate-500 pointer-events-none">
                        <ChevronDown size={16} />
                    </div>
                </div>

                {/* DROPDOWN LIST */}
                {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                        {/* Option: No Assignment */}
                        <div 
                            className="p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800/50 flex items-center gap-3 transition-colors"
                            onClick={() => handleSelectFreelancer(null)}
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 border-dashed flex items-center justify-center">
                                <User size={14} className="text-slate-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-300 font-medium italic">-- Open for Grabs (Public Board) --</p>
                                <p className="text-[10px] text-slate-500">Post ke papan quest untuk diambil siapa saja</p>
                            </div>
                        </div>

                        {/* List of Filtered Freelancers */}
                        {filteredFreelancers.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-500 italic">
                                Tidak ada agen yang cocok dengan "{searchQuery}"
                            </div>
                        ) : (
                            filteredFreelancers.map((f) => (
                                <div 
                                    key={f.id}
                                    className="p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800/50 flex items-center justify-between group transition-colors"
                                    onClick={() => handleSelectFreelancer(f)}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Avatar Placeholder / Initial */}
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-xs font-bold">
                                            {f.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-200 font-bold group-hover:text-white">{f.name || 'Unknown Agent'}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-emerald-400 font-mono">Lvl {f.level}</span>
                                                <span className="text-[10px] text-slate-600">•</span>
                                                <span className="text-[10px] text-slate-500 uppercase">{f.role}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedFreelancer?.id === f.id && (
                                        <Check size={16} className="text-emerald-500" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mission Brief (Description)</label>
                <textarea 
                  name="description" 
                  required 
                  rows={3}
                  placeholder="Describe the objective..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors placeholder:text-slate-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Initial Budget (Retainer)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-500">$</span>
                  <input 
                    name="budget" 
                    type="number" 
                    defaultValue="1000"
                    min="1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 pl-8 text-white focus:border-blue-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors"
                >
                  ABORT
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'CONFIRM DEPLOYMENT'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}