"use client"

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await signIn("google", {
        callbackUrl: '/dashboard'
    });
    setLoading(false);
  };

  return (
    <Button
        onClick={handleLogin}
        className="w-full"
        disabled={loading}
        variant="secondary"
    >
        <FcGoogle className="w-5 h-5" />
        Continue with Google
    </Button>
  );
};

export default GoogleLoginButton;
