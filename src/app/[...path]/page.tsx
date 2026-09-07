import { notFound } from 'next/navigation';
import { CourtsPage, CourtDetailPage } from '@modules/sportbuddy/pages/courts.page';
import { GamesPage, GameDetailPage, HostPage } from '@modules/sportbuddy/pages/games.page';
import { CommunityPage, PlayerPage, ProfilePage } from '@modules/sportbuddy/pages/community.page';
import { ConnectionPage } from '@modules/sportbuddy/pages/connection.page';
export default async function Page({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (path.length === 1) {
    if (path[0] === 'courts') return <CourtsPage/>;
    if (path[0] === 'games') return <GamesPage/>;
    if (path[0] === 'my-games') return <GamesPage mine/>;
    if (path[0] === 'community') return <CommunityPage/>;
    if (path[0] === 'profile') return <ProfilePage/>;
    if (path[0] === 'connection') return <ConnectionPage/>;
  }
  if (path.length === 2) {
    if (path[0] === 'courts') return <CourtDetailPage id={path[1]}/>;
    if (path[0] === 'games' && path[1] === 'new') return <HostPage/>;
    if (path[0] === 'games') return <GameDetailPage id={path[1]}/>;
    if (path[0] === 'players') return <PlayerPage id={path[1]}/>;
  }
  if (path.length === 3 && path[0] === 'games' && path[2] === 'edit') return <HostPage id={path[1]}/>;
  notFound();
}
