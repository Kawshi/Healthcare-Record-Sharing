import ContractService from './contract-service';
import type {
  MeInfo,
  RegisterUserResult,
  PatientProfile,
  PatientProfileUpsertInput,
  AccessGrantItem,
  GrantAccessInput,
  RecordListItem,
  RecordDetail,
  CreateRecordInput,
  UpdateRecordInput,
  DocumentListItem,
  DocumentBlob,
  UploadInitInput,
  UploadInitResult,
  UploadChunkInput,
  UploadFinalizeInput,
  PrescriptionListItem,
  PrescriptionDetail,
  IssuePrescriptionInput,
  UpdatePrescriptionInput,
  AssignPharmacyInput,
  RecordDispenseInput,
  LabOrderListItem,
  LabResultListItem,
  LabResultDetail,
  CreateLabOrderInput,
  UpdateLabOrderInput,
  UploadLabResultInput,
  AuditListItem,
  AuditTrailExport,
  NotificationItem,
  Paged,
  AISummary,
  AIInteractions,
  AIAnswer,
} from '../types';

export default class ApiService {
  private static instance: ApiService;
  static getInstance(): ApiService { if (!ApiService.instance) ApiService.instance = new ApiService(); return ApiService.instance; }
  private readonly contract = ContractService.getInstance();

  // Auth
  async registerUser(role: string, profile?: Record<string, unknown>): Promise<RegisterUserResult> {
    return this.contract.submitInputToContract({ Service: 'Auth', Action: 'registerUser', data: { role, profile } });
  }
  async getMe(): Promise<MeInfo> { return this.contract.submitContractReadRequest({ Service: 'Auth', Action: 'getMe' }); }
  async adminApproveProvider(userId: string): Promise<{ approved: string }> {
    return this.contract.submitInputToContract({ Service: 'Auth', Action: 'adminApproveProvider', data: { userId } });
  }
  async adminSuspendUser(userId: string): Promise<{ suspended: string }> {
    return this.contract.submitInputToContract({ Service: 'Auth', Action: 'adminSuspendUser', data: { userId } });
  }

  // Patient profile
  async upsertPatientProfile(input: PatientProfileUpsertInput): Promise<{ patientUserId: string }> {
    return this.contract.submitInputToContract({ Service: 'Patient', Action: 'createOrUpdatePatientProfile', data: input });
  }
  async getPatientProfile(patientId: string): Promise<PatientProfile> {
    return this.contract.submitContractReadRequest({ Service: 'Patient', Action: 'getPatientProfile', data: { patientId } });
  }

  // Access
  async requestAccess(patientId: string): Promise<{ requested: boolean }> {
    return this.contract.submitInputToContract({ Service: 'Access', Action: 'requestAccess', data: { patientId } });
  }
  async grantAccess(input: GrantAccessInput): Promise<{ granted: boolean }> {
    return this.contract.submitInputToContract({ Service: 'Access', Action: 'grantAccess', data: input });
  }
  async revokeAccess(grantId: number): Promise<{ revoked: boolean }> {
    return this.contract.submitInputToContract({ Service: 'Access', Action: 'revokeAccess', data: { grantId } });
  }
  async listGrants(patientId?: string): Promise<AccessGrantItem[]> {
    return this.contract.submitContractReadRequest({ Service: 'Access', Action: 'listGrants', data: { patientId } });
  }
  async listIncomingRequests(): Promise<unknown[]> {
    return this.contract.submitContractReadRequest({ Service: 'Access', Action: 'listIncomingRequests' });
  }

  // Records
  async createRecord(input: CreateRecordInput): Promise<{ recordId: string }> {
    return this.contract.submitInputToContract({ Service: 'Records', Action: 'createRecord', data: input });
  }
  async updateRecord(input: UpdateRecordInput): Promise<{ updated: boolean }> {
    return this.contract.submitInputToContract({ Service: 'Records', Action: 'updateRecord', data: input });
  }
  async getRecord(recordId: string): Promise<RecordDetail> {
    return this.contract.submitContractReadRequest({ Service: 'Records', Action: 'getRecord', data: { recordId } });
  }
  async listRecords(patientId: string, page = 1, size = 20): Promise<Paged<RecordListItem>> {
    return this.contract.submitContractReadRequest({ Service: 'Records', Action: 'listRecords', data: { patientId, pagination: { page, size } } });
  }

  // Documents
  async uploadDocumentInit(input: UploadInitInput): Promise<UploadInitResult> {
    return this.contract.submitInputToContract({ Service: 'Documents', Action: 'uploadDocumentInit', data: input });
  }
  async uploadDocumentChunk(input: UploadChunkInput): Promise<{ received: number }> {
    return this.contract.submitInputToContract({ Service: 'Documents', Action: 'uploadDocumentChunk', data: input });
  }
  async uploadDocumentFinalize(input: UploadFinalizeInput): Promise<{ docId: string }> {
    return this.contract.submitInputToContract({ Service: 'Documents', Action: 'uploadDocumentFinalize', data: input });
  }
  async getDocument(docId: string): Promise<DocumentBlob> {
    return this.contract.submitContractReadRequest({ Service: 'Documents', Action: 'getDocument', data: { docId } });
  }
  async listDocuments(patientId: string, page = 1, size = 20): Promise<Paged<DocumentListItem>> {
    return this.contract.submitContractReadRequest({ Service: 'Documents', Action: 'listDocuments', data: { patientId, pagination: { page, size } } });
  }

