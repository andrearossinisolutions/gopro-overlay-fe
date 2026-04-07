import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GoPro Overlay MVP',
  description: 'Frontend MVP per upload, preview overlay e render job.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
