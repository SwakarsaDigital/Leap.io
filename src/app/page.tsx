import React from 'react';
import { auth } from '../auth'; 
import { 
  ArrowRight, 
  Terminal, 
  Shield, 
  Zap, 
  Trophy, 
  Code, 
  Users, 
  Target,
  Cpu,
  ChevronRight,
  Star,
  Activity,
  Bot
} from 'lucide-react';
import AiRecruiter from './components/landing/AiRecruiter';

// CSS for marquee animation
const marqueeStyles = `
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-scroll {
    animation: scroll 40s linear infinite;
  }
  .animate-scroll:hover {
    animation-play-state: paused;
  }
`;

/**
 * Landing Page (Root)
 * Logic: Toggle between Landing Page and AI Recruiter based on 'view' query param.
 * Note: Using standard <a> tags instead of Link to avoid module resolution issues in this environment.
 */
export default async function App({ 
  searchParams 
}: { 
  searchParams: Promise<{ view?: string }> 
}) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  
  // Resolve searchParams
  const resolvedParams = await searchParams;
  const isRecruiterView = isLoggedIn && resolvedParams.view === 'recruiter';

  // Testimonial Data
  const testimonials = [
    { id: 1, text: "Leap.io changed how we ship. The gamification makes devs actually want to fix bugs. It's insane.", author: "Alex Chen", role: "CTO, TechStart", level: "Lvl 45" },
    { id: 2, text: "Finally, a project management tool that doesn't feel like a spreadsheet factory. My team loves the XP system.", author: "Sarah Jones", role: "Product Lead, Innovate", level: "Lvl 32" },
    { id: 3, text: "Client Shield is a lifesaver. No more midnight WhatsApp messages from clients. Pure focus.", author: "David Kim", role: "Founder, DevStudio", level: "Lvl 50" },
    { id: 4, text: "The Cryosleep feature actually helped us retain 3 clients who paused development. Genius retention strategy.", author: "Maria Garcia", role: "Director, SoftWorks", level: "Lvl 28" },
    { id: 5, text: "I've tried Jira and Trello. Nothing beats the dopamine rush of 'Level Up' after a deployment.", author: "James Wilson", role: "Senior Dev, CodeCraft", level: "Lvl 60" },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 relative overflow-x-hidden selection:bg-green-500/30 font-sans w-full max-w-[100vw]">
      <style>{marqueeStyles}</style>
      
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="relative z-50 w-full border-b border-white/5 bg-[#020617]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center text-left">
            <a href="/" className="flex items-center gap-2 font-black text-2xl text-white tracking-tighter group cursor-pointer no-underline">
                <span className="text-3xl group-hover:-translate-y-1 group-hover:rotate-12 transition-transform duration-300">🐸</span> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 group-hover:to-green-400 transition-all uppercase">Leap.io</span>
            </a>
            <div className="flex items-center gap-6">
                <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#workflow" className="hover:text-white transition-colors">Game Loop</a>
                    <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                </div>
                {isLoggedIn ? (
                    <a href="/guild" className="text-sm font-bold bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full border border-white/5 transition-all flex items-center gap-2 no-underline">
                        Dashboard <ArrowRight size={16} />
                    </a>
                ) : (
                    <a href="/login" className="text-sm font-bold bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all flex items-center gap-2 group no-underline">
                        Start Game <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                    </a>
                )}
            </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 w-full overflow-hidden">
        
        {isRecruiterView ? (
            // === VIEW 1: COMMAND CENTER (AI RECRUITER) ===
            <div key="recruiter-interface" className="max-w-7xl mx-auto px-6 py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono mb-6">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        AI RECRUITER ONLINE
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Command Center <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 italic underline decoration-green-500/30 underline-offset-8">Authorized Access</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Welcome back, Agent. Our AI is ready to synchronize you with elite talent. 
                        Brief your mission below to initiate the recruitment protocol.
                    </p>
                </div>
                
                <div className="transform hover:scale-[1.01] transition-transform duration-500">
                    <AiRecruiter userEmail={session.user?.email || 'Guest'} />
                </div>
            </div>
        ) : (
            // === VIEW 2: FULL LANDING PAGE ===
            <div key="landing-content">
                {/* HERO SECTION */}
                <section className="pt-20 pb-32 px-6 text-center relative w-full">
                    <div className="max-w-5xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-widest mb-8 hover:border-green-500/50 hover:text-green-400 transition-colors cursor-default animate-in fade-in zoom-in duration-700 delay-100">
                            <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                            v2.0 : The Gamification Update is Live
                        </div>
                        
                        <h1 className="text-5xl md:text-8xl font-black text-white mb-8 leading-[1.1] tracking-tight animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 uppercase">
                            Stop Managing. <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-500 italic">Start Playing.</span>
                        </h1>
                        
                        <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300">
                            Leap.io turns software development into an RPG. Developers earn XP, 
                            clients get results, and projects finish 
                            <span className="text-white font-bold decoration-green-500 decoration-wavy underline underline-offset-4 ml-2">50% faster</span>.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-500">
                            {isLoggedIn ? (
                              <a 
                                  href="/?view=recruiter" 
                                  className="px-8 py-4 bg-green-600 text-white text-lg font-bold rounded-xl hover:scale-105 hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-all flex items-center gap-2 shadow-xl no-underline"
                              >
                                  <Bot size={20} /> Enter Command Center
                              </a>
                            ) : (
                              <a 
                                  href="/login" 
                                  className="px-8 py-4 bg-white text-black text-lg font-bold rounded-xl hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all flex items-center gap-2 shadow-lg no-underline"
                              >
                                  <Terminal size={20} /> Hire a Dev Squad
                              </a>
                            )}

                            <a 
                                href={isLoggedIn ? "/guild" : "/login"} 
                                className="px-8 py-4 bg-slate-900/80 text-white text-lg font-bold rounded-xl border border-slate-700 hover:bg-slate-800 hover:border-slate-500 transition-all backdrop-blur-sm flex items-center gap-2 no-underline"
                            >
                                {isLoggedIn ? 'Go to Guild Hall' : 'Join as Freelancer'}
                            </a>
                        </div>

                        {/* Social Proof */}
                        <div className="mt-20 pt-10 border-t border-white/5 animate-in fade-in duration-1000 delay-700 w-full overflow-hidden">
                            <p className="text-slate-500 text-sm font-mono uppercase tracking-widest mb-6 italic">Trusted by the Future-Proof Industry</p>
                            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                {['Acme Corp', 'Stark Ind', 'Wayne Ent', 'Cyberdyne', 'Umbrella'].map((company) => (
                                    <span key={company} className="text-xl font-black text-white italic">{company}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* GAME LOOP SECTION */}
                <section id="workflow" className="py-24 bg-slate-950 relative border-y border-white/5 w-full">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">The Core Loop</h2>
                            <p className="text-slate-400">How we gamified the entire SDLC for peak performance.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-500/50 to-transparent border-t border-dashed border-slate-700 z-0"></div>

                            <StepCard 
                                step="01"
                                icon={Target}
                                title="Quest Board"
                                desc="Projects are broken into 'Quests'. Developers pick tickets like missions in an RPG."
                                color="text-blue-400"
                            />
                            <StepCard 
                                step="02"
                                icon={Code}
                                title="Combat Phase"
                                desc="Devs enter 'In Combat' mode for coding. No meetings, just pure focused execution."
                                color="text-yellow-400"
                            />
                            <StepCard 
                                step="03"
                                icon={Trophy}
                                title="Loot Drop"
                                desc="Submit code & video proof. Captain reviews. If approved, gain XP, Gold, and Level Up."
                                color="text-green-400"
                            />
                        </div>
                    </div>
                </section>

                {/* FEATURES BENTO GRID */}
                <section id="features" className="py-24 px-6 bg-[#020617] w-full">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-16">
                            <span className="text-green-500 font-mono text-sm font-bold tracking-widest uppercase">System Modules</span>
                            <h2 className="text-4xl md:text-5xl font-black text-white mt-2 italic">Everything you need to <br/>ship software.</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-auto md:h-[600px]">
                            <div className="md:col-span-2 md:row-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:border-green-500/30 transition-colors group relative overflow-hidden flex flex-col text-left">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] group-hover:bg-green-500/20 transition-all"></div>
                                
                                <div className="relative z-10 flex-1">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 mb-6">
                                        <Shield size={24} />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-4 uppercase tracking-tighter">Client Shield Protocol</h3>
                                    <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                                        We install a firewall between your developers and the noise. 
                                        Clients communicate with the &quot;Captain&quot; (PM) via a secure terminal. 
                                    </p>
                                </div>

                                <div className="relative z-10 mt-8 p-5 bg-black/60 rounded-xl border border-white/5 font-mono text-xs text-green-400 shadow-inner">
                                    <div className="flex items-center gap-2 mb-2 text-slate-500 border-b border-white/5 pb-2">
                                        <Activity size={10} />
                                        <span className="uppercase tracking-widest text-[10px]">Secure Channel Active</span>
                                    </div>
                                    <div className="space-y-1.5 opacity-90">
                                        <p><span className="text-slate-500 mr-2">09:01</span>&gt; Encrypting channel...</p>
                                        <p><span className="text-slate-500 mr-2">09:02</span>&gt; Connection established.</p>
                                        <p><span className="text-slate-500 mr-2">09:05</span>&gt; Client: &quot;Need emergency fix ASAP.&quot;</p>
                                        <p><span className="text-slate-500 mr-2">09:06</span>&gt; Captain: &quot;Acknowledged. Squad deployed.&quot;</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:border-blue-500/30 transition-colors group relative overflow-hidden text-left">
                                <Cpu size={32} className="text-blue-400 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">AI Architect</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Before code is written, our AI validates architecture against 1M+ patterns for scalability.
                                </p>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:border-purple-500/30 transition-colors group relative overflow-hidden text-left">
                                <Users size={32} className="text-purple-400 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">Global Leaderboards</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Compete with devs worldwide. Rankings based on Code Logic, Velocity, and Aesthetic stats.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TESTIMONIALS */}
                <section className="py-24 bg-slate-950 overflow-hidden border-t border-white/5 relative w-full">
                    <div className="text-center mb-16 px-6">
                        <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">Transmission Logs</h2>
                        <p className="text-slate-500 text-sm italic">Intercepted communications from the guild members.</p>
                    </div>
                    
                    <div className="relative w-full max-w-full overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none"></div>

                        <div className="flex gap-6 animate-scroll w-max px-6 hover:[animation-play-state:paused]">
                            {[...testimonials, ...testimonials].map((item, i) => (
                                <div key={`testimonial-${item.id}-${i}`} className="w-[80vw] sm:w-[350px] md:w-[400px] bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex-shrink-0 hover:border-slate-600 transition-colors group relative text-left">
                                    <div className="flex items-center gap-1 text-yellow-500/80 mb-4 group-hover:text-yellow-400 transition-colors">
                                        {[...Array(5)].map((_, idx) => (
                                            <Star key={`star-${item.id}-${i}-${idx}`} size={12} fill="currentColor" />
                                        ))}
                                    </div>
                                    <p className="text-slate-300 text-sm mb-6 leading-relaxed min-h-[60px] line-clamp-3 italic">
                                        &quot;{item.text}&quot;
                                    </p>
                                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                        <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner">
                                            {item.author[0]}
                                        </div>
                                        <div>
                                            <p className="text-white text-xs font-bold">{item.author}</p>
                                            <p className="text-slate-500 text-[10px] uppercase tracking-wider">{item.role}</p>
                                            <p className="text-green-500/80 text-[10px] font-mono">{item.level} Captain</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA FOOTER */}
                <section className="py-32 relative text-center px-6 w-full">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900/20 pointer-events-none"></div>
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-5xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter italic">Ready to Leap?</h2>
                        <p className="text-xl text-slate-400 mb-10">
                            Join 10,000+ developers and captains building the digital future.
                            <br/>No credit card required for Level 1 access.
                        </p>
                        <a 
                            href={isLoggedIn ? "/?view=recruiter" : "/login"} 
                            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black text-xl font-bold rounded-2xl hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all no-underline"
                        >
                            {isLoggedIn ? 'Open Recruiter System' : 'Initialize System'} <ArrowRight size={24} />
                        </a>
                    </div>
                </section>

                <footer className="py-8 border-t border-white/5 text-center text-slate-600 text-xs font-mono w-full">
                    <p>&copy; 2026 LEAP.IO // ALL SYSTEMS OPERATIONAL</p>
                </footer>
            </div>
        )}

      </main>
    </div>
  );
}

function StepCard({ step, icon: Icon, title, desc, color }: any) {
    return (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl relative z-10 hover:-translate-y-2 transition-transform duration-300 group text-left">
            <div className={`text-6xl font-black ${color} opacity-10 absolute top-4 right-4 group-hover:opacity-20 transition-opacity`}>
                {step}
            </div>
            <div className={`w-14 h-14 ${color.replace('text-', 'bg-')}/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Icon size={28} className={color} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    )
}