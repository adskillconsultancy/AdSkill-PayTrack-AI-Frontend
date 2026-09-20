export type NoteVisibility = "CLIENT" | "STAFF" | "SUPER_ADMIN";

export interface CaseNoteAuthor {
  id: string;
  name: string;
  preferredName?: string | null;
  email: string;
  role?: {
    id: string;
    name: string;
  } | null;
}

export interface CaseNote {
  id: string;
  caseId: string;
  authorId: string;
  content: string;
  visibility: NoteVisibility;
  isPinned: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  author: CaseNoteAuthor;
}

export interface CreateCaseNoteInput {
  caseId: string;
  content: string;
  visibility?: NoteVisibility;
  isPinned?: boolean;
}

export interface UpdateCaseNoteInput {
  content?: string;
  visibility?: NoteVisibility;
  isPinned?: boolean;
}
