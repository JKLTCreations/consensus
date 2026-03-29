import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CONSENSUS — Multi-Agent Policy Deliberation',
  description: 'AI-powered structured policy analysis with evidence verification and rational consensus building.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}