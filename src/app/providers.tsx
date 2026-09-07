'use client';
import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from '@store/index';
import { hydrate, storageFailed } from '@modules/sportbuddy/store/sportbuddy.action';
import { readDemo } from '@shared/services/demo.service';
import { seedState } from '@shared/data/sportbuddy';
export function Providers({ children }: { children: React.ReactNode }) {
  const ref = useRef<AppStore | null>(null);
  if (!ref.current) ref.current = makeStore();
  useEffect(() => {
    const store = ref.current!;
    try { store.dispatch(hydrate(readDemo() ?? seedState())); }
    catch { store.dispatch(hydrate(seedState())); store.dispatch(storageFailed('Saved demo could not be loaded. A fresh demo is running.')); }
  }, []);
  return <Provider store={ref.current}>{children}</Provider>;
}
