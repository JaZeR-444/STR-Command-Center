import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Fraunces, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context';
import { NewSidebar } from '@/components/layout/new-sidebar';
import { Topbar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { CommandPaletteWrapper } from '@/components/search/command-palette-wrapper';

// UI font - clean, professional sans-serif for interface text
const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

// Display font - also Plus Jakarta Sans for consistency
const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
});

// Serif font for numbers and metrics - elegant, distinctive
const serif = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500'],
});

// Clean monospace for data/codes
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'STR Command Center',
  description: 'Portfolio operations management for Austin short-term rentals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} ${serif.variable} ${mono.variable} antialiased`}>
        <AppProvider>
          <CommandPaletteWrapper />
          
          {/* Desktop Layout: Sidebar + Main Content */}
          <div className="hidden lg:flex min-h-screen">
            <NewSidebar />
            
            {/* Main content area */}
            <div 
              className="flex-1 flex flex-col"
              style={{ marginLeft: 'var(--sidebar-width)' }}
            >
              <Topbar />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>

          {/* Mobile Layout: Bottom Nav + Content */}
          <div className="lg:hidden flex flex-col min-h-screen">
            <main className="flex-1 overflow-y-auto pb-20">
              {children}
            </main>
            <MobileNav />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
