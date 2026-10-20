import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'TalentScout — Find Recruiters & Talent Acquisition Leads',
  description:
    'Discover verified talent acquisition professionals, recruiters, and hiring managers at target companies. Craft customized LinkedIn connection notes and organize your outreach pipeline.',
  keywords: [
    'recruiter search',
    'find recruiters',
    'talent acquisition',
    'LinkedIn recruiter discovery',
    'job search outreach',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${inter.variable} font-sans min-h-screen bg-[#05070f] text-[#f0f4ff] flex flex-col antialiased selection:bg-blue-500/30 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
