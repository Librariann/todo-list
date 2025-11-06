"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const refreshAuth = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setAuth(result.data.accessToken, {
              username: result.data.username,
              email: result.data.email,
            });
          }
        }
      } catch (error) {
        console.error("자동 로그인 실패:", error);
      }
    };

    refreshAuth();
  }, [setAuth]);

  return <>{children}</>;
}
