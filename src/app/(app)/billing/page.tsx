'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ShieldCheck, Zap, Star, Gift } from "lucide-react";

const pricingPlans = [
  {
    id: "trial",
    name: "Free Trial",
    price: "$0",
    duration: "for the first month",
    icon: Gift,
    features: [
      "Access to core document types",
      "Up to 5 document drafts",
      "Standard AI drafting assistance",
      "Community support",
    ],
    cta: "Start Free Trial",
    current: true, // Example: assume user is on trial
    highlight: true,
  },
  {
    id: "basic",
    name: "LexAid Basic",
    price: "$19",
    duration: "per month",
    icon: ShieldCheck,
    features: [
      "Access to all document types",
      "Unlimited document drafts",
      "Standard AI drafting assistance",
      "Email support",
      "Basic clause bank access (soon)",
    ],
    cta: "Upgrade to Basic",
    current: false,
  },
  {
    id: "pro",
    name: "LexAid Pro",
    price: "$49",
    duration: "per month",
    icon: Zap,
    features: [
      "All Basic plan features",
      "Advanced AI insights & suggestions",
      "Full clause bank access (soon)",
      "Priority email & chat support",
      "Early access to new features",
    ],
    cta: "Upgrade to Pro",
    current: false,
  },
   {
    id: "enterprise",
    name: "LexAid Enterprise",
    price: "Custom",
    duration: "contact us",
    icon: Star,
    features: [
      "All Pro plan features",
      "Team collaboration tools",
      "Custom integrations",
      "Dedicated account manager",
      "Volume discounts",
    ],
    cta: "Contact Sales",
    current: false,
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <header className="pb-4 border-b border-border">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Subscription & Billing</h1>
        <p className="text-lg text-muted-foreground mt-1">Manage your LexAid plan, view invoices, and update payment methods.</p>
      </header>

      <Card className="shadow-lg rounded-xl border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
             <Gift className="mr-3 h-7 w-7" />
            One-Month Free Trial
          </CardTitle>
          <CardDescription>
            Welcome to LexAid Nigeria! You are currently on our <strong>1-month free trial</strong>. 
            Explore our core features and experience the power of AI-assisted legal drafting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your trial gives you access to essential tools to get started. To unlock the full potential of LexAid, consider upgrading to one of our paid plans.
          </p>
        </CardContent>
      </Card>

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-foreground">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {pricingPlans.map((plan) => {
            const PlanIcon = plan.icon;
            return (
              <Card 
                key={plan.id} 
                className={`flex flex-col shadow-lg rounded-xl border ${plan.highlight ? 'border-accent ring-2 ring-accent' : 'border-border'} ${plan.current ? 'bg-primary/5' : 'bg-card'}`}
              >
                <CardHeader className={`p-6 ${plan.highlight ? 'bg-accent/10' : ''}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <PlanIcon className={`h-8 w-8 ${plan.highlight ? 'text-accent' : 'text-primary'}`} />
                    <CardTitle className={`text-2xl ${plan.highlight ? 'text-accent-foreground' : 'text-foreground'}`}>{plan.name}</CardTitle>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{plan.price} <span className="text-sm font-normal text-muted-foreground">{plan.duration}</span></p>
                  {plan.current && <p className="text-sm text-primary font-semibold mt-1">(Current Plan)</p>}
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
                    className={`w-full py-3 text-base ${plan.highlight ? 'bg-accent text-accent-foreground hover:bg-accent/90' : plan.current ? 'bg-primary/80 text-primary-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                    disabled={plan.current || (plan.id !== "trial" && pricingPlans.find(p=>p.id === "trial")?.current)} // Disable other plans if on trial
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Placeholder for Billing History and Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg rounded-xl border-border">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Billing History</CardTitle>
            <CardDescription>View your past invoices and transaction details.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No billing history available yet. This section will populate once you have active subscriptions or purchases. (Feature coming soon)</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-xl border-border">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Payment Methods</CardTitle>
            <CardDescription>Manage your saved payment cards and details.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No payment methods saved. Add a payment method to subscribe to a plan. (Feature coming soon)</p>
            <Button variant="outline" className="mt-4 border-primary text-primary hover:bg-primary/10" disabled>Add Payment Method (Soon)</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
