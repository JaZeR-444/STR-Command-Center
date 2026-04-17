import type { Metadata } from 'next';
import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { CommandPaletteWrapper } from '@/components/search/command-palette-wrapper';

// Friendly, highly readable sans-serif for body text
const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

// Modern, rounded sans for headings - approachable and friendly
const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
});

// Clean monospace for data/numbers
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'STR Operations Command',
  description: 'Executive operations workspace for Austin short-term rental launch readiness.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} ${mono.variable} antialiased`}>
        <AppProvider>
          <CommandPaletteWrapper />
          {/* Responsive shell: sidebar (desktop) + full-width content */}
          <div className="flex min-h-screen w-full shell-frame">
            <Sidebar />
            {/* Dynamic margin to account for fixed sidebar width */}
            <div className="flex flex-col flex-1 min-w-0 main-content-wrapper transition-all duration-300">
              <MobileNav />
              <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[80px] lg:pb-0">
                {children}
              </main>
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
