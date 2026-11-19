import { ArrowUpRight, Github, LockKeyhole, Terminal } from 'lucide-react';
import { Brand } from '../../../shared/ui/Brand.jsx';

export function LoginPage() {
  return <main className="login-page">
    <div className="login-top"><Brand /><span className="tiny-label">YOUR LOCAL WORKSPACE</span></div>
    <section className="login-grid">
      <div className="login-story">
        <div className="inline-flex items-center gap-2 text-sm text-stone-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> BUILT FOR YOUR FLOW</div>
        <h1>Less setup.<br />More <span className="text-stone-400">shipping.</span></h1>
        <p>A quiet place for your code, connections, and everything that comes next.</p>
        <div className="terminal-card">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs text-stone-500"><span>YOUR WORKSPACE</span><Terminal size={15} /></div>
          <p><span className="text-emerald-400">01</span> Connect your GitHub account</p>
          <p><span className="text-emerald-400">02</span> Install the GitHub App</p>
          <p><span className="text-emerald-400">03</span> Stay in sync with your code<span className="terminal-cursor" /></p>
        </div>
        <div className="text-xs text-stone-500">GITHUB-NATIVE. LOCALLY YOURS.</div>
      </div>
      <div className="login-form-panel">
        <div className="login-form">
          <div className="icon-tile mb-8"><Github size={27} /></div>
          <p className="eyebrow">WELCOME TO CLOUD AGENT</p>
          <h2>Your next great<br />build starts here.</h2>
          <p className="mt-4 leading-7 text-stone-500">Connect with GitHub to open your workspace.<br className="hidden xl:block" /> No passwords. No extra accounts.</p>
          <a className="button button-primary mt-9 w-full justify-center" href="/api/v1/auth/github">
            <Github size={18} />Continue with GitHub<ArrowUpRight size={17} className="ml-auto" />
          </a>
          <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-stone-400"><LockKeyhole size={14} className="mt-1 shrink-0" />You will be asked to install the GitHub App and choose which repositories it can access.</p>
          <div className="mt-12 border-t border-stone-200 pt-5 text-xs text-stone-400">Your tokens stay private. Your code stays yours.</div>
        </div>
      </div>
    </section>
    <footer className="login-footer"><span>BUILT WITH INTENTION.</span><span>LOCAL DEVELOPMENT / DOCKER DESKTOP</span></footer>
  </main>;
}
