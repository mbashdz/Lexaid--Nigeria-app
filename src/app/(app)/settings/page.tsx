'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Bell, ShieldCheck, Palette, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSaveChanges = (section: string) => {
    // Placeholder for actual save logic
    toast({
      title: `${section} Settings Updated`,
      description: `Your changes to ${section.toLowerCase()} settings have been saved (simulated).`,
      variant: "default"
    });
  };

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
              <Input id="fullName" defaultValue="Barrister Doe" placeholder="Your full name" className="bg-background border-input focus:border-primary"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="b.doe@lexmail.ng" placeholder="your.email@example.com" className="bg-background border-input focus:border-primary"/>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
            <Input id="phoneNumber" type="tel" placeholder="+234 XXX XXX XXXX" className="bg-background border-input focus:border-primary"/>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border pt-6">
          <Button onClick={() => handleSaveChanges("Profile")} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Profile Changes</Button>
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
            <Switch id="emailNotifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-4 p-4 rounded-md border border-input bg-background/50">
            <div>
              <Label htmlFor="inAppNotifications" className="text-base font-medium">In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified within the app for drafting updates and suggestions.</p>
            </div>
            <Switch id="inAppNotifications" defaultChecked />
          </div>
        </CardContent>
        <CardFooter className="border-t border-border pt-6">
          <Button onClick={() => handleSaveChanges("Notification")} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Notification Preferences</Button>
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
          <Button onClick={() => handleSaveChanges("Security")} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled>Update Security (Soon)</Button>
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
          <Button onClick={() => handleSaveChanges("Appearance")} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled>Customize Appearance (Soon)</Button>
        </CardFooter>
      </Card>

      <Card className="bg-accent/10 border-accent/30 shadow-sm rounded-xl mt-10">
        <CardHeader className="flex flex-row items-center gap-3">
          <Wrench className="h-8 w-8 text-accent" />
          <div>
            <CardTitle className="text-accent text-xl">More Settings Coming Soon</CardTitle>
            <CardDescription className="text-accent/80">We are continuously working on enhancing your experience.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Advanced settings for integrations, API access, and data export will be added in future updates. 
            Your current settings are placeholders and will be fully functional soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
