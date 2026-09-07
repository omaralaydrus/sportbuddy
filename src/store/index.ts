import { configureStore, createListenerMiddleware, type TypedStartListening } from '@reduxjs/toolkit';
import { sportBuddyReducer } from '@modules/sportbuddy/store/sportbuddy.reducer';
import { registerPersistence } from '@modules/sportbuddy/store/sportbuddy.effect';
export function makeStore() {
  const listener = createListenerMiddleware();
  const store = configureStore({ reducer: { sportbuddy: sportBuddyReducer }, middleware: defaults => defaults().prepend(listener.middleware) });
  registerPersistence(listener.startListening as AppStartListening);
  return store;
}
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
