"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardPage from "./dashboard";

const ProtectedPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  return (
    <DashboardPage />
  );
};

export default ProtectedPage;
