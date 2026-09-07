import type { RootState } from '@store/index';
export const selectDemo = (s: RootState) => s.sportbuddy.data;
export const selectNotice = (s: RootState) => s.sportbuddy.notice;
