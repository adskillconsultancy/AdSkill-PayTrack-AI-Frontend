import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type {
  CaseNote,
  CreateCaseNoteInput,
  UpdateCaseNoteInput,
} from "@/types/case-note.types";

export const caseNotesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCaseNotes: builder.query<ApiResponse<CaseNote[]>, string>({
      query: (caseId) => `/case-notes/case/${caseId}`,
      providesTags: (result, _error, caseId) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "CaseNote" as const, id })),
              { type: "CaseNote" as const, id: `LIST_${caseId}` },
            ]
          : [{ type: "CaseNote" as const, id: `LIST_${caseId}` }],
    }),
    createCaseNote: builder.mutation<ApiResponse<CaseNote>, CreateCaseNoteInput>({
      query: (body) => ({
        url: "/case-notes",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { caseId }) => [
        { type: "CaseNote" as const, id: `LIST_${caseId}` },
      ],
    }),
    updateCaseNote: builder.mutation<
      ApiResponse<CaseNote>,
      { id: string; body: UpdateCaseNoteInput; caseId: string }
    >({
      query: ({ id, body }) => ({
        url: `/case-notes/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id, caseId }) => [
        { type: "CaseNote" as const, id },
        { type: "CaseNote" as const, id: `LIST_${caseId}` },
      ],
    }),
    deleteCaseNote: builder.mutation<
      ApiResponse<{ message: string }>,
      { id: string; caseId: string }
    >({
      query: ({ id }) => ({
        url: `/case-notes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { id, caseId }) => [
        { type: "CaseNote" as const, id },
        { type: "CaseNote" as const, id: `LIST_${caseId}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCaseNotesQuery,
  useCreateCaseNoteMutation,
  useUpdateCaseNoteMutation,
  useDeleteCaseNoteMutation,
} = caseNotesApi;
