import type { DemoState } from '@shared/models/sportbuddy.model';
export interface SportBuddyState { data: DemoState | null; notice: string; storageError: string }
export const initialState: SportBuddyState = { data: null, notice: '', storageError: '' };
