'use client';

import React from 'react';
import { Search, ShieldCheck, Sparkles } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Targeted Discovery',
    description:
      'Enter any company name. TalentScout queries live Google search results to surface technical recruiters and talent acquisition leads on LinkedIn.',
    icon: Search,
    tag: 'Live Google Search',
  },
  {
    step: '02',
    title: 'Confidence Scoring',
    description:
      'Profiles are scored by company affiliation accuracy, recruiter title keywords, and location credibility — verified contacts surface first.',
    icon: ShieldCheck,
    tag: 'Transparent Ranking',
  },
  {
    step: '03',
    title: 'Personalized Outreach',
    description:
      "Generate concise LinkedIn connection notes engineered for the 300-character limit and optimized for recruiter response rates.",
    icon: Sparkles,
    tag: 'High-Conversion Drafts',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20">
      {/* Section header */}
      <div className="text-center mb-12">
        <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-blue-400 mb-3">
          How it works
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f0f4ff] tracking-tight">
          From search to conversation
          <br />
          <span className="gradient-text">in under 60 seconds</span>
        </h2>
        <p className="mt-3 text-[#505870] text-sm max-w-md mx-auto leading-relaxed">
          A transparent, fast workflow to connect directly with the right person at your target company.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="relative rounded-2xl p-6 flex flex-col gap-4 transition-all hover:-translate-y-0.5"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              }}
            >
              {/* Connector line between cards */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2.5 w-5 h-px bg-white/8 z-10" />
              )}

              <div className="flex items-center justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)' }}
                >
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <span
                  className="font-mono text-3xl font-black"
                  style={{ color: 'rgba(255,255,255,0.05)' }}
                >
                  {s.step}
                </span>
              </div>

              <div>
                <h3 className="text-[0.9375rem] font-bold text-[#f0f4ff] mb-1.5">{s.title}</h3>
                <p className="text-[0.8125rem] text-[#505870] leading-relaxed">{s.description}</p>
              </div>

              <div
                className="mt-auto pt-3 flex items-center gap-1.5 text-[11px] font-semibold text-blue-400"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                {s.tag}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
