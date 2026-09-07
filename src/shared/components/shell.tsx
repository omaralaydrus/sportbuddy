'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Icon } from './icon';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { notify } from '@modules/sportbuddy/store/sportbuddy.action';
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { data, notice, storageError } = useAppSelector(s => s.sportbuddy);
  const dispatch = useAppDispatch();
  const viewer = data?.players.find(p => p.id === data.viewerId);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => dispatch(notify('')), 5500); return () => clearTimeout(t); }, [notice, dispatch]);
  return <><a href="#main" className="skip-link">Skip to content</a><header className="site-header"><div className="nav-wrap"><Link href="/" className="brand"><span className="brand-mark"><Icon name="bolt" size={25}/></span>sport<span>buddy</span><i>®</i></Link><nav aria-label="Main navigation">{[['/', 'Discover'], ['/courts', 'Find courts'], ['/games', 'Find games'], ['/community', 'Community']].map(([href, label]) => <Link key={href} href={href} aria-current={path === href ? 'page' : undefined} className={path === href || (href !== '/' && path.startsWith(href + '/')) ? 'active' : ''}>{label}</Link>)}</nav><div className="nav-actions"><Link href="/games/new" className="button small dark"><Icon name="plus" size={17}/> Host a game</Link><Link href="/profile" className="avatar small" style={{ background: viewer?.color }} aria-label="My profile">{viewer?.initials ?? 'AT'}</Link></div></div></header><div className="demo-bar"><span><span className="live-dot"/> A little preview of your next sporting chapter. <b>Demo courts & players</b></span><Link href="/my-games">My games <Icon name="arrow" size={14}/></Link></div>{storageError && <div className="storage-warning" role="status">{storageError}</div>}<main id="main">{children}</main><footer><Link href="/" className="brand">sport<span>buddy</span><i>®</i></Link><p>More play. More people. More possibilities.</p><div><Link href="/connection">Data connection</Link><Link href="/profile">Your profile</Link><span>Made for the love of the game.</span></div></footer>{notice && <div className="toast" role="status"><span>{notice}</span><button className="icon-button" aria-label="Dismiss notification" onClick={() => dispatch(notify(''))}><Icon name="close" size={17}/></button></div>}</>;
}
