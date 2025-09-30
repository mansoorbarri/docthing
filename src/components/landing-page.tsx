"use client"

import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import {
  Activity,
  Calendar,
  Users,
  FileText,
  Clock,
  Shield,
  Zap,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  Heart,
  Building2,
} from "lucide-react"
import Link from "next/link"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">DocThing</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="#benefits"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Benefits
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#testimonials"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Testimonials
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Demo</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              <Heart className="mr-2 h-3.5 w-3.5 inline" />
              Trusted by 10,000+ healthcare professionals
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance mb-6">
              Modern clinic management <span className="text-primary">made simple</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-10 max-w-2xl mx-auto leading-relaxed">
              Streamline patient care, appointments, and records with our intuitive platform designed for healthcare
              professionals who value efficiency and patient experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base px-8" asChild>
                <Link href="/">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 bg-transparent">
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 p-8">
                {/* Dashboard Header Mockup */}
                <div className="bg-background rounded-lg border border-border p-4 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="h-4 w-32 bg-foreground rounded mb-1.5" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20" />
                  </div>
                </div>

                {/* Dashboard Content Mockup */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Stat Card 1 */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                        +12%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Patients</p>
                      <p className="text-3xl font-bold">1,284</p>
                    </div>
                  </Card>

                  {/* Stat Card 2 */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                        +8%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Appointments</p>
                      <p className="text-3xl font-bold">342</p>
                    </div>
                  </Card>

                  {/* Stat Card 3 */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                        +15%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Satisfaction</p>
                      <p className="text-3xl font-bold">98%</p>
                    </div>
                  </Card>
                </div>

                {/* Recent Activity Mockup */}
                <Card className="p-6 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Recent Activity</h3>
                    <div className="h-6 w-20 bg-muted rounded" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="h-8 w-8 rounded-full bg-primary/20" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-foreground/80 rounded w-3/4" />
                          <div className="h-2.5 bg-muted-foreground/50 rounded w-1/2" />
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by leading healthcare providers worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <span className="font-semibold text-lg">HealthFirst</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <span className="font-semibold text-lg">MediCare Plus</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <span className="font-semibold text-lg">WellnessHub</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <span className="font-semibold text-lg">CareConnect</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance mb-4">
              Everything you need to run your clinic
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Powerful features designed to streamline your workflow and improve patient care
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Patient Management",
                description:
                  "Comprehensive patient records with medical history, demographics, and treatment plans all in one place.",
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                description:
                  "Intuitive appointment booking with calendar views, automated reminders, and conflict prevention.",
              },
              {
                icon: FileText,
                title: "Digital Records",
                description:
                  "Secure, searchable medical records with instant access to patient information and documentation.",
              },
              {
                icon: BarChart3,
                title: "Analytics & Reports",
                description: "Real-time insights into clinic performance, patient trends, and financial metrics.",
              },
              {
                icon: Clock,
                title: "Time Tracking",
                description:
                  "Monitor appointment durations, wait times, and optimize your clinic schedule for efficiency.",
              },
              {
                icon: Shield,
                title: "HIPAA Compliant",
                description: "Enterprise-grade security with full HIPAA compliance to protect sensitive patient data.",
              },
            ].map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                <Zap className="mr-2 h-3.5 w-3.5 inline" />
                Efficiency
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance mb-6">
                Save time, focus on what matters
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Reduce administrative overhead by up to 60% and spend more time with your patients. Our platform
                automates routine tasks so you can focus on delivering exceptional care.
              </p>
              <div className="space-y-4">
                {[
                  "Automated appointment reminders reduce no-shows by 40%",
                  "Digital records save 2+ hours per day on paperwork",
                  "Smart scheduling optimizes your clinic capacity",
                  "Real-time analytics help you make data-driven decisions",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Time Saved</p>
                        <p className="text-2xl font-bold">2.5 hrs/day</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                      +60%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Patient Satisfaction</p>
                        <p className="text-2xl font-bold">4.8/5.0</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                      +25%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue Growth</p>
                        <p className="text-2xl font-bold">$12.5k/mo</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                      +35%
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance mb-4">
              Loved by healthcare professionals
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              See what clinic administrators and doctors are saying about DocThing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "DocThing transformed how we manage our practice. We've reduced administrative time by 50% and our patients love the streamlined experience.",
                author: "Dr. Sarah Johnson",
                role: "Family Medicine Physician",
                clinic: "HealthFirst Clinic",
              },
              {
                quote:
                  "The appointment scheduling system is intuitive and powerful. No more double bookings or missed appointments. Our efficiency has skyrocketed.",
                author: "Michael Chen",
                role: "Clinic Administrator",
                clinic: "WellnessHub Medical Center",
              },
              {
                quote:
                  "Having all patient records digitized and searchable has been a game-changer. I can access everything I need in seconds during consultations.",
                author: "Dr. Emily Rodriguez",
                role: "Internal Medicine Specialist",
                clinic: "CareConnect Health",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 fill-primary" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.clinic}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance mb-6">
              Ready to transform your clinic?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-10 text-pretty leading-relaxed">
              Join thousands of healthcare professionals who trust DocThing to manage their practice. Start your free
              trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-base px-8" asChild>
                <Link href="/">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Schedule a Demo
              </Button>
            </div>
            <p className="text-sm text-primary-foreground/80 mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Stethoscope className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold">DocThing</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Modern clinic management software for healthcare professionals.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    HIPAA Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 DocThing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
