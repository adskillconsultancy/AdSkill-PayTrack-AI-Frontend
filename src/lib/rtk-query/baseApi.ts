// ── Base API — Single API Instance ─────────────────────
// All feature endpoints are injected into this single API via injectEndpoints().
// Do NOT create additional createApi() calls.

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";
import { TAG_TYPES } from "./tagTypes";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [...TAG_TYPES],
  endpoints: () => ({}), // Empty — all endpoints injected by feature API files
});
