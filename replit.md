# Comparece.ai - Replit Development Guide

## Overview

Comparece.ai is a modern web application that connects nightlife venues with their audiences through gamified check-ins, rewards, and event management. The platform allows users to discover events, interact with venues, and earn benefits for their participation while providing establishments with tools to manage events and engage customers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom brand colors (Roxo Magenta #BB2288, Laranja Vibrante #F09232)
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon Database (serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Traditional username/password with Passport.js Local Strategy
- **Session Management**: Express sessions with PostgreSQL storage

### Mobile-First Design
- Progressive Web App (PWA) approach
- Responsive design optimized for mobile devices
- Touch-friendly interface with gesture support

## Key Components

### Authentication System
- **Provider**: Traditional username/password authentication with Passport.js Local Strategy
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **User Roles**: USUARIO, FUNCIONARIO, DONO_ESTABELECIMENTO, SUPER_ADMIN
- **Authorization**: Role-based access control throughout the application
- **Features**: Login/Register forms, password hashing with scrypt, session management
- **Test Credentials**: All users can login with password "123456"

### Event Management
- **Event Categories**: PAGODE, SERTANEJO, TECHNO, FUNK, FORRÓ, ROCK, SAMBA
- **Event Reactions**: EU_VOU_COMPARECER, PENSANDO_EM_IR, NAO_VOU_PODER_IR
- **Check-in System**: QR code-based validation
- **Incentive System**: Rewards, discounts, and benefits for attendance

### Gamification Features
- **User Levels**: BRONZE, SILVER, GOLD, PLATINUM, DIAMOND
- **Progress Tracking**: Monthly check-ins and achievements
- **Rewards System**: Points, badges, and exclusive benefits

### QR Code Integration
- **Generation**: Dynamic QR codes for each event check-in
- **Validation**: Real-time validation by venue staff
- **Security**: Unique codes with expiration and fraud prevention

## Data Flow

### User Journey
1. **Discovery**: Browse events by category and location
2. **Engagement**: React to events (going/thinking/not going)
3. **Check-in**: Generate QR code for venue validation
4. **Rewards**: Redeem incentives and track progress
5. **Gamification**: Level up through consistent participation

### Venue Management
1. **Event Creation**: Establishments create and manage events
2. **Incentive Setup**: Configure rewards and benefits
3. **Staff Validation**: Employees validate check-ins and redemptions
4. **Analytics**: Track engagement and attendance metrics

### Data Persistence
- **User Profiles**: Authentication data and preferences
- **Events**: Venue events with categories and details
- **Reactions**: User engagement with events
- **Check-ins**: Validated attendance records
- **Incentives**: Rewards and their redemption status

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database queries
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI components
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing library

### Development Tools
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundler for production
- **@replit/vite-plugin-***: Replit integration plugins

### Authentication
- **passport**: Authentication middleware with LocalStrategy
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store
- **crypto**: Password hashing with scrypt algorithm

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon Database with connection pooling
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS

### Production Build
- **Frontend**: Vite build process generating static assets
- **Backend**: esbuild bundling for Node.js deployment
- **Assets**: Served from `/dist/public` directory
- **Database**: Managed PostgreSQL with Drizzle migrations

### Development Integration
- **Development Tools**: Cartographer plugin for enhanced debugging
- **Error Handling**: Runtime error modal for development
- **Database**: Neon PostgreSQL with automated migrations
- **Documentation**: Comprehensive context documentation in docs/CONTEXT.md

### Security Considerations
- **Session Security**: HTTP-only cookies with secure flags
- **CSRF Protection**: Built-in Express session protection
- **Database Security**: Parameterized queries with Drizzle ORM
- **Input Validation**: Zod schemas for data validation

## Brand Identity

### Visual Design
- **Primary Colors**: Roxo Magenta (#BB2288) and Laranja Vibrante (#F09232)
- **Typography**: Rubik font family for modern, rounded appearance
- **Dark Theme**: Primary interface with dark background and accent colors
- **Icons**: Custom SVG icons with check-mark and human figure motifs

### User Experience
- **Mobile-First**: Optimized for smartphone usage in nightlife settings
- **Intuitive Navigation**: Bottom navigation with clear visual hierarchy
- **Accessibility**: ARIA labels and keyboard navigation support
- **Performance**: Optimized loading and smooth animations