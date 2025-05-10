'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement actual registration logic
    // On successful registration:
    // toast({ title: "Account Created!", description: "Welcome to LexAid Nigeria.", variant: "default" });
    router.push('/dashboard'); 
  };

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
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" type="text" placeholder="Barrister Tunde Ednut" required className="bg-background border-border focus:border-primary"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="lawyer@example.com" required className="bg-background border-border focus:border-primary"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required className="bg-background border-border focus:border-primary"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" required className="bg-background border-border focus:border-primary"/>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base">
              <UserPlus className="mr-2 h-5 w-5" /> Create Account
            </Button>
          </form>
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
