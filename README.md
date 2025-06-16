# Movie Blog UI

A modern movie blog frontend built with Nuxt 3 and powered by Strapi backend.

## Features

- 🔐 **Authentication**: Complete user authentication system with Strapi
- 🎬 **Movie Reviews**: Create and manage movie reviews
- 📱 **Responsive Design**: Modern UI with Tailwind CSS
- 🚀 **Fast Performance**: Built with Nuxt 3 for optimal performance
- 🔒 **Protected Routes**: Middleware-based route protection

## Setup

### Prerequisites

Make sure you have a Strapi backend running at `http://localhost:1337`. The backend should be located at `/Users/nsambataufeeq/movie-blog/movie-blog-cms`.

### Installation

1. Install dependencies:

    ```bash
    npm install
    ```

2. Create your environment variables:

    ```bash
    cp .env.example .env
    ```

3. Update the `.env` file with your Strapi backend URL:

```env
STRAPI_URL=http://localhost:1337
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Authentication

The application includes a complete authentication system:

- **Login**: `/login` - User login page
- **Register**: `/register` - User registration page
- **Protected Routes**: Main dashboard requires authentication
- **Auto-redirect**: Unauthenticated users are redirected to login

## Project Structure

```env
├── components/          # Vue components
├── composables/         # Vue composables
│   └── useAuth.ts      # Authentication composable
├── layouts/            # Nuxt layouts
│   └── default.vue     # Main layout with navigation
├── middleware/         # Route middleware
│   └── auth.ts         # Authentication middleware
├── pages/              # Application pages
│   ├── index.vue       # Protected dashboard
│   ├── login.vue       # Login page
│   └── register.vue    # Registration page
├── plugins/            # Nuxt plugins
│   └── auth.client.ts  # Authentication initialization
└── assets/css/         # Stylesheets
    └── main.css        # Main CSS with Tailwind
```

## Technologies Used

- **Nuxt 3**: Vue.js framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Strapi**: Headless CMS backend
- **Pinia**: State management
- **VueUse**: Vue composition utilities

## Authentication Flow

1. User visits protected route
2. Middleware checks authentication status
3. If not authenticated, redirects to login
4. After successful login, redirects to intended page
5. Authentication state persists across browser sessions

## API Integration

The app uses the `@nuxtjs/strapi` module for seamless integration with Strapi:

- Automatic JWT token management
- User session persistence
- Built-in authentication methods
- Error handling and validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
