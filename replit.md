# Replit.md

## Overview

This is a full-stack web application built with a React frontend and Express.js backend, featuring a waitlist registration system. The application appears to be designed for a financial services or wealth management platform, allowing users to sign up for early access with optional demographic and goal information. The stack includes TypeScript throughout, Drizzle ORM for database management, shadcn/ui for the component library, and TanStack Query for state management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod for validation
- **Build Tool**: Vite with React plugin and custom aliases for clean imports

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **API Design**: RESTful endpoints with centralized route registration
- **Validation**: Zod schemas shared between frontend and backend
- **Error Handling**: Centralized error middleware with structured responses
- **Development**: Custom logging middleware for API request tracking

### Data Storage
- **Database**: PostgreSQL via Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle ORM with type-safe queries and migrations
- **Schema**: Two main tables - users (id, username, password) and waitlist (id, email, name, income, goal, createdAt)
- **Migrations**: Drizzle Kit for schema migrations stored in `/migrations` directory

### Authentication & Authorization
- **Current State**: Basic user schema exists but no authentication implementation yet
- **Session Management**: connect-pg-simple package included for PostgreSQL session storage
- **Future Implementation**: Appears designed for session-based authentication

### Development & Build
- **Monorepo Structure**: Client, server, and shared code in separate directories
- **Shared Types**: Common schemas and types in `/shared` directory
- **Development Server**: Vite dev server with HMR and error overlay
- **Production Build**: esbuild for server bundling, Vite for client bundling
- **TypeScript**: Strict configuration with path mapping for clean imports

### API Structure
- **Waitlist Endpoint**: POST `/api/waitlist` for user registration
- **Validation**: Zod schemas with email validation and optional demographic fields
- **Error Handling**: Proper HTTP status codes (409 for duplicates, 400 for validation errors)
- **Response Format**: Consistent JSON responses with message and data fields

### UI/UX Design
- **Design System**: shadcn/ui with New York style variant
- **Responsive**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: Radix UI primitives provide accessibility features
- **Theming**: CSS custom properties for easy theme switching
- **Icons**: Lucide React for consistent iconography

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