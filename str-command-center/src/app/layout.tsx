import type { Metadata } from 'next';
import { Cormorant_Garamond, IBM_Plex_Mono, Manrope } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context';
import { Sidebar } from '@/components/sidebar';
import { MobileNav } from '@/components/mobile-nav';
import { CommandPaletteWrapper } from '@/components/command-palette-wrapper';

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

const mono = IBM_Plex_Mono({
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
