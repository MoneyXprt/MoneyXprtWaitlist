import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase, type WaitlistEntry } from "@/lib/supabase";
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
  Menu,
  Send,
  MessageCircle
} from "lucide-react";

// Simple email validation schema
const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  income: z.string().optional(),
  goal: z.string().optional(),
});

type WaitlistForm = z.infer<typeof waitlistSchema>;

export default function HomePage() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<WaitlistForm>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: "",
      income: "",
      goal: "",
    },
  });

  const handleWaitlistSubmit = async (data: WaitlistForm) => {
    setIsSubmitting(true);
    try {
      const waitlistEntry: WaitlistEntry = {
        email: data.email,
        income: data.income || null,
        goal: data.goal || null
      };

      const { data: result, error } = await supabase
        .from('waitlist')
        .insert([waitlistEntry])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Error",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Thanks for joining!",
          description: "We'll notify you when MoneyXprt launches.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        form.reset();
        document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: WaitlistForm) => {
    handleWaitlistSubmit(data);
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response) {
        setAiResponse(data.response);
        setAiPrompt(""); // Clear the input after successful response
      } else if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('AI fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
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
                <a
                  href="/login"
                  className="text-emerald-deep hover:text-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="bg-emerald-deep text-white hover:bg-emerald-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Get Started
                </a>
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
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg font-semibold transform hover:scale-[1.02] transition-all gradient-gold text-emerald-deep hover:bg-yellow-400"
                  >
                    {isSubmitting ? (
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

      {/* AI Assistant Demo */}
      <section className="py-20 bg-emerald-deep">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src="/attached_assets/Logo Money Expert - Elegant Emblem Design_1754451808238.png" 
                alt="MoneyXprt Logo" 
                className="h-12 w-12"
              />
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Try MoneyXprt AI
              </h2>
            </div>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Ask our AI financial co-pilot any question about wealth optimization, tax strategies, or investment planning.
            </p>
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border-gold/30">
            <CardContent className="p-8">
              <form onSubmit={handleAiSubmit} className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <MessageCircle className="h-6 w-6 text-gold" />
                  <Label className="text-white font-medium text-lg">
                    Ask MoneyXprt anything about finances:
                  </Label>
                </div>
                
                <div className="flex space-x-3">
                  <Input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., How can I optimize my tax strategy for high income?"
                    className="flex-1 h-12 bg-white/90 border-white/30 text-gray-900 placeholder:text-gray-500"
                    disabled={isAiLoading}
                  />
                  <Button
                    type="submit"
                    disabled={isAiLoading || !aiPrompt.trim()}
                    className="bg-gold text-emerald-deep hover:bg-yellow-400 px-6 font-semibold"
                  >
                    {isAiLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-deep" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </form>

              {aiResponse && (
                <div className="mt-8 p-6 bg-white/90 rounded-lg border border-gold/30">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-emerald-deep rounded-full flex items-center justify-center">
                        <Bot className="h-5 w-5 text-gold" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-emerald-deep mb-2">MoneyXprt AI:</h4>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => setAiPrompt("What are the best tax strategies for high-income earners?")}
                  className="px-4 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                  disabled={isAiLoading}
                >
                  Tax optimization strategies
                </button>
                <button
                  type="button"
                  onClick={() => setAiPrompt("How should I diversify my investment portfolio?")}
                  className="px-4 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                  disabled={isAiLoading}
                >
                  Portfolio diversification
                </button>
                <button
                  type="button"
                  onClick={() => setAiPrompt("What are the best wealth preservation strategies?")}
                  className="px-4 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                  disabled={isAiLoading}
                >
                  Wealth preservation
                </button>
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
