export function CourtArt({ sport, hero = false }: { sport: string; hero?: boolean }) {
  return <div className={`court-art art-${sport.toLowerCase()} ${hero ? 'hero-art' : ''}`} aria-hidden="true">
    <div className="court-surface"><svg viewBox="0 0 600 360" fill="none"><path d="M55 30H545V330H55Z" stroke="currentColor" strokeWidth="4"/><path d="M300 30V330M55 75H545M55 285H545M180 30V330M420 30V330" stroke="currentColor" strokeWidth="3"/>{sport === 'Basketball' ? <><circle cx="300" cy="180" r="60" stroke="currentColor" strokeWidth="3"/><path d="M55 105h100v150H55m490-150H445v150h100" stroke="currentColor" strokeWidth="3"/></> : <path d="M180 180H420" stroke="currentColor" strokeWidth="3"/>}</svg><div className="court-net"/></div>
    <div className="art-ball"/><div className="art-racket"><span/></div><div className="art-shadow"/>
    {hero && <><div className="hero-sticker"><span className="live-dot"/> GOOD GAMES. GREAT PEOPLE.</div><div className="hero-float"><span className="float-icon">↗</span><div><b>Your next game is closer<br/>than you think.</b><span>Find your people. Get out and play.</span></div></div><div className="hero-coordinates">03°08′ N &nbsp; 101°41′ E <span>KUALA LUMPUR</span></div></>}
  </div>;
}
