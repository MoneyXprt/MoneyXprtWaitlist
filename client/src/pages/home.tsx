import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  Bot, 
  PieChart, 
  Home as HomeIcon,
  Twitter,
  Linkedin,
  Github,
  Menu,
  Send,
  MessageCircle
} from "lucide-react";

export default function HomePage() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setIsAiLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAiResponse("Thank you for your interest! MoneyXprt AI will provide personalized financial guidance based on your income level and goals. Our system can help optimize tax strategies, suggest investment approaches, and provide wealth preservation advice tailored to high-income professionals like yourself.");
      
      toast({
        title: "AI Response Generated",
        description: "Your financial question has been analyzed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/attached_assets/Logo Money Expert - Elegant Emblem Design_1754451808238.png" 
                alt="MoneyXprt Logo" 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-gray-900">MoneyXprt</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
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
                className="bg-white text-emerald-deep border-2 border-emerald-deep hover:bg-emerald-deep hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm"
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="bg-emerald-deep text-white hover:bg-emerald-700 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-md border-2 border-emerald-deep"
              >
                Get Started
              </a>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-gray-600"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
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
                <a
                  href="/login"
                  className="bg-white text-emerald-deep border-2 border-emerald-deep hover:bg-emerald-deep hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm text-center"
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="bg-emerald-deep text-white hover:bg-emerald-700 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-md border-2 border-emerald-deep text-center"
                >
                  Get Started
                </a>
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

            <div className="flex justify-center space-x-4">
              <Button 
                size="lg"
                className="bg-gold text-emerald-deep hover:bg-yellow-400 text-lg px-8 py-4 h-auto transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold"
                onClick={() => window.location.href = '/signup'}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="bg-white/20 text-white border-white hover:bg-white hover:text-emerald-deep text-lg px-8 py-4 h-auto transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold"
                onClick={() => scrollToSection('features')}
              >
                Learn More
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

      {/* How It Works Section */}
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
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect Your Accounts</h3>
              <p className="text-gray-600">
                Securely link your financial accounts so we can analyze your complete financial picture.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI analyzes your income, expenses, investments, and goals to identify optimization opportunities.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Recommendations</h3>
              <p className="text-gray-600">
                Receive personalized strategies for tax optimization, investments, and wealth building.
              </p>
            </div>
          </div>
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
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {aiResponse}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick prompt buttons */}
              <div className="flex flex-wrap gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setAiPrompt("How can I reduce my tax burden as a high-income earner?")}
                  className="px-4 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                  disabled={isAiLoading}
                >
                  Tax optimization
                </button>
                <button
                  type="button"
                  onClick={() => setAiPrompt("What investment strategies work best for my income level?")}
                  className="px-4 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                  disabled={isAiLoading}
                >
                  Investment advice
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works best for your financial goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="relative p-8 border-2 border-gray-200">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Starter</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$29</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <span className="text-gray-600">Basic AI financial insights</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <span className="text-gray-600">Monthly reports</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <span className="text-gray-600">Email support</span>
                  </li>
                </ul>
                <Button className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="relative p-8 border-2 border-emerald-600 bg-emerald-50">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <span className="text-gray-600">Advanced AI optimization</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <span className="text-gray-600">Weekly insights</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <span className="text-gray-600">Priority support</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <span className="text-gray-600">Tax optimization tools</span>
                  </li>
                </ul>
                <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="relative p-8 border-2 border-gray-200">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Enterprise</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$299</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <span className="text-gray-600">Full AI suite</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <span className="text-gray-600">Daily monitoring</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <span className="text-gray-600">Dedicated advisor</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <span className="text-gray-600">Custom integrations</span>
                  </li>
                </ul>
                <Button className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/attached_assets/Logo Money Expert - Elegant Emblem Design_1754451808238.png" 
                  alt="MoneyXprt Logo" 
                  className="h-8 w-8"
                />
                <span className="text-xl font-bold">MoneyXprt</span>
              </div>
              <p className="text-gray-400">
                AI-powered financial optimization for high-income professionals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MoneyXprt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}