import { setBaseUrl, setAuthTokenGetter } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function initApiClient() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  setBaseUrl(apiBaseUrl || null);

  setAuthTokenGetter(() => {
    const token = useAuthStore.getState().token;
    if (!token) return null;
    return `Token ${token}` as unknown as string;
  });
}
