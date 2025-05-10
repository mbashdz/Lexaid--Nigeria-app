
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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  if (authLoading || (!authLoading && user)) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary p-4">
        <Briefcase className="h-12 w-12 animate-spin text-primary" /> {/* Using Briefcase as a loader icon */}
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
          <form onSubmit={handleLogin} className="space-y-6">
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
                disabled={isLoading || !isFirebaseConfigured}
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
                disabled={isLoading || !isFirebaseConfigured}
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
              disabled={isLoading || !isFirebaseConfigured}
            >
              {isLoading ? (
                <Briefcase className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
               Sign In
            </Button>
          </form>
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
