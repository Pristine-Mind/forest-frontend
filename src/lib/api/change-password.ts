import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";

export type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

export type FieldErrors = Partial<Record<keyof ChangePasswordPayload | "detail", string[] | string>>;

export class ApiError extends Error {
  constructor(public status: number, public data: FieldErrors) {
    super("API error");
  }
}

export function useChangePassword() {
  const token = useAuthStore((s) => s.token);

  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/core/auth/change-password/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`, // use `Bearer` if you're on JWT
          },
          body: JSON.stringify(payload),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, body);
      return body as { detail: string; token: string };
    },
  });
}
