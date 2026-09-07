// ── Redux Store (RTK Query Only) ───────────────────────
// This store exists SOLELY for RTK Query. No Redux slices.
// All client-side state is managed by Zustand stores.

import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/lib/rtk-query/baseApi";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
