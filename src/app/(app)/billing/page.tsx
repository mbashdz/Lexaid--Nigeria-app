// src/app/(app)/billing/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ShieldCheck, Zap, Star, Gift, Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getUserProfile, updateUserSubscription, type UserProfile } from '@/services/firestoreService';

declare global {
  interface Window {
    FlutterwaveCheckout?: (options: any) => void;
  }
}

const FLUTTERWAVE_PUBLIC_KEY = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;

const pricingPlansData = [
  {
    id: "trial",
    name: "Free Trial",
    price: "₦0",
    priceNGN: 0,
    currency: "NGN",
    duration: "for the first month",
    icon: Gift,
    features: [
      "Access to core document types",
      "Up to 5 document drafts",
      "Standard AI drafting assistance",
      "Community support",
    ],
    cta: "Current Plan",
    isCurrent: (plan: string) => plan === 'Free Trial' || !plan,
    isBase: true,
    highlight: true,
  },
  {
    id: "plus",
    name: "LexAid Plus",
    price: "₦10,000",
    priceNGN: 10000,
    currency: "NGN",
    duration: "per month",
    icon: ShieldCheck,
    features: [
      "Access to all document types",
      "Unlimited document drafts",
      "Standard AI drafting assistance",
      "Email support",
      "Basic clause bank access",
    ],
    cta: "Upgrade to Plus",
    isCurrent: (plan: string) => plan === 'LexAid Plus',
  },
  {
    id: "premium",
    name: "LexAid Premium",
    price: "₦20,000",
    priceNGN: 20000,
    currency: "NGN",
    duration: "per month",
    icon: Zap,
    features: [
      "All Plus plan features",
      "Advanced AI insights & suggestions",
      "Full clause bank access",
      "Priority email & chat support",
      "Early access to new features",
    ],
    cta: "Upgrade to Premium",
    isCurrent: (plan: string) => plan === 'LexAid Premium',
  },
   {
    id: "enterprise",
    name: "LexAid Enterprise",
    price: "Custom",
    priceNGN: 0, // Custom price, not payable directly
    currency: "NGN",
    duration: "contact us",
    icon: Star,
    features: [
      "All Premium plan features",
      "Team collaboration tools",
      "Custom integrations",
      "Dedicated account manager",
      "Volume discounts",
    ],
    cta: "Contact Sales",
    isCurrent: (plan: string) => plan === 'Enterprise',
  },
];

