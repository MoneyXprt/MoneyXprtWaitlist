import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertWaitlistSchema, type InsertWaitlist } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  Bot, 
  PieChart, 
  Home as HomeIcon,
  Lock,
  Mail,
  Clock,
  CheckCircle,
  Twitter,
  Linkedin,
  Github,
  Menu
} from "lucide-react";

export default function HomePage() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertWaitlist>({
    resolver: zodResolver(insertWaitlistSchema),
    defaultValues: {
      email: "",
      name: "",
      income: undefined,
      goal: undefined,
    },
  });

  const waitlistMutation = useMutation({
    mutationFn: async (data: InsertWaitlist) => {
      const response = await apiRequest("POST", "/api/waitlist", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome to the waitlist!",
        description: "We'll notify you when MoneyXprt launches. Check your email for confirmation.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      form.reset();
      // Scroll to success message area
      document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    onError: (error: any) => {
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertWaitlist) => {
    waitlistMutation.mutate(data);
  };

  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setShowMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Next.js App Banner */}
      <div className="bg-emerald-deep text-white p-4 text-center border-b-2 border-gold">
        <p className="text-sm">
          <span className="text-gold font-bold">MoneyXprt Next.js App is Ready!</span> 
          <span className="ml-2">Complete with Supabase auth, OpenAI chat, and dashboard.</span>
          <a 
            href="https://github.com/your-repo/moneyxprt" 
            className="ml-4 text-gold underline hover:text-yellow-300"
            target="_blank" 
            rel="noopener noreferrer"
          >
            View Source Code →
          </a>
        </p>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/attached_assets/Logo Money Expert - Elegant Emblem Design_1754451808238.png" 
                alt="MoneyXprt Logo" 
                className="h-10 w-10"
              />
              <h1 className="text-2xl font-bold text-primary">MoneyXprt</h1>
            </div>
            
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  How It Works
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Pricing
                </button>
              </div>
            </nav>
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          {showMobileMenu && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors text-left"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors text-left"
                >
                  How It Works
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors text-left"
                >
                  Pricing
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        {/* Background SVG Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,40 T100,35" stroke="white" strokeWidth="0.5" fill="none"/>
            <path d="M0,60 Q25,40 50,50 T100,45" stroke="white" strokeWidth="0.3" fill="none"/>
            <path d="M0,70 Q25,50 50,60 T100,55" stroke="white" strokeWidth="0.2" fill="none"/>
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              AI-powered financial co-pilot<br />
              <span className="text-gold">for high-income earners</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Optimize your wealth with personalized AI-driven insights, tax strategies, and investment recommendations tailored for your income level.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12 text-gray-200">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gold" />
                <span className="text-sm">Bank-grade security</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gold" />
                <span className="text-sm">AI-powered insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gold" />
                <span className="text-sm">10K+ professionals</span>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={scrollToWaitlist}
                size="lg"
                className="bg-gold text-emerald-deep hover:bg-yellow-400 text-lg px-8 py-4 h-auto transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold"
              >
                Join the Waitlist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Designed for ambitious professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced financial planning tools that scale with your success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow bg-gray-50">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Tax Optimization</h3>
                <p className="text-gray-600">
                  Smart algorithms analyze your income streams and suggest personalized tax strategies to maximize your savings.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow bg-gray-50">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PieChart className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Rebalancing</h3>
                <p className="text-gray-600">
                  Automated portfolio optimization based on your risk tolerance, timeline, and financial goals.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow bg-gray-50">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HomeIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Real Estate Insights</h3>
                <p className="text-gray-600">
                  Market analysis and investment opportunities tailored to your location and investment capacity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Waitlist Form */}
      <section id="waitlist" className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Get early access
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of high-income professionals who are already optimizing their wealth with AI
            </p>
          </div>

          <Card className="shadow-2xl">
            <CardContent className="p-8 lg:p-12">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Email Address *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="your.email@company.com"
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="John Smith"
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="income"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Annual Income Range
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select income range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="100k-250k">$100K - $250K</SelectItem>
                            <SelectItem value="250k-500k">$250K - $500K</SelectItem>
                            <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                            <SelectItem value="1m-plus">$1M+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Primary Financial Goal
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select your primary goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tax-planning">Tax Planning & Optimization</SelectItem>
                            <SelectItem value="retirement">Retirement Planning</SelectItem>
                            <SelectItem value="real-estate">Real Estate Investment</SelectItem>
                            <SelectItem value="wealth-preservation">Wealth Preservation</SelectItem>
                            <SelectItem value="estate-planning">Estate Planning</SelectItem>
                            <SelectItem value="business-planning">Business Financial Planning</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={waitlistMutation.isPending}
                    className="w-full h-14 text-lg font-semibold transform hover:scale-[1.02] transition-all gradient-gold text-emerald-deep hover:bg-yellow-400"
                  >
                    {waitlistMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Joining...
                      </>
                    ) : (
                      <>
                        Join the Waitlist
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-gray-200 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Lock className="h-4 w-4 text-green-500" />
                  <span>Secure & encrypted</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span>No spam, ever</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span>Early access priority</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How MoneyXprt works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to optimize your financial future
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect Your Accounts</h3>
              <p className="text-gray-600">
                Securely link your bank accounts, investments, and financial data through our encrypted platform.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI analyzes your financial patterns, goals, and market conditions to create personalized recommendations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Optimize & Execute</h3>
              <p className="text-gray-600">
                Receive actionable insights and automated optimizations to maximize your wealth growth and tax efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-deep text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/attached_assets/Logo Money Expert - Elegant Emblem Design_1754451808238.png" 
                  alt="MoneyXprt Logo" 
                  className="h-8 w-8"
                />
                <h3 className="text-2xl font-bold text-gold">MoneyXprt</h3>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                AI-powered financial co-pilot designed for high-income earners who want to optimize their wealth intelligently.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-gold transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gold transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gold transition-colors">
                  <Github className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gold">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-gold transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-gold transition-colors">
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('pricing')} className="hover:text-gold transition-colors">
                    Pricing
                  </button>
                </li>
                <li><a href="#" className="hover:text-gold transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gold">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-gold transition-colors">About</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-gold transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-emerald-600 mt-8 pt-8 text-center">
            <p className="text-gray-300">
              © 2024 <span className="text-gold font-semibold">MoneyXprt</span>. All rights reserved. | Built with React, Supabase, and Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
