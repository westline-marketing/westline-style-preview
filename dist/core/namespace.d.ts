export interface PreviewNamespaceOptions {
    instanceId?: string;
    storageKey?: string;
}
export declare function resolveStorageNamespace(options?: PreviewNamespaceOptions): string;
export declare function resolveLegacyStorageKey(options?: PreviewNamespaceOptions): string | null;
export declare function getPrepaintStyleId(options?: PreviewNamespaceOptions): string;
