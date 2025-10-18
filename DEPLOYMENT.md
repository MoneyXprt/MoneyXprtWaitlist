# MoneyXprt Deployment Guide

This guide walks you through deploying MoneyXprt to Vercel with all necessary configurations.

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Repository**: Push your code to a GitHub repository
2. **Supabase Project**: Set up with database tables and RLS policies
3. **OpenAI API Key**: For AI financial advice functionality
4. **Stripe Account**: Configured with products and webhooks

## Step 1: Supabase Configuration

### 1.1 Create Supabase Project
- Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
- Create a new project
- Note your project URL and anon key

### 1.2 Set Up Database
- Go to SQL Editor in Supabase
- Run the contents of `supabase-policies.sql` to create tables and RLS policies

### 1.3 Configure Authentication
- Go to Authentication → Settings
- **Enable email verification** (required)
- Configure email templates if desired
- Set site URL to your production domain (e.g., `https://moneyxprt.vercel.app`)

## Step 2: Stripe Configuration

### 2.1 Create Products
- Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
- Create a product named "MoneyXprt Starter"
- Add a recurring price of $9/month
- Note the price ID (starts with `price_`)

### 2.2 API Keys
- Go to [Stripe API Keys](https://dashboard.stripe.com/apikeys)
- Copy your publishable key (starts with `pk_`)
- Copy your secret key (starts with `sk_`)

## Step 3: Vercel Deployment

### 3.1 Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3.2 Environment Variables
Add these environment variables in Vercel project settings:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_PRICE_ID_STARTER=price_your_price_id

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 3.3 Deploy
Click "Deploy" and wait for the build to complete.

## Step 4: Configure Stripe Webhooks

### 4.1 Create Webhook Endpoint
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`

### 4.2 Configure Webhook Secret
1. Copy the webhook signing secret (starts with `whsec_`)
2. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
3. Redeploy your application

## Step 5: Production Testing

### 5.1 Test User Flow
1. **Registration**: Sign up with a real email address
2. **Email Verification**: Check email and verify account
3. **Onboarding**: Complete profile setup
4. **Free Tier**: Test AI conversations (10 per day limit)
5. **Subscription**: Test Stripe checkout flow
6. **Premium Access**: Verify unlimited access after subscription

### 5.2 Test Webhooks
1. Complete a test purchase in Stripe
2. Check Vercel function logs for webhook processing
3. Verify subscription status in database
4. Test subscription cancellation

## Step 6: Domain Configuration (Optional)

### 6.1 Custom Domain
1. Add your custom domain in Vercel project settings
2. Configure DNS records as instructed
3. Update `NEXT_PUBLIC_APP_URL` environment variable
4. Update Stripe webhook endpoints
5. Update Supabase site URL

## Environment Variables Checklist

Ensure all these environment variables are set in Vercel:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE`
- [ ] `OPENAI_API_KEY`
- [ ] `VITE_STRIPE_PUBLIC_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRICE_ID_STARTER`
- [ ] `NEXT_PUBLIC_APP_URL`

## Troubleshooting

### Common Issues

**1. Authentication not working**
- Check Supabase site URL matches your domain
- Verify email verification is enabled
- Check RLS policies are applied

**2. Payments failing**
- Verify Stripe keys are for the correct environment (test/live)
- Check webhook secret matches Stripe dashboard
- Ensure webhook endpoint is accessible

**3. AI responses not working**
- Verify OpenAI API key is valid and has credits
- Check API endpoint logs in Vercel functions
- Ensure usage limits are configured correctly

**4. Database errors**
- Confirm all tables exist in Supabase
- Verify RLS policies are enabled
- Check service role key has proper permissions

### Monitoring

- **Vercel Analytics**: Monitor performance and errors
- **Supabase Logs**: Track database queries and auth events
- **Stripe Dashboard**: Monitor payments and webhooks
- **OpenAI Usage**: Track API usage and costs

## Security Checklist

Before going live:

- [ ] All API keys are properly secured as environment variables
- [ ] RLS policies are enabled on all database tables
- [ ] Email verification is required for new users
- [ ] Stripe webhooks are properly validated
- [ ] Rate limiting is in place for AI endpoints
- [ ] HTTPS is enforced (automatic with Vercel)

## Post-Launch

1. **Monitor Usage**: Track AI API costs and user engagement
2. **User Feedback**: Collect and iterate on user experience
3. **Performance**: Monitor Core Web Vitals and optimize
4. **Security**: Regular security audits and updates
5. **Scaling**: Monitor database performance and upgrade plans as needed

Your MoneyXprt application is now ready for production! 🚀
