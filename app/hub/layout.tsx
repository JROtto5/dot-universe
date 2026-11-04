import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Game Hub - Dot Universe',
  description: 'Your Dot Universe hub! Access DotSlayer roguelike and Dot Clicker idle game. View your stats, cross-game synergy bonuses, and achievements.',
  openGraph: {
    title: 'Dot Universe Game Hub',
    description: 'Access all Dot Universe games from one place. Track your progress and synergy bonuses!',
    url: 'https://www.dotslayer.live/hub',
  },
  alternates: {
    canonical: 'https://www.dotslayer.live/hub',
  },
}

export default function HubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
