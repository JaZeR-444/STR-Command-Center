import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/context';
import { Sidebar } from '@/components/sidebar';
import { MobileNav } from '@/components/mobile-nav';
import { CommandPaletteWrapper } from '@/components/command-palette-wrapper';

export const metadata: Metadata = {
  title: 'STR Launch Command Center',
  description: 'Austin Short-Term Rental Operations Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProvider>
          <CommandPaletteWrapper />
          {/* Responsive shell: sidebar (desktop) + full-width content */}
          <div className="flex min-h-screen w-full overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <MobileNav />
              <main className="flex-1 overflow-y-auto overflow-x-hidden">
                {children}
              </main>
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
