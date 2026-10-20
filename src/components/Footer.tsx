'use client';

import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer
      className="w-full py-8 mt-auto"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-semibold text-[#8892aa] text-sm">TalentScout</span>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#505870]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Public index only
            </span>
            <span className="opacity-30">·</span>
            <span>Zero login scraping</span>
            <span className="opacity-30">·</span>
            <span>Direct LinkedIn links</span>
          </div>

          {/* Copyright */}
          <p className="text-[11px] text-[#505870]">
            © 2026 TalentScout
          </p>
        </div>
      </div>
    </footer>
  );
}
