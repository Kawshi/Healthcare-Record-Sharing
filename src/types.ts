// Wire protocol
export interface ContractMessage { Service: string; Action: string; data?: unknown; }
export interface ContractResponse<T = unknown> { success?: T; error?: string; promiseId?: string; }

// Auth
export interface MeInfo { UserId: string; Role: string; Status: string; }
export interface RegisterUserResult { userId: string; status: string; }

// Patient profile (get)
export interface PatientProfile {
  patientUserId: string;
  demographics: Record<string, unknown>;
  conditions: unknown[];
  medications: unknown[];
  allergies: unknown[];
  immunizations: unknown[];
  emergencyContacts: unknown[];
}
export interface PatientProfileUpsertInput {
  demographics?: Record<string, unknown>;
  conditions?: unknown[];
  medications?: unknown[];
  allergies?: unknown[];
  immunizations?: unknown[];
  emergencyContacts?: unknown[];
}

// Access grants
export interface AccessGrantItem { id: number; granteeUserId: string; scopes: string[]; issuedAt: string | null; expiresAt: string | null; revokedAt: string | null; }
export interface GrantAccessInput { granteeUserId: string; scopes: string[]; expiresAt?: string | null; reason?: string; }

// Records
export interface RecordListItem { RecordId: string; Type: string; CreatedAt: string; UpdatedAt: string; Version: number; }
export interface RecordDetail {
  recordId: string;
  patientUserId: string;
  type: string;
  content: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}
export interface CreateRecordInput { patientId: string; type: string; content: Record<string, unknown>; }
export interface UpdateRecordInput { recordId: string; content: Record<string, unknown>; }

// Documents
export interface DocumentListItem { DocId: string; Kind: string; CreatedAt: string; }
export interface DocumentBlob { docId: string; blobBase64: string; size: number; }
export interface UploadInitResult { sessionId: string; }
export interface UploadInitInput { patientId: string; kind?: string; metadata?: Record<string, unknown>; size?: number; }
export interface UploadChunkInput { sessionId: string; chunk: string; }
export interface UploadFinalizeInput { sessionId: string; }

// Prescriptions
export interface PrescriptionListItem { RxId: string; Status: string; CreatedAt: string; UpdatedAt: string; }
export interface PrescriptionDetail {
  rxId: string;
  patientUserId: string;
  prescriberId: string;
  items: unknown[];
  status: string;
  pharmacyUserId: string | null;
  events: unknown[];
}
export interface IssuePrescriptionInput { patientId: string; items: unknown[]; }
export interface UpdatePrescriptionInput { rxId: string; status?: string; note?: string; }
export interface AssignPharmacyInput { rxId: string; pharmacyUserId: string; }
export interface RecordDispenseInput { rxId: string; }

// Lab
export interface LabOrderListItem { OrderId: string; Status: string; CreatedAt: string; UpdatedAt: string; }
export interface LabResultListItem { ResultId: string; ReleasedAt: string | null; }
export interface LabResultDetail {
  resultId: string;
  orderId: string;
  findings: Record<string, unknown>;
  releasedAt: string | null;
  reviewedByDoctorId: string | null;
  reviewNote: string | null;
}
export interface CreateLabOrderInput { patientId: string; tests: unknown[]; labUserId?: string; }
export interface UpdateLabOrderInput { orderId: string; status?: string; }
export interface UploadLabResultInput { orderId: string; findings: Record<string, unknown>; optionalBlob?: string | null; }

// Audit
export interface AuditListItem { LogId: string; ActorUserId: string; Action: string; TargetType: string; TargetId: string; PatientUserId: string | null; Timestamp: string; }
export interface AuditTrailExport { entries: unknown[]; }

// Notifications
export interface NotificationItem { NotificationId: string; Type: string; Payload: string; CreatedAt: string; ReadAt: string | null; }

// AI
export interface AISummary { summary: string; confidence: number; }
export interface AIInteractions { interactions: unknown[]; severity: string; }
export interface AIAnswer { answer: string; sources: unknown[]; }

// List payloads
export interface Paged<T> { data: T[]; page: number; size: number; }
