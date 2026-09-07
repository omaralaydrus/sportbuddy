import type { AppStartListening } from '@store/index';
import { saveDemo } from '@shared/services/demo.service';
import { storageFailed } from './sportbuddy.action';
export function registerPersistence(listen: AppStartListening) {
  listen({ predicate: (_action, current, previous) => current.sportbuddy.data !== previous.sportbuddy.data,
    effect: (_action, api) => {
      const data = api.getState().sportbuddy.data;
      if (data) try { saveDemo(data); } catch { api.dispatch(storageFailed('Browser storage is unavailable. Changes last only for this session.')); }
    }
  });
}
