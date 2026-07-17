import type { ContractMessage, ContractResponse } from '../types';

const HotPocket = (window as any).HotPocket;

type EventHandler = (payload: unknown) => void;
interface PendingPromise { resolve: (value: any) => void; reject: (reason?: any) => void; }

export default class ContractService {
  private static instance: ContractService;
  static getInstance(): ContractService { if (!ContractService.instance) ContractService.instance = new ContractService(); return ContractService.instance; }

  private client: any = null;
  private keyPair: unknown = null;
  private connected = false;
  private mockMode = false;
  private readonly servers: string[] = (import.meta.env.VITE_CONTRACT_URLS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  private readonly promiseMap = new Map<string, PendingPromise>();
  private readonly listeners = new Map<string, Set<EventHandler>>();

  async init(): Promise<boolean> {
    // Mock-mode first — never touch HotPocket in mock mode.
    if (import.meta.env.VITE_MOCK_MODE === 'true') {
      this.mockMode = true;
      console.warn('Running in MOCK MODE — UI will use simulated responses.');
      return true;
    }

    if (!HotPocket) throw new Error('HotPocket client not found. Ensure CDN script loads in index.html.');
    if (this.servers.length === 0) throw new Error('No contract URLs configured. Set VITE_CONTRACT_URLS or enable VITE_MOCK_MODE.');

    if (!this.keyPair) this.keyPair = await HotPocket.generateKeys();
    if (!this.client) this.client = await HotPocket.createClient(this.servers, this.keyPair);

    this.registerEvents();

    if (!this.connected) {
      const ok = await this.client.connect();
      if (!ok) throw new Error('Failed to connect to HotPocket servers. Check VITE_CONTRACT_URLS or enable mock mode.');
      this.connected = true;
    }
    return true;
  }

  on(eventType: string, handler: EventHandler): () => void {
    if (!this.listeners.has(eventType)) this.listeners.set(eventType, new Set<EventHandler>());
    this.listeners.get(eventType)!.add(handler);
    return () => { this.listeners.get(eventType)?.delete(handler); };
  }

  private emit(eventType: string, payload: unknown): void {
    const set = this.listeners.get(eventType);
    if (!set) return;
    set.forEach((h) => { try { h(payload); } catch { /* ignore */ } });
  }

  private registerEvents(): void {
    this.client.on(HotPocket.events.disconnect, () => { this.connected = false; window.location.reload(); });
    this.client.on(HotPocket.events.connectionChange, (server: string, action: string) => { console.log(`HP ${action}: ${server}`); });
    this.client.on(HotPocket.events.contractOutput, (r: { outputs: unknown[] }) => {
      r.outputs.forEach((output) => {
        const obj = this.deserialize<any>(output);
        // Events: { type, payload }
        if (obj && obj.type && !obj.promiseId) {
          this.emit(obj.type, obj.payload);
          return;
        }
        const pId = obj?.promiseId;
        if (!pId) return;
        const pending = this.promiseMap.get(pId);
        if (!pending) return;
        if (obj.error) pending.reject(new Error(obj.error));
        else pending.resolve(obj.success);
        this.promiseMap.delete(pId);
      });
    });
  }

  async submitContractReadRequest<T = unknown>(message: ContractMessage): Promise<T> {
    if (this.mockMode) return this.mockResponse<T>(message);
    const raw = await this.client.submitContractReadRequest(this.serialize(message));
    const resp = this.deserialize<ContractResponse<T>>(raw);
    if (resp.error) throw new Error(resp.error);
    return (resp.success ?? null) as T;
  }

  async submitInputToContract<T = unknown>(message: ContractMessage): Promise<T> {
    if (this.mockMode) return this.mockResponse<T>(message);
    const promiseId = this.getUniqueId();
    const result = new Promise<T>((resolve, reject) => { this.promiseMap.set(promiseId, { resolve: resolve as (v: any) => void, reject }); });
    const input = await this.client.submitContractInput(this.serialize({ promiseId, ...message }));
    const status = await input.submissionStatus;
    if (status.status !== 'accepted') {
      this.promiseMap.delete(promiseId);
      throw new Error(`Ledger rejection: ${status.reason ?? 'Unknown reason'}`);
    }
    return result;
  }

  private serialize(payload: unknown): string { return JSON.stringify(payload); }
  private deserialize<T>(out: unknown): T { if (typeof out === 'string') { try { return JSON.parse(out) as T; } catch { return out as T; } } return out as T; }
  private getUniqueId(): string { const b = new Uint8Array(12); crypto.getRandomValues(b); return Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join(''); }

  private async mockResponse<T>(message: ContractMessage): Promise<T> {
    await new Promise((r) => setTimeout(r, 120));
    const { Service, Action } = message;
    if (Service === 'Auth' && Action === 'getMe') return { UserId: 'patient_1', Role: 'patient', Status: 'active' } as unknown as T;
    if (Service === 'Patient' && Action === 'getPatientProfile') return {
      patientUserId: 'patient_1', demographics: { name: 'Jane Doe' }, conditions: [], medications: [], allergies: [], immunizations: [], emergencyContacts: []
    } as unknown as T;
    if (Service === 'Documents' && Action === 'listDocuments') return { data: [], page: 1, size: 20 } as unknown as T;
    if (Service === 'Access' && (Action === 'listGrants' || Action === 'listIncomingRequests')) return (Action === 'listGrants' ? [] : []) as unknown as T;
    if (Service === 'AI' && Action === 'aiSummarize') return { summary: 'Mock summary.', confidence: 0.9 } as unknown as T;
    if (Service === 'AI' && Action === 'aiMedicationInteractions') return { interactions: [], severity: 'minor' } as unknown as T;
    if (Service === 'AI' && Action === 'aiHealthQnA') return { answer: 'Mock answer.', sources: [] } as unknown as T;
    // Generic OK
    return (null as unknown) as T;
  }
}