  // Prescriptions
  async issuePrescription(input: IssuePrescriptionInput): Promise<{ rxId: string }> {
    return this.contract.submitInputToContract({ Service: 'Prescriptions', Action: 'issuePrescription', data: input });
  }
  async updatePrescription(input: UpdatePrescriptionInput): Promise<{ updated: boolean }> {
    return this.contract.submitInputToContract({ Service: 'Prescriptions', Action: 'updatePrescription', data: input });
  }
  async assignPharmacy(input: AssignPharmacyInput): Promise<{ assigned: boolean }> {
    return this.contract.submitInputToContract({ Service: 'Prescriptions', Action: 'assignPharmacy', data: input });
  }
  async recordDispense(input: RecordDispenseInput): Promise<{ dispensed: boolean }> {
    return this.contract.submitInputToContract({ Service: 'Prescriptions', Action: 'recordDispense', data: input });
  }
  async getPrescription(rxId: string): Promise<PrescriptionDetail> {
    return this.contract.submitContractReadRequest({ Service: 'Prescriptions', Action: 'getPrescription', data: { rxId } });
  }
  async listPrescriptions(patientId: string, page = 1, size = 20): Promise<Paged<PrescriptionListItem>> {
    return this.contract.submitContractReadRequest({ Service: 'Prescriptions', Action: 'listPrescriptions', data: { patientId, pagination: { page, size } } });
  }

  // Lab
  async createLabOrder(input: CreateLabOrderInput): Promise<{ orderId: string }> {
    return this.contract.submitInputToContract({ Service: 'Lab', Action: 'createLabOrder', data: input });
  }
  async updateLabOrder(input: UpdateLabOrderInput): Promise<{ updated: boolean }> {
    return this.contract.submitInputToContract({ Service: 'Lab', Action: 'updateLabOrder', data: input });
  }
  async uploadLabResult(input: UploadLabResultInput): Promise<{ resultId: string }> {
    return this.contract.submitInputToContract({ Service: 'Lab', Action: 'uploadLabResult', data: input });
  }
  async getLabResult(resultId: string): Promise<LabResultDetail> {
    return this.contract.submitContractReadRequest({ Service: 'Lab', Action: 'getLabResult', data: { resultId } });
  }
  async listLabOrders(patientId: string, page = 1, size = 20): Promise<Paged<LabOrderListItem>> {
    return this.contract.submitContractReadRequest({ Service: 'Lab', Action: 'listLabOrders', data: { patientId, pagination: { page, size } } });
  }
  async listLabResults(patientId: string, page = 1, size = 20): Promise<Paged<LabResultListItem>> {
    // Backend returns { data, page, size } but page=1 and slice(size). We'll wrap as paged.
    const res = await this.contract.submitContractReadRequest<{ data: LabResultListItem[]; page: number; size: number }>({ Service: 'Lab', Action: 'listLabResults', data: { patientId, pagination: { page, size } } });
    return res;
  }

  // Audit
  async listAuditLogs(filter?: { patientId?: string; actor?: string; action?: string }, page = 1, size = 20): Promise<Paged<AuditListItem>> {
    return this.contract.submitContractReadRequest({ Service: 'Audit', Action: 'listAuditLogs', data: { filter, pagination: { page, size } } });
  }
  async getAuditLog(logId: string): Promise<unknown> { return this.contract.submitContractReadRequest({ Service: 'Audit', Action: 'getAuditLog', data: { logId } }); }
  async exportAuditTrail(): Promise<AuditTrailExport> { return this.contract.submitContractReadRequest({ Service: 'Audit', Action: 'exportAuditTrail' }); }

  // Notifications
  async listNotifications(): Promise<NotificationItem[]> { return this.contract.submitContractReadRequest({ Service: 'Notifications', Action: 'listNotifications' }); }
  async markNotificationRead(notificationId: string): Promise<{ read: boolean }> {
    return this.contract.submitInputToContract({ Service: 'Notifications', Action: 'markNotificationRead', data: { notificationId } });
  }

  // Cluster (admin)
  async getClusterUnl(): Promise<{ unl: string[] }> { return this.contract.submitContractReadRequest({ Service: 'Cluster', Action: 'GetClusterUnl' }); }
  async getContractVersion(): Promise<{ version: number }> { return this.contract.submitContractReadRequest({ Service: 'Cluster', Action: 'GetContractVersion' }); }

  // AI
  async aiSummarize(data: { recordId?: string; docId?: string }): Promise<AISummary> { return this.contract.submitContractReadRequest({ Service: 'AI', Action: 'aiSummarize', data }); }
  async aiMedicationInteractions(customList: string[]): Promise<AIInteractions> {
    return this.contract.submitContractReadRequest({ Service: 'AI', Action: 'aiMedicationInteractions', data: { customList } });
  }
  async aiHealthQnA(question: string): Promise<AIAnswer> { return this.contract.submitContractReadRequest({ Service: 'AI', Action: 'aiHealthQnA', data: { question } }); }
}
