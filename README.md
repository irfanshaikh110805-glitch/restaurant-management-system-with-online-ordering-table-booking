# Spice Haven - Restaurant Management System

A modern, full-featured restaurant management web application built with React, Vite, and Supabase. This system provides comprehensive functionality for online food ordering, table booking, order tracking, and restaurant administration.

## Features

### Customer Features
- 🍽️ **Online Menu Browsing** - Browse menu items with filters and search
- 🛒 **Shopping Cart** - Add items to cart and place orders
- 📱 **Order Tracking** - Real-time order status updates
- 🪑 **Table Booking** - Reserve tables online
- ⭐ **Reviews & Ratings** - Rate and review menu items
- 🎁 **Loyalty Program** - Earn points and rewards
- 🎉 **Promotions** - View and apply promotional offers
- 👤 **User Profile** - Manage account and order history
- 🔔 **Notifications** - Get updates on orders and promotions

### Admin Features
- � **Dashboard** - Overview of orders, bookings, and analytics
- 🍕 **Menu Management** - Add, edit, and manage menu items
- 📦 **Order Management** - Process and track customer orders
- 📅 **Booking Management** - Manage table reservations
- 📈 **Inventory Manager** - Track stock levels
- 🎯 **Promotion Manager** - Create and manage promotional campaigns
- 💬 **Review Moderation** - Moderate customer reviews

### Technical Features
- ⚡ **Fast Performance** - Optimized with Vite and lazy loading
- 📱 **Responsive Design** - Works on all devices
- 🔒 **Secure Authentication** - Powered by Supabase Auth
- 💳 **Payment Integration** - Stripe payment gateway
- 🌙 **Dark Mode** - Theme switching support
- 🔍 **SEO Optimized** - Meta tags and sitemap
- 📍 **Location Services** - Interactive maps with Leaflet
- 📊 **Analytics** - Track user behavior and performance

## Tech Stack

- **Frontend**: React 18, React Router DOM
- **Build Tool**: Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: CSS3 with custom properties
- **Animations**: Framer Motion
- **Payment**: Stripe
- **Maps**: Leaflet, React Leaflet
- **Charts**: Recharts
- **Icons**: React Icons
- **Image Gallery**: Swiper
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Stripe account (for payments)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/spice-haven.git
cd spice-haven
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

4. Set up the database:
   - Run the SQL scripts in the `supabase` folder in your Supabase project
   - Start with `schema.sql` for the base schema
   - Apply migrations from the `migrations` folder

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run optimize:images` - Optimize images

## Docker Deployment

Build and run with Docker:
```bash
npm run docker:build
npm run docker:run
```

Or use Docker Compose:
```bash
npm run docker:compose
```

## Project Structure

```
spice-haven/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   │   └── admin/       # Admin panel pages
│   ├── utils/           # Utility functions
│   ├── lib/             # Third-party integrations
│   └── styles/          # Global styles
├── supabase/            # Database schemas and migrations
└── scripts/             # Build and utility scripts
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `VITE_STRIPE_PUBLIC_KEY` | Your Stripe publishable key |

## Features in Detail

### Authentication
- Email/password registration and login
- Password reset functionality
- Protected routes for authenticated users
- Admin role-based access control

### Menu System
- Category-based organization
- Advanced filtering (vegetarian, spicy, etc.)
- Search functionality
- Image optimization and lazy loading

### Order Management
- Real-time order status updates
- Order history tracking
- Payment processing with Stripe
- Order confirmation emails

### Booking System
- Date and time selection
- Party size management
- Booking confirmation
- Admin booking management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, email support@spicehaven.com or open an issue in the repository.

## Acknowledgments

- React team for the amazing framework
- Supabase for the backend infrastructure
- All open-source contributors
# restaurant-management-system-with-online-ordering-table-booking
