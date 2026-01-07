# Portfolio Website

A production-ready, modern portfolio/link-in-bio web application built with Node.js, Express, React, and TypeScript. Features persistent file-based storage, secure admin authentication, and mobile-first design with Linktree-level polish.

## Features

- 🎨 **Modern UI**: Dark/light theme toggle, animated avatar ring, glassmorphism effects
- 🔐 **Secure Admin Panel**: Cookie-based authentication with environment variable protection
- 💾 **Persistent Storage**: File-based configuration (no database required)
- 📱 **Mobile-First**: Responsive design optimized for all devices
- 🎯 **Optional Projects Section**: Automatically hides when no projects exist
- 🚀 **Production-Ready**: Helmet security, input validation, file size limits
- ⚡ **Fast**: Vite for client builds, esbuild for server bundling

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required for Admin Access

- **`ADMIN_KEY`**: Secret key for admin authentication. If not set, admin panel returns 403.
  - Example: `ADMIN_KEY=your-secret-key-here`
  - Set this to a strong, random string for production

### Optional Configuration

- **`PORT`**: Server port (default: `3000`)
  - Example: `PORT=3000`
  
- **`SESSION_SECRET`**: Session encryption secret (auto-generated if not set, but recommended for production)
  - Example: `SESSION_SECRET=your-session-secret-here`
  
- **`NODE_ENV`**: Environment mode (`development` or `production`)
  - Example: `NODE_ENV=production`

### Example `.env` File

```env
ADMIN_KEY=my-super-secret-admin-key-change-this
PORT=3000
SESSION_SECRET=my-session-secret-for-cookies
NODE_ENV=production
```

## Installation

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Runs the app in development mode with hot module replacement (HMR).

### Production Mode

```bash
npm start
```

Runs the compiled production build. Make sure to run `npm run build` first.

## Storage Paths

The application uses file-based persistence with the following structure:

### Configuration Storage

- **`./data/config.json`**: Stores profile information and projects data
  - Automatically created on first run
  - Contains profile (name, title, bio, contact info, social links)
  - Contains array of projects with metadata

### File Uploads

- **`./data/uploads/`**: Stores uploaded profile images
  - Profile images are saved with unique filenames
  - Served publicly at `/data/uploads/` and `/uploads/` (legacy)
  - Maximum file size: 5MB
  - Allowed formats: JPEG, PNG, GIF, WebP

### Auto-Creation

Both directories are automatically created if they don't exist when the server starts.

## Optional Projects Section Logic

The projects/portfolio section on the homepage follows these rules:

1. **When projects exist**: The "Featured Work" section is displayed with all projects
2. **When no projects exist**: The entire section is hidden (no empty header or placeholder)
3. **While loading**: Nothing is shown (seamless experience)

This creates a clean, professional appearance when starting with a fresh portfolio. Add projects through the admin panel, and they'll appear automatically on the public site.

## Admin Panel

### Accessing the Admin Panel

Navigate to `/admin` to access the admin dashboard.

### Login Process

1. Enter your `ADMIN_KEY` on the login page
2. Session is stored in an HttpOnly cookie for security
3. Stay logged in for 7 days (configurable)
4. Click "Logout" to end the session

### Admin Features

- **Profile Management**: Edit name, title, bio, and contact information
- **Avatar Upload**: Upload and crop profile images (or use image URLs)
- **Social Links**: Manage GitHub, LinkedIn, and Twitter links
- **Projects CRUD**: Create, read, update, and delete portfolio projects
  - Upload project images (stored as base64 in config)
  - Add tags, descriptions, and links
  - Set display order
  - Add long descriptions for project details

### Security

- Admin access requires `ADMIN_KEY` environment variable
- If `ADMIN_KEY` is not set, admin panel returns 403 Forbidden
- Sessions use HttpOnly cookies (not accessible via JavaScript)
- CSRF protection on all state-changing operations (POST, PATCH, DELETE)
- Content Security Policy (CSP) enabled in production mode
- SameSite=strict cookies in production prevent CSRF attacks
- All admin routes protected by authentication middleware
- Input validation on all forms
- File size limits enforced (5MB max)
- Only image files allowed for uploads

**Note**: CodeQL may report CSRF warnings on GET endpoints, which is expected and safe. GET requests are idempotent and should not modify state, therefore CSRF protection is only applied to POST/PATCH/DELETE operations per OWASP guidelines.

## API Endpoints

### Public Endpoints

- `GET /api/profile` - Get portfolio profile information
- `GET /api/projects` - Get all projects (sorted by order)
- `GET /api/projects/:id` - Get a single project
- `GET /api/config` - Get public-safe configuration

### Protected Endpoints (Require Admin Authentication)

- `POST /api/admin/login` - Login with admin key
- `POST /api/admin/logout` - Logout and destroy session
- `GET /api/admin/status` - Check authentication status
- `POST /api/profile` - Update profile information
- `POST /api/projects` - Create a new project
- `PATCH /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `POST /api/projects/upload-image` - Upload project image

## UI Features

### Theme Toggle

- Dark mode (default) and light mode available
- Theme preference saved in localStorage
- Toggle button in navigation bar (sun/moon icon)
- Smooth transitions between themes

### Animated Avatar

- Gradient ring around profile photo pulses and rotates
- Smooth CSS animations for professional look
- Fallback to initials if no image provided

### Copy Email Toast

- Click email address in Contact section to copy to clipboard
- Success toast notification confirms copy
- Works on all modern browsers

### Mobile Optimization

- Hamburger menu for mobile navigation
- Touch-friendly buttons and cards
- Responsive grid layouts
- Optimized font sizes and spacing

## Technology Stack

### Frontend

- React 18 with TypeScript
- Vite (build tool)
- TanStack Query (server state)
- Wouter (routing)
- Shadcn UI + Radix UI (components)
- Tailwind CSS (styling)

### Backend

- Node.js + Express
- TypeScript
- Helmet (security headers)
- Express Session (authentication)
- Multer (file uploads)
- Zod (validation)

### Storage

- File-based JSON storage (no database required)
- Local filesystem for uploads

## Project Structure

```
portfolio-web/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
│   └── index.html
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── fileStorage.ts   # Storage implementation
│   └── vite.ts          # Vite integration
├── shared/              # Shared types and schemas
│   └── schema.ts        # Zod schemas and types
├── data/                # Storage directory (auto-created)
│   ├── config.json      # Profile and projects data
│   └── uploads/         # Uploaded images
├── dist/                # Build output
├── index.js             # Production entry point
├── package.json
└── README.md
```

## Building for Production

```bash
# Install dependencies
npm install

# Build frontend and backend
npm run build

# Start production server
npm start
```

The build process:
1. Vite builds the React frontend to `dist/public/`
2. esbuild bundles the Express server to `dist/index.js`
3. `index.js` loads and runs the compiled server

## Deployment

### Pterodactyl / Generic Node.js Hosting

1. Set environment variables in your hosting panel:
   - `ADMIN_KEY` (required)
   - `PORT` (optional, defaults to 3000)
   - `NODE_ENV=production`

2. Build the application:
   ```bash
   npm install
   npm run build
   ```

3. Start command:
   ```bash
   npm start
   ```

4. The server will:
   - Create `data/` directory if needed
   - Start on the specified PORT
   - Serve the built frontend from `dist/public/`
   - Provide API endpoints for admin and public access

### Important Notes

- Ensure `data/` directory is writable
- Consider backing up `data/config.json` regularly
- Use a strong `ADMIN_KEY` in production
- Enable HTTPS in production (Helmet is configured but needs HTTPS at proxy level)

## Troubleshooting

### Admin panel returns 403

- Ensure `ADMIN_KEY` environment variable is set
- Check that the value is not empty

### Profile/projects not saving

- Check file system permissions on `data/` directory
- Verify `data/config.json` is writable
- Check server logs for errors

### Images not displaying

- Verify uploads are in `data/uploads/` directory
- Check that the directory is accessible
- Ensure image URLs start with `/data/uploads/` or `/uploads/`

### Session/login issues

- Clear browser cookies and try again
- Set `SESSION_SECRET` environment variable
- Check that cookies are enabled in browser

## License

MIT

## Support

For issues or questions, please open an issue on the GitHub repository.
