import Link from 'next/link';
export default function NotFound() { return <section className="empty page-width"><h1>This one is out of bounds.</h1><p>We couldn’t find that page.</p><Link href="/" className="button dark">Back to Discover</Link></section>; }
