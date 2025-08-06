# MoneyXprt - AI-Powered Financial Co-Pilot

A modern, production-ready web application built with Next.js, Supabase, and OpenAI to help high-income earners optimize their wealth through AI-driven financial insights.

## Features

- **Waitlist Registration**: Simple email capture for early access
- **User Authentication**: Secure email/password authentication with Supabase
- **AI Financial Advisor**: Chat with GPT-4 for personalized financial advice
- **Protected Dashboard**: Authenticated user area with conversation history
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time Data**: Supabase integration for instant updates

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Deployment**: Vercel-ready

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd moneyxprt
npm install
```

### 2. Set up Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to Settings → API to get your project URL and anon key
4. Go to SQL Editor and run the schema from `supabase/schema.sql`

### 3. Set up OpenAI

1. Get an API key from [OpenAI Platform](https://platform.openai.com)
2. Make sure you have GPT-4 access or change the model in `app/api/chat/route.ts`

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Database URL (optional, for direct database access)
DATABASE_URL=your_supabase_database_url
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── chat/          # OpenAI chat endpoint
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard
│   ├── profile/           # User profile page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Landing page
│   ├── providers.tsx      # App providers
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   └── ui/               # Shadcn/ui components
├── lib/                   # Utility functions
│   ├── utils.ts          # General utilities
│   └── supabase.ts       # Supabase server client
├── supabase/             # Database schema
│   └── schema.sql        # SQL schema for tables
├── middleware.ts         # Next.js middleware for auth
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

The application is automatically optimized for Vercel deployment.

### Environment Variables for Production

Add these in your Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## Database Schema

### Waitlist Table
```sql
- id (uuid, primary key)
- email (text, unique)
- created_at (timestamp)
```

### Conversations Table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- prompt (text)
- response (text)
- created_at (timestamp)
```

## Key Features

### Landing Page
- Hero section with value proposition
- Feature highlights
- Email waitlist capture
- Responsive design

### Authentication
- Email/password signup and login
- Protected routes with middleware
- Automatic redirects

### Dashboard
- Personalized welcome message
- AI chat interface
- Conversation history
- Profile management

### AI Integration
- GPT-4 powered financial advice
- Specialized prompts for financial topics
- Error handling and fallbacks

## Security Features

- Row Level Security (RLS) on all tables
- Protected API routes
- Secure authentication flow
- Environment variable protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support or questions, please [open an issue](https://github.com/your-username/moneyxprt/issues) on GitHub.