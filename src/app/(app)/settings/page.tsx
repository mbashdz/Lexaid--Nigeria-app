
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Bell, ShieldCheck, Palette, Wrench, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile, getUserProfile, type UserProfile } from '@/services/firestoreService';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';


export default function SettingsPage() {
  const { toast } = useToast();
  const { user, isFirebaseConfigured: firebaseReady } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  useEffect(() => {
    if (user && firebaseReady) {
      setEmail(user.email || '');
      // Fetch profile from Firestore
      const fetchProfile = async () => {
        setIsLoadingProfile(true);
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setFullName(profile.displayName || user.displayName || '');
            setPhoneNumber(profile.phoneNumber || '');
            setEmailNotifications(profile.emailNotifications !== undefined ? profile.emailNotifications : true);
            setInAppNotifications(profile.inAppNotifications !== undefined ? profile.inAppNotifications : true);
          } else {
            // If no profile in Firestore, use auth data and defaults
            setFullName(user.displayName || '');
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast({ title: "Error", description: "Could not load profile settings.", variant: "destructive" });
           setFullName(user.displayName || ''); // Fallback
        } finally {
          setIsLoadingProfile(false);
        }
      };
      fetchProfile();
    } else if (!user && !firebaseReady) {
        setIsLoadingProfile(false);
    }
  }, [user, firebaseReady, toast]);

  const handleSaveProfileChanges = async () => {
    if (!user || !firebaseReady) {
      toast({ title: "Error", description: "User not authenticated or Firebase not ready.", variant: "destructive" });
      return;
    }
    setIsSavingProfile(true);
    try {
      // Update Firebase Auth display name
      if (auth.currentUser && auth.currentUser.displayName !== fullName) {
         await updateAuthProfile(auth.currentUser, { displayName: fullName });
      }
      // Update Firestore profile
      const profileData: Partial<UserProfile> = { displayName: fullName, phoneNumber };
      await updateUserProfile(user.uid, profileData);
      
      toast({
        title: "Profile Settings Updated",
        description: "Your profile changes have been saved.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Error", description: "Could not save profile changes.", variant: "destructive" });
    } finally {
      setIsSavingProfile(false);
    }
  };
  
  const handleSaveNotificationChanges = async () => {
    if (!user || !firebaseReady) {
      toast({ title: "Error", description: "User not authenticated or Firebase not ready.", variant: "destructive" });
      return;
    }
    setIsSavingNotifications(true);
    try {
      const notificationData: Partial<UserProfile> = { emailNotifications, inAppNotifications };
      await updateUserProfile(user.uid, notificationData);
      toast({
        title: "Notification Preferences Updated",
        description: "Your notification preferences have been saved.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast({ title: "Error", description: "Could not save notification preferences.", variant: "destructive" });
    } finally {
      setIsSavingNotifications(false);
    }
  };
  
  if (isLoadingProfile) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="pb-4 border-b border-border">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Account Settings</h1>
        <p className="text-lg text-muted-foreground mt-1">Manage your profile, preferences, and application settings.</p>
      </header>

      {/* Profile Settings Card */}
      <Card className="shadow-lg rounded-xl border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <User className="mr-3 h-7 w-7" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal details and contact information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name" 
                className="bg-background border-input focus:border-primary"
                disabled={isSavingProfile || !firebaseReady}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                readOnly 
                placeholder="your.email@example.com" 
                className="bg-muted border-input focus:border-primary cursor-not-allowed"
                disabled={!firebaseReady}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
            <Input 
              id="phoneNumber" 
              type="tel" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+234 XXX XXX XXXX" 
              className="bg-background border-input focus:border-primary"
              disabled={isSavingProfile || !firebaseReady}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t border-border pt-6">
          <Button onClick={handleSaveProfileChanges} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSavingProfile || !firebaseReady}>
            {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Notification Settings Card */}
      <Card className="shadow-lg rounded-xl border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <Bell className="mr-3 h-7 w-7" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose how you receive updates and alerts from LexAid.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-4 p-4 rounded-md border border-input bg-background/50">
            <div>
              <Label htmlFor="emailNotifications" className="text-base font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates about new features and important announcements.</p>
            </div>
            <Switch 
              id="emailNotifications" 
              checked={emailNotifications} 
              onCheckedChange={setEmailNotifications}
              disabled={isSavingNotifications || !firebaseReady}
            />
          </div>
          <div className="flex items-center justify-between space-x-4 p-4 rounded-md border border-input bg-background/50">
            <div>
              <Label htmlFor="inAppNotifications" className="text-base font-medium">In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified within the app for drafting updates and suggestions.</p>
            </div>
            <Switch 
              id="inAppNotifications" 
              checked={inAppNotifications}
              onCheckedChange={setInAppNotifications}
              disabled={isSavingNotifications || !firebaseReady}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t border-border pt-6">
          <Button onClick={handleSaveNotificationChanges} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSavingNotifications || !firebaseReady}>
            {isSavingNotifications && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Notification Preferences
          </Button>
        </CardFooter>
      </Card>
      
      {/* Security Settings Card - Placeholder */}
      <Card className="shadow-lg rounded-xl border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <ShieldCheck className="mr-3 h-7 w-7" />
            Security & Password
          </CardTitle>
          <CardDescription>Manage your account security and password settings.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Password change and two-factor authentication settings will be available here soon.</p>
        </CardContent>
         <CardFooter className="border-t border-border pt-6">
          <Button onClick={() => toast({ title: "Feature Coming Soon", description: "Security settings will be available soon."})} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled>Update Security (Soon)</Button>
        </CardFooter>
      </Card>

      {/* Appearance Settings Card - Placeholder */}
      <Card className="shadow-lg rounded-xl border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <Palette className="mr-3 h-7 w-7" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Theme options (Light/Dark mode) and other appearance settings will be available here soon.</p>
        </CardContent>
         <CardFooter className="border-t border-border pt-6">
          <Button onClick={() => toast({ title: "Feature Coming Soon", description: "Appearance settings will be available soon."})} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled>Customize Appearance (Soon)</Button>
        </CardFooter>
      </Card>

      {!firebaseReady && (
         <Card className="bg-destructive/10 border-destructive/30 shadow-sm rounded-xl mt-10">
            <CardHeader className="flex flex-row items-center gap-3">
            <Wrench className="h-8 w-8 text-destructive" />
            <div>
                <CardTitle className="text-destructive text-xl">Configuration Issue</CardTitle>
                <CardDescription className="text-destructive/80">Some settings may not function correctly.</CardDescription>
            </div>
            </CardHeader>
            <CardContent>
            <p className="text-muted-foreground">
                Firebase is not configured. Please set up your <code>.env.local</code> file.
            </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
