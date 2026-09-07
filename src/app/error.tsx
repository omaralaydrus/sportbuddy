'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <section className="empty page-width"><h1>Let’s try that again.</h1><p>Something interrupted this page. Your saved demo is kept in your browser.</p><button className="button dark" onClick={reset}>Try again</button></section>; }
