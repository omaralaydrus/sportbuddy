import type { Metadata } from 'next';
import { Providers } from './providers';
import { Shell } from '@shared/components/shell';
import './globals.css';
export const metadata: Metadata = { title: 'SportBuddy — Find your people. Find your game.', description: 'Discover nearby courts, join local games, and connect with your next sports buddy.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Providers><Shell>{children}</Shell></Providers></body></html>;
}
