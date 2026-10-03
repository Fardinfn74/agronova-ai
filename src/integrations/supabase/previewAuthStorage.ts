// Browser-compatible local storage adapter for Supabase client
export function brokeredPreviewStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}
