import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BANKABLE IQ',
  description: 'The Institutional Readiness Operating System',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bankable-iq-fintech.vercel.app'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