export default function BillingPage() {
  const { user, isFirebaseConfigured: firebaseReady } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isPaying, setIsPaying] = useState<string | null>(null); // Holds ID of plan being paid for
  const [flutterwaveLoaded, setFlutterwaveLoaded] = useState(false);

  useEffect(() => {
    if (user && firebaseReady) {
      const fetchProfile = async () => {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      };
      fetchProfile();
    }
  }, [user, firebaseReady]);

  const handlePayment = (plan: typeof pricingPlansData[0]) => {
    if (!FLUTTERWAVE_PUBLIC_KEY) {
      toast({ title: "Error", description: "Payment gateway not configured.", variant: "destructive" });
      return;
    }
    if (!user || !userProfile) {
      toast({ title: "Error", description: "User information not loaded.", variant: "destructive" });
      return;
    }
    if (!window.FlutterwaveCheckout) {
      toast({ title: "Error", description: "Payment script not loaded. Please refresh.", variant: "destructive" });
      return;
    }

    setIsPaying(plan.id);

    window.FlutterwaveCheckout({
      public_key: FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: `lexaid-${plan.id}-${user.uid}-${Date.now()}`,
      amount: plan.priceNGN,
      currency: plan.currency,
      payment_options: "card,ussd,banktransfer",
      redirect_url: "", // Handled by callback
      customer: {
        email: user.email!,
        phone_number: userProfile.phoneNumber || "",
        name: userProfile.displayName || user.displayName || "LexAid User",
      },
      meta: {
        consumer_id: user.uid,
        plan_id: plan.id,
        plan_name: plan.name,
      },
      customizations: {
        title: "LexAid Nigeria Subscription",
        description: `Payment for ${plan.name}`,
        logo: "https://picsum.photos/seed/lexaidlogo/50/50", // Replace with your actual logo URL
      },
      callback: async (response: any) => {
        console.log("Flutterwave payment successful:", response);
        if (response.status === "successful" || response.status === "completed") {
          try {
            await updateUserSubscription(user.uid, plan.name, response.transaction_id, plan.id);
            toast({
              title: "Payment Successful!",
              description: `You have successfully subscribed to ${plan.name}.`,
              variant: "default",
            });
            // Refresh user profile to reflect new plan
            const updatedProfile = await getUserProfile(user.uid);
            setUserProfile(updatedProfile);
          } catch (error) {
            console.error("Error updating subscription:", error);
            toast({ title: "Subscription Update Failed", description: (error as Error).message, variant: "destructive" });
          }
        } else {
           toast({ title: "Payment Processing", description: `Payment status: ${response.status}. Please check your Flutterwave dashboard.`, variant: "default" });
        }
        setIsPaying(null);
      },
      onclose: () => {
        if (isPaying) { // Only show this if a payment was actually attempted
             toast({ title: "Payment Incomplete", description: "You closed the payment modal without completing the payment.", variant: "default" });
        }
        setIsPaying(null);
      },
    });
  };
  
  const currentPlanName = userProfile?.subscriptionPlan || 'Free Trial';

  return (
    <>
      <Script
        src="https://checkout.flutterwave.com/v3.js"
        onLoad={() => {
          console.log("Flutterwave SDK loaded.");
          setFlutterwaveLoaded(true);
        }}
        onError={(e) => {
          console.error("Flutterwave SDK failed to load", e);
          toast({title: "Payment Error", description: "Could not load payment gateway. Please refresh.", variant: "destructive"});
        }}
      />
      <div className="space-y-8">
        <header className="pb-4 border-b border-border">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Subscription & Billing</h1>
          <p className="text-lg text-muted-foreground mt-1">Manage your LexAid plan, view invoices, and update payment methods.</p>
        </header>

        <Card className="shadow-lg rounded-xl border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center">
              {pricingPlansData.find(p => p.isCurrent(currentPlanName))?.icon ? 
                (React.createElement(pricingPlansData.find(p => p.isCurrent(currentPlanName))!.icon, {className: "mr-3 h-7 w-7"})) :
                <Gift className="mr-3 h-7 w-7" /> 
              }
              Current Plan: {currentPlanName}
            </CardTitle>
            <CardDescription>
              {currentPlanName === 'Free Trial' 
                ? "You are currently on our 1-month free trial. Explore core features and upgrade to unlock more."
                : `You are subscribed to ${currentPlanName}. Enjoy your premium features!`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To unlock the full potential of LexAid, consider upgrading or managing your subscription below.
            </p>
          </CardContent>
        </Card>

        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-foreground">Choose Your Plan</h2>
          {!FLUTTERWAVE_PUBLIC_KEY && (
            <Card className="bg-destructive/10 border-destructive/30">
              <CardContent className="p-4 text-center text-destructive-foreground">
                Payment gateway is not configured. Upgrades are currently unavailable.
              </CardContent>
            </Card>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {pricingPlansData.map((plan) => {
              const PlanIcon = plan.icon;
              const isUserCurrentPlan = plan.isCurrent(currentPlanName);
              const isTrialPlan = plan.id === "trial";

              return (
                <Card 
                  key={plan.id} 
                  className={`flex flex-col shadow-lg rounded-xl border ${plan.highlight && currentPlanName === 'Free Trial' ? 'border-accent ring-2 ring-accent' : isUserCurrentPlan ? 'border-primary ring-2 ring-primary' : 'border-border'} ${isUserCurrentPlan ? 'bg-primary/5' : 'bg-card'}`}
                >
                  <CardHeader className={`p-6 ${plan.highlight && currentPlanName === 'Free Trial' ? 'bg-accent/10' : ''}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <PlanIcon className={`h-8 w-8 ${plan.highlight && currentPlanName === 'Free Trial' ? 'text-accent' : isUserCurrentPlan ? 'text-primary' : 'text-primary'}`} />
                      <CardTitle className={`text-2xl ${plan.highlight && currentPlanName === 'Free Trial' ? 'text-accent-foreground' : isUserCurrentPlan ? 'text-primary' : 'text-foreground'}`}>{plan.name}</CardTitle>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{plan.price} <span className="text-sm font-normal text-muted-foreground">{plan.duration}</span></p>
                    {isUserCurrentPlan && <p className="text-sm text-primary font-semibold mt-1">(Current Plan)</p>}
                  </CardHeader>
                  <CardContent className="p-6 flex-grow">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="p-6 border-t border-border mt-auto">
                    <Button 
                      size="lg" 
                      className={`w-full py-3 text-base 
                        ${plan.highlight && currentPlanName === 'Free Trial' && !isTrialPlan ? 'bg-accent text-accent-foreground hover:bg-accent/90' 
                        : isUserCurrentPlan || plan.id === "enterprise" ? 'bg-primary/80 text-primary-foreground cursor-not-allowed' 
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                      disabled={isUserCurrentPlan || isPaying !== null || !FLUTTERWAVE_PUBLIC_KEY || plan.priceNGN === 0 && plan.id !== "enterprise" || !flutterwaveLoaded}
                      onClick={() => {
                        if (plan.id === "enterprise") {
                           toast({title: "Enterprise Plan", description: "Please contact sales for Enterprise options."});
                        } else if (plan.priceNGN > 0 && !isUserCurrentPlan) {
                          handlePayment(plan);
                        }
                      }}
                    >
                      {isPaying === plan.id ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                      {isUserCurrentPlan ? "Current Plan" : plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg rounded-xl border-border">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Billing History</CardTitle>
              <CardDescription>View your past invoices and transaction details.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No billing history available yet. (Feature coming soon)</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl border-border">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Payment Methods</CardTitle>
              <CardDescription>Manage your saved payment cards and details.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Payment methods are managed by Flutterwave. (Feature coming soon)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
