
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, UserPlus, AlertTriangle, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createUserProfile } from "@/services/firestoreService";
import { Alert, AlertDescription } from "@/components/ui/alert";


export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!isFirebaseConfigured) {
      setError("Firebase is not configured. Please contact support.");
      toast({
        title: "Configuration Error",
        description: "Firebase is not configured. Registration is disabled.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast({
        title: "Registration Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: fullName });
        await createUserProfile(userCredential.user);
      }
      toast({ 
        title: "Account Created!", 
        description: "Welcome to LexAid Nigeria. Redirecting to dashboard...", 
        variant: "default" 
      });
      router.push('/dashboard'); 
    } catch (e: any) {
      setError(e.message || "Failed to create account. Please try again.");
      toast({
        title: "Registration Failed",
        description: e.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isFirebaseConfigured) {
      setError("Firebase is not configured. Please contact support.");
      toast({
        title: "Configuration Error",
        description: "Firebase is not configured. Google Sign-Up is disabled.",
        variant: "destructive",
      });
      return;
    }
    setIsGoogleLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const additionalUserInfo = getAdditionalUserInfo(result);
      if (result.user) { // User will always exist on successful popup
        if (additionalUserInfo?.isNewUser) {
            await createUserProfile(result.user); // Creates profile with Google display name if available
             toast({
                title: "Account Created with Google!",
                description: "Welcome to LexAid Nigeria!",
             });
        } else {
            // Existing user signed in with Google, profile should exist or be updated if needed.
            // For this flow, we assume createUserProfile handles existing users gracefully or can be adapted.
            // If not, an updateUserProfile call might be needed here if displayName changed in Google.
             toast({
                title: "Signed In with Google!",
                description: "Welcome back to LexAid Nigeria!",
             });
        }
      }
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message || "Failed to sign up with Google. Please try again.");
      toast({
        title: "Google Sign-Up Failed",
        description: e.message || "Could not sign up with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (authLoading || (!authLoading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary p-4">
        <Briefcase className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden border-primary/20">
         <div className="bg-primary/10 p-6 flex flex-col items-center text-center">
            <Image src="https://picsum.photos/seed/lexaidlogo/100/100" alt="LexAid Nigeria Logo" width={80} height={80} className="rounded-full mb-4 border-2 border-primary shadow-md" data-ai-hint="legal scales balance" />
            <h1 className="text-3xl font-bold text-primary">LexAid Nigeria</h1>
            <p className="text-muted-foreground mt-1">Join the Future of Legal Drafting</p>
        </div>
        <CardHeader className="text-center pt-4 pb-2">
          <CardTitle className="text-2xl font-semibold text-foreground">Create Your Account</CardTitle>
          <CardDescription className="text-muted-foreground">Get started with AI-powered legal assistance.</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {!isFirebaseConfigured && (
             <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Authentication is currently unavailable. Please contact support.
              </AlertDescription>
            </Alert>
          )}
          {error && (
             <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                type="text" 
                placeholder="Barrister Tunde Ednut" 
                required 
                className="bg-background border-border focus:border-primary"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading || isGoogleLoading || !isFirebaseConfigured}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="lawyer@example.com" 
                required 
                className="bg-background border-border focus:border-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isGoogleLoading || !isFirebaseConfigured}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="bg-background border-border focus:border-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isGoogleLoading || !isFirebaseConfigured}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="bg-background border-border focus:border-primary"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || isGoogleLoading || !isFirebaseConfigured}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base"
              disabled={isLoading || isGoogleLoading || !isFirebaseConfigured}
            >
              {isLoading && !isGoogleLoading ? (
                <Briefcase className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                 <UserPlus className="mr-2 h-5 w-5" />
              )}
              Create Account with Email
            </Button>
          </form>
          <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-border after:mt-0.5 after:flex-1 after:border-t after:border-border">
            <p className="mx-4 mb-0 text-center font-semibold text-muted-foreground">OR</p>
          </div>
            <Button 
              onClick={handleGoogleSignUp}
              variant="outline"
              className="w-full border-border hover:bg-accent/50 py-3 text-base"
              disabled={isLoading || isGoogleLoading || !isFirebaseConfigured}
            >
              {isGoogleLoading ? (
                <Briefcase className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l0.002-0.002l6.19,5.238C39.993,36.627,44,30.799,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
              )}
              Sign Up with Google
            </Button>
        </CardContent>
        <CardFooter className="flex justify-center bg-secondary/50 py-4 px-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

