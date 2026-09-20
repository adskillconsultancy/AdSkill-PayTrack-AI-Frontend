import { baseApi } from "@/lib/rtk-query/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type { DocumentRecord, DocumentType } from "@/types/client-case.types";

export const documentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCaseDocuments: builder.query<ApiResponse<DocumentRecord[]>, string>({
      query: (caseId) => `/uploads/cases/${caseId}/documents`,
      providesTags: (result, _error, caseId) => result?.data
        ? [...result.data.map(({ id }) => ({ type: "Document" as const, id })), { type: "Document", id: caseId }]
        : [{ type: "Document", id: caseId }],
    }),
    uploadCaseDocuments: builder.mutation<ApiResponse<DocumentRecord[]>, { caseId: string; files: File[]; documentType?: DocumentType }>({
      query: ({ caseId, files, documentType }) => {
        const body = new FormData();
        files.forEach((file) => body.append("files", file));
        if (documentType) body.append("documentType", documentType);
        return { url: `/uploads/cases/${caseId}/documents`, method: "POST", body };
      },
      invalidatesTags: (_result, _error, { caseId }) => [{ type: "Document", id: caseId }],
    }),
    getDocumentDownload: builder.query<ApiResponse<{ id: string; originalName: string; signedDownloadUrl: string; signedUrlExpiresIn: number }>, string>({
      query: (documentId) => `/uploads/documents/${documentId}/download`,
      providesTags: (_result, _error, id) => [{ type: "Document", id }],
    }),
    deleteDocument: builder.mutation<ApiResponse<{ id: string; deleted: boolean }>, { documentId: string; caseId: string }>({
      query: ({ documentId }) => ({ url: `/uploads/documents/${documentId}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { documentId, caseId }) => [{ type: "Document", id: documentId }, { type: "Document", id: caseId }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetCaseDocumentsQuery, useUploadCaseDocumentsMutation, useLazyGetDocumentDownloadQuery, useDeleteDocumentMutation } = documentsApi;
