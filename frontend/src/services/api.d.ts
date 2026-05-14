export function getApiBase(): string;
export function fetchBackendJson(path: string): Promise<{ ok: boolean; status: number; data: unknown }>;
