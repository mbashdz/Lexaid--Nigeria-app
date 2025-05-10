
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, LogIn, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createUserProfile } from "@/services/firestoreService"; // Import createUserProfile


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

 useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);


  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!isFirebaseConfigured) {
      setError("Firebase is not configured. Please contact support.");
      toast({
        title: "Configuration Error",
        description: "Firebase is not configured. Login is disabled.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message || "Failed to sign in. Please check your credentials.");
      toast({
        title: "Login Failed",
        description: e.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
      setError("Firebase is not configured. Please contact support.");
      toast({
        title: "Configuration Error",
        description: "Firebase is not configured. Google Sign-In is disabled.",
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
      if (additionalUserInfo?.isNewUser && result.user) {
        await createUserProfile(result.user);
        toast({
          title: "Account Created & Logged In!",
          description: "Welcome to LexAid Nigeria!",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
      }
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message || "Failed to sign in with Google. Please try again.");
      toast({
        title: "Google Sign-In Failed",
        description: e.message || "Could not sign in with Google. Please try again.",
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
            <Image src="https://picsum.photos/seed/lexaidlogo/100/100" alt="LexAid Nigeria Logo" width={80} height={80} className="rounded-full mb-4 border-2 border-primary shadow-md" data-ai-hint="legal scales balance"/>
            <h1 className="text-3xl font-bold text-primary">LexAid Nigeria</h1>
            <p className="text-muted-foreground mt-1">Your AI Legal Drafting Assistant</p>
        </div>
        <CardHeader className="text-center pt-4 pb-2">
          <CardTitle className="text-2xl font-semibold text-foreground">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground">Sign in to continue your legal work.</CardDescription>
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
          <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="flex items-center justify-between text-sm">
              <Link href="#" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base"
              disabled={isLoading || isGoogleLoading || !isFirebaseConfigured}
            >
              {isLoading && !isGoogleLoading ? (
                <Briefcase className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
               Sign In with Email
            </Button>
          </form>
          <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-border after:mt-0.5 after:flex-1 after:border-t after:border-border">
            <p className="mx-4 mb-0 text-center font-semibold text-muted-foreground">OR</p>
          </div>
           <Button 
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full border-border hover:bg-accent/50 py-3 text-base"
              disabled={isLoading || isGoogleLoading || !isFirebaseConfigured}
            >
              {isGoogleLoading ? (
                <Briefcase className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                 <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l0.002-0.002l6.19,5.238C39.993,36.627,44,30.799,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
              )}
              Sign In with Google
            </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 bg-secondary/50 py-4 px-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

