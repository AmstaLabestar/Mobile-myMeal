import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function AuthIndex() {
  const router = useRouter();

  useEffect(() => {
    // Petit délai pour que Root Layout soit monté (évite l'erreur web)
    const timeout = setTimeout(() => {
      // The router object is used here
      router.replace("/(auth)/login");
    }, 50);

    return () => clearTimeout(timeout);
  }, [router]); // <--- Add 'router' here to satisfy the linter

  return null;
}
