"use client";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function RootRedirectorPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const role = user?.publicMetadata.role as string | undefined;

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.replace('/sign-up');
    } else if (role) {
      const recognizedRoles = ['doctor', 'pharmacist', 'admin', 'receptionist'];
      if (recognizedRoles.includes(role)) {
        router.replace(`/${role}/dashboard`);
      }
    }
  }, [isLoaded, isSignedIn, role, router]); 

  if (!isLoaded || (isSignedIn && role)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-center">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-center">You are not allowed here!</h1>
      <h1 className="text-center">Please contact support to get your role assigned.</h1>
    </div>
  )
}