import React from 'react';

export const Header = () => {
  return (
    <header className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-6">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Exact attached logo image */}
          <img
            src="/logo.png"
            alt="KROW Logo"
            className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-200/60"
          />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none flex items-center gap-1.5">
              <span>wallet</span>
              <span className="text-[#6344F5] font-bold text-xs px-2 py-0.5 rounded-full bg-[#6344F5]/10 border border-[#6344F5]/20">
                by krow
              </span>
            </h1>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Membership Card Saver</p>
          </div>
        </div>

        <a
          href="https://github.com/get-krow/walletbykrow"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-all flex items-center gap-1.5 text-xs font-semibold"
          title="GitHub Repository get-krow/walletbykrow"
        >
          <svg className="w-5 h-5 fill-current text-slate-700" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span className="hidden sm:inline text-slate-600">get-krow</span>
        </a>
      </div>
    </header>
  );
};
