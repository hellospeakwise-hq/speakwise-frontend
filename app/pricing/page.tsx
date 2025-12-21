'use client'

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "Basic speaker profile",
        "Up to 5 events per month",
        "Basic analytics",
        "Community support",
        "Anonymous feedback",
      ],
    },
    {
      name: "Pro",
      price: "$29",
      description: "For serious speakers",
      features: [
        "Everything in Free",
        "Unlimited events",
        "Advanced analytics & insights",
        "Priority support",
        "Custom branding",
        "Export data",
        "API access",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      description: "For organizations & agencies",
      features: [
        "Everything in Pro",
        "Multiple team members",
        "White-label solution",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
        "Advanced security",
      ],
    },
  ]

  return (
    <div className="relative min-h-screen">
      {/* Blurred Background with Pricing Cards */}
      <div className="blur-sm pointer-events-none">
        <section className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
            <h1 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Simple, Transparent Pricing
            </h1>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Choose the plan that's right for you. Upgrade or downgrade at any time.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.popular ? "border-orange-500 shadow-lg scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${
                      plan.popular ? "bg-orange-500 hover:bg-orange-600" : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Overlay Message */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center space-y-6 pointer-events-auto">
          <div className="text-8xl animate-bounce">
            😊
          </div>
          <h2 className="text-4xl md:text-6xl font-bold">
            Enjoy SpeakWise for now!
          </h2>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Pricing coming soon. In the meantime, enjoy all features completely free.
          </p>
        </div>
      </div>
    </div>
  )
}
