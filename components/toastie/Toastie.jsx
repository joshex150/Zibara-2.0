"use client";
import { useEffect } from "react";
import toast, { Toaster, useToasterStore } from "react-hot-toast";

const Toastie = () => {
  const { toasts } = useToasterStore();
  const TOAST_LIMIT = 1;

  useEffect(() => {
    toasts
      .filter((t) => t.visible) // Only consider visible toasts
      .filter((_, i) => i >= TOAST_LIMIT) // Is toast index over limit?
      .forEach((t) => toast.dismiss(t.id)); // Dismiss – Use toast.remove(t.id) for no exit animation
  }, [toasts]);

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className: "w-[90%] max-w-md",
        style: {
          border: "1px solid rgba(239,239,201,0.14)",
          borderRadius: "0.5rem",
          padding: "1rem 1.25rem",
          backgroundColor: "#0a0806",
          color: "#EFEFC9",
          fontSize: "0.875rem",
          fontWeight: "500",
          boxShadow: "0 0 0 1px rgba(201,169,110,0.12), 0 18px 40px -16px rgba(0, 0, 0, 0.55)",
        },
        success: {
          iconTheme: {
            primary: "#C9A96E",
            secondary: "#0a0806",
          },
        },
        error: {
          iconTheme: {
            primary: "#dc2626",
            secondary: "#0a0806",
          },
        },
        duration: 3000,
      }}
    />
  );
};

export default Toastie;
