import AIBox from './components/AIBox'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/attached_assets/Logo Money Expert - Elegant Emblem Design_1754451808238.png" 
                alt="MoneyXprt Logo" 
                className="h-10 w-10"
              />
              <h1 className="text-2xl font-bold text-emerald-deep">MoneyXprt</h1>
            </div>
            
            <div className="flex items-center space-x-4">
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Financial Co-Pilot
            <span className="block text-emerald-deep">for High-Income Earners</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get personalized tax strategies, investment advice, and wealth optimization 
            tailored for W-2 earners and real estate investors.
          </p>
        </div>

        {/* AI Chat Box */}
        <AIBox />

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-emerald-deep rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Optimization</h3>
            <p className="text-gray-600">Maximize deductions and minimize tax burden with AI-driven strategies.</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-emerald-deep rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">📈</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Investment Guidance</h3>
            <p className="text-gray-600">Portfolio analysis and investment recommendations for wealth building.</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-emerald-deep rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">🏠</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real Estate</h3>
            <p className="text-gray-600">Strategic advice for real estate investments and property management.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-emerald-deep rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Optimize Your Wealth?
          </h2>
          <p className="text-emerald-100 mb-6">
            Join thousands of high-income earners who trust MoneyXprt for financial guidance.
          </p>
          <a
            href="/signup"
            className="inline-block bg-gold hover:bg-yellow-400 text-emerald-deep font-semibold px-8 py-3 rounded-md transition-colors duration-200"
          >
            Start Your Financial Journey
          </a>
        </div>
      </main>
    </div>
  )
}