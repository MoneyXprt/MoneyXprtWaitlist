import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  ArrowRight,
  TrendingUp,
  PieChart,
  Shield
} from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "Tax Optimization Strategies for High-Income Earners in 2024",
    excerpt: "Discover advanced tax planning techniques that can save you thousands. From strategic deductions to retirement account optimization, learn how to legally minimize your tax burden.",
    author: "Sarah Chen",
    date: "March 15, 2024",
    readTime: "8 min read",
    category: "Tax Planning",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop",
    featured: true
  },
  {
    id: 2,
    title: "The Future of AI in Wealth Management",
    excerpt: "How artificial intelligence is revolutionizing financial planning and what it means for high-net-worth individuals seeking personalized investment strategies.",
    author: "Michael Rodriguez",
    date: "March 12, 2024",
    readTime: "6 min read",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop"
  },
  {
    id: 3,
    title: "Estate Planning Essentials for Entrepreneurs",
    excerpt: "Protect your business legacy and minimize estate taxes with these crucial estate planning strategies tailored for successful entrepreneurs and business owners.",
    author: "Jennifer Kim",
    date: "March 10, 2024",
    readTime: "10 min read",
    category: "Estate Planning",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=200&fit=crop"
  },
  {
    id: 4,
    title: "Real Estate Investment Strategies for High-Income Professionals",
    excerpt: "Explore sophisticated real estate investment approaches, from REITs to direct property ownership, and learn how to leverage real estate for wealth building.",
    author: "David Thompson",
    date: "March 8, 2024",
    readTime: "7 min read",
    category: "Real Estate",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=200&fit=crop"
  },
  {
    id: 5,
    title: "Cryptocurrency Tax Implications: What You Need to Know",
    excerpt: "Navigate the complex world of crypto taxation with confidence. Understand reporting requirements, capital gains, and strategies for crypto investors.",
    author: "Alex Patel",
    date: "March 5, 2024",
    readTime: "9 min read",
    category: "Cryptocurrency",
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop"
  },
  {
    id: 6,
    title: "Building a Diversified Investment Portfolio in Volatile Markets",
    excerpt: "Learn how to construct a resilient investment portfolio that can weather market storms while maximizing returns for long-term wealth growth.",
    author: "Rachel Green",
    date: "March 3, 2024",
    readTime: "8 min read",
    category: "Investment Strategy",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop"
  }
];

const categories = ["All", "Tax Planning", "Technology", "Estate Planning", "Real Estate", "Cryptocurrency", "Investment Strategy"];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/attached_assets/Logo Money Expert - Elegant Emblem Design_1755314325744.png" 
                alt="MoneyXprt Logo" 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-gray-900">MoneyXprt</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="text-gray-600 hover:text-emerald-600">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            MoneyXprt Blog
          </h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
            Insights, strategies, and expert advice for high-income professionals 
            looking to optimize their wealth and financial future.
          </p>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categories Filter */}
          <div className="flex flex-wrap gap-3 mb-12">
            {categories.map((category) => (
              <Badge 
                key={category}
                variant={category === "All" ? "default" : "outline"}
                className={`px-4 py-2 cursor-pointer transition-colors ${
                  category === "All" 
                    ? "bg-emerald-600 text-white" 
                    : "hover:bg-emerald-50 hover:border-emerald-600"
                }`}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Featured Post */}
          <div className="mb-16">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4 bg-emerald-600">{blogPosts[0].category}</Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{blogPosts[0].author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{blogPosts[0].date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{blogPosts[0].readTime}</span>
                  </div>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Read Full Article
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div>
                <img 
                  src={blogPosts[0].image} 
                  alt={blogPosts[0].title}
                  className="w-full h-80 object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{post.category}</Badge>
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                  </div>
                  <CardTitle className="text-xl mb-2 line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                      Read More
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white">
              Load More Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            <h2 className="text-3xl font-bold text-gray-900">Stay Informed</h2>
          </div>
          <p className="text-lg text-gray-600 mb-8">
            Get the latest financial insights and wealth optimization strategies 
            delivered straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />
            <Button className="bg-emerald-600 hover:bg-emerald-700 px-8">
              Subscribe
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/attached_assets/Logo Money Expert - Elegant Emblem Design_1755314325744.png" 
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
                <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
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