import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Loan Collection Manager',
  description: 'Collections Case Manager — track delinquency cases, run assignment rules, generate notices',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">LCM</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Loan Collection Manager</h1>
                <p className="text-xs text-gray-500">Collections Operations Dashboard</p>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-6 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
