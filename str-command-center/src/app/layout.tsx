import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/context';
import { Sidebar } from '@/components/sidebar';
import { MobileNav } from '@/components/mobile-nav';

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
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col lg:ml-0">
              <MobileNav />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
