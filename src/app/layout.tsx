'use client';

import Context from '@/components/Context';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Context>
        <body>{children}</body>
      </Context>
    </html>
  );
}
