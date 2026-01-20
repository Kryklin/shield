export interface ModuleState {
    enabled: boolean;
    status: 'Safe' | 'At Risk';
    details: string;
}

export interface StateCache {
    timestamp: string;
    settings: Record<string, ModuleState>;
}
