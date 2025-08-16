# Replit.md

## Overview

MoneyXprt is a modern, production-ready Next.js web application serving as an AI-powered financial co-pilot for high-income earners. The application features a complete waitlist system, user authentication, an AI chat interface powered by OpenAI GPT-4, and a secure dashboard for personalized financial advice. Built with Next.js 14 App Router, Supabase for authentication and database, and styled with Tailwind CSS and shadcn/ui components.

**Recent Update**: Complete authentication system with Supabase magic links and JWT token validation. All three AI endpoints (tax-scan, entity-opt, fee-check) now require real user authentication and log conversations with actual user IDs. Enhanced fee-check endpoint with CSV file upload support for portfolio analysis. Application features end-to-end security from frontend AuthWidget to backend database logging with enterprise-grade privacy protection. Added comprehensive page structure with About, Blog, and Careers pages. Created new streamlined landing page with focused messaging and direct links to beta tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Routing**: Next.js App Router with file-based routing
- **State Management**: React Context for auth state, direct Supabase client calls
- **Form Handling**: React Hook Form with native form handling
- **Build Tool**: Next.js with built-in optimization and bundling

### Backend Architecture
- **Framework**: Next.js API Routes with TypeScript
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with email/password and magic links
- **AI Integration**: OpenAI GPT-4 for financial advice chat
- **API Design**: RESTful API routes following Next.js conventions
- **Security**: Middleware-based route protection and RLS policies

### Data Storage
- **Database**: Supabase (PostgreSQL) with built-in auth and real-time features
- **Schema**: Main tables - waitlist (email, name, income, goal), conversations (prompt, response, meta), users (username, password)
- **Logging**: Complete server-side conversation logging with dedicated admin client using SUPABASE_SERVICE_ROLE_KEY
- **Security**: Row Level Security (RLS) policies for data protection
- **Real-time**: Supabase real-time subscriptions for live updates

### Authentication & Authorization
- **Implementation**: Complete Supabase Auth integration with email/password authentication
- **Session Management**: Supabase handles JWT tokens and session persistence with SSR support
- **Route Protection**: Next.js middleware automatically redirects unauthenticated users to login
- **User Management**: Full registration, login, logout, and session handling
- **Pages**: Login (/login), Signup (/signup), Protected Dashboard (/dashboard)
- **Client Setup**: Optimized function-based architecture - `sbAdmin()` for server operations with service role key, `sbBrowser()` for client-side auth with proper session control

### Development & Build
- **Monorepo Structure**: Client, server, and shared code in separate directories
- **Shared Types**: Common schemas and types in `/shared` directory
- **Development Server**: Vite dev server with HMR and error overlay
- **Production Build**: esbuild for server bundling, Vite for client bundling
- **TypeScript**: Strict configuration with path mapping for clean imports

### API Structure
- **AI Chat Endpoint**: POST `/api/ask` with OpenAI GPT-4o integration and professional system prompt
- **Specialized AI Routes**: 
  - POST `/api/tax-scan` - Tax optimization analysis for high-income earners
  - POST `/api/entity-opt` - Business entity structure optimization recommendations  
  - POST `/api/fee-check` - Investment and financial service fee analysis
- **Post-processing**: Automatic disclaimers for absolute claims and missing context assumptions
- **Conversation Logging**: Server-side logging to Supabase conversations table with graceful error handling
- **Waitlist Endpoint**: POST `/api/waitlist` for user registration
- **Validation**: Zod schemas with email validation and optional demographic fields
- **Error Handling**: Proper HTTP status codes and consistent JSON responses
- **Fake User Profiles**: Temporary mock data for testing (to be replaced with real authentication)
- **Security & Privacy**: SHA256 hashing, automatic PII redaction, secure logging without content exposure
- **Data Integrity**: Request hashing and verification for audit trails
- **Compliance**: Financial-grade privacy protection with sanitized AI interactions

### UI/UX Design
- **Design System**: shadcn/ui with New York style variant
- **Responsive**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: Radix UI primitives provide accessibility features
- **Theming**: Dark emerald green and gold color scheme matching logo branding
- **Icons**: Lucide React for consistent iconography
- **Branding**: Professional logo integration throughout the application

## Environment Configuration

### Required Environment Variables
Set these in Replit Secrets and later in Vercel:

- **NEXT_PUBLIC_SUPABASE_URL** - Your Supabase project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Supabase anonymous/public key
- **SUPABASE_SERVICE_ROLE_KEY** - Supabase service role key for admin operations
- **OPENAI_API_KEY** - OpenAI API key for GPT-4o integration

### Optional Variables
- **NEXT_PUBLIC_WC_PROJECT_ID** - Wallet Connect project ID for future crypto features
- **Stripe Keys** - For subscription payments (VITE_STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY, etc.)

### Development Setup
- Complete `.env.example` file provided for reference
- All keys properly documented for deployment readiness

## External Dependencies

### Database & Storage
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database ORM with migration support
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Frontend Libraries
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Validation**: Zod for schema validation
- **Icons**: Lucide React icon library
- **Utilities**: clsx, tailwind-merge for className management

### Backend Libraries
- **Express.js**: Web application framework
- **TypeScript**: Static type checking
- **Drizzle**: Database ORM and query builder
- **Development Tools**: tsx for TypeScript execution, esbuild for bundling

### Development Tools
- **Build Tools**: Vite for frontend, esbuild for backend
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Development Server**: Custom Vite setup with Express integration
- **Type Checking**: TypeScript with strict configuration