# MoneyXprt - AI Financial Co-Pilot

MoneyXprt is a modern financial web application designed for high-income earners, featuring an AI-powered financial advisor that provides personalized tax optimization strategies, investment guidance, and wealth management advice.

## Features

- 🤖 **AI Financial Advisor** - OpenAI GPT-4o powered financial guidance
- 🔐 **Secure Authentication** - Supabase Auth with email verification
- 💳 **Subscription Payments** - Stripe integration for premium features
- 📊 **Usage Tracking** - Daily limits with subscription-based access
- 💬 **Conversation History** - Track and review past financial advice
- 👤 **User Profiles** - Personalized onboarding and profile management
- 🎨 **Modern UI** - shadcn/ui components with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth
- **Payments**: Stripe Checkout & Webhooks
- **AI**: OpenAI GPT-4o API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- Stripe account (for payments)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID_STARTER=price_your_price_id

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/moneyxprt.git
   cd moneyxprt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase Database**
   - Create a new Supabase project
   - Run the SQL from `supabase-policies.sql` in your Supabase SQL editor
   - Enable email verification in Auth settings

4. **Configure Stripe**
   - Create products and prices in Stripe Dashboard
   - Set up webhook endpoint pointing to `/api/stripe/webhook`
   - Copy webhook secret to environment variables

5. **Run the development server**
   ```bash
   npm run dev
   ```

## Database Schema

The application uses these main tables:

- **waitlist** - Email signups and user interest
- **profiles** - User profile information (name, income, entity type)
- **conversations** - AI chat history with user context
- **usage_daily** - Daily API usage tracking per user
- **billing** - Subscription status and Stripe customer data

## API Endpoints

- `POST /api/waitlist` - Waitlist signup
- `POST /api/ask` - AI financial advice with usage limits
- `POST /api/stripe/checkout` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## Subscription Model

- **Free Tier**: 10 AI requests per day
- **Starter Plan**: $9/month for 1,000 requests per day
- **Usage Enforcement**: API checks subscription status before processing

## Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository
   - Add all environment variables from `.env.local`
   - Deploy automatically

3. **Configure Stripe Webhooks**
   - Update webhook endpoint to your production URL
   - Test webhook delivery

## Environment Variables for Production

Set these in your Vercel project settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE=your_production_service_role_key
OPENAI_API_KEY=your_openai_api_key
VITE_STRIPE_PUBLIC_KEY=pk_live_your_live_publishable_key
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
STRIPE_PRICE_ID_STARTER=price_your_live_price_id
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Features & Usage

### AI Financial Advisor
- Personalized advice based on user profile (income, entity type)
- Context-aware responses with financial disclaimers
- Rate limiting to prevent abuse

### User Management
- Email/password authentication with verification
- Comprehensive onboarding flow
- Profile management and updates

### Subscription System
- Free tier with daily limits
- Premium subscription with Stripe
- Automatic webhook processing for subscription changes

### Security
- Row Level Security (RLS) on all database tables
- Server-side API key management
- Protected routes and middleware

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@moneyxprt.com or create an issue in this repository.
