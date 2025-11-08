# Portfolio Website Design Guidelines

## Design Approach
**Reference-Based Approach** inspired by premium portfolio sites (Awwwards winners, Apple's dark mode aesthetic, Linear's precision) with a dark, ambient aesthetic. The design prioritizes visual impact and emotional engagement while maintaining professional credibility.

## Core Design Elements

### Typography
- **Primary Font**: Inter or Work Sans (Google Fonts) for UI and headings
- **Secondary Font**: JetBrains Mono for accent text/labels
- **Scale**: 
  - Hero headline: text-6xl to text-8xl (font-bold)
  - Section headings: text-4xl to text-5xl (font-semibold)
  - Body text: text-base to text-lg (font-normal, leading-relaxed)
  - Labels/captions: text-sm (font-medium)

### Layout System
- **Spacing Units**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- **Section padding**: py-20 to py-32 (desktop), py-12 to py-16 (mobile)
- **Container**: max-w-7xl with px-6 to px-8
- **Grid system**: 12-column for portfolio items (3-4 columns desktop, 2 tablet, 1 mobile)

### Component Library

**Navigation**
- Fixed header with backdrop-blur-md glassmorphism effect
- Logo left, minimal nav links right (Work, About, Contact)
- Subtle underline hover states with glow effect

**Hero Section**
- Full viewport height (min-h-screen) with animated gradient background
- Large typographic statement with your name/tagline
- Floating particles or ambient mesh gradient animation
- Subtle scroll indicator with glow pulse

**Portfolio Grid**
- Masonry or standard grid layout with project cards
- Card hover: scale-105, shadow-2xl with colored glow
- Overlay on hover revealing project title and tech stack
- Click to expand into modal lightbox with full project details

**About Section**
- Two-column layout (profile photo left, bio right on desktop)
- Profile photo with gradient border and subtle glow
- Bio text with comfortable line-height and prose formatting

**Contact Section**
- Animated contact cards in grid (email, social links)
- Icon + label + value with hover lift effect
- Glassmorphism cards with border-white/10

**Admin Dashboard** (minimal focus)
- Simple centered form with file upload for profile photo
- Text inputs for contact info and bio
- Basic authentication gate with API key validation
- No elaborate styling needed - functional clean design

### Visual Effects

**Ambient Lighting**
- Radial gradient overlays with blur effects (from-purple-900/20 via-transparent)
- Glow effects on interactive elements using box-shadow with colored blur
- Subtle vignette effect on hero section
- Animated gradient backgrounds using CSS animations

**Glassmorphism**
- backdrop-blur-md to backdrop-blur-xl
- bg-white/5 to bg-white/10 with border-white/20
- Applied to cards, navigation, overlays

**Animations**
- Entrance animations: fade-in with slide-up for sections (use intersection observer)
- Parallax scroll on hero background elements
- Smooth transitions on all interactive states (transition-all duration-300)
- Particle system or gradient mesh animation in hero background

## Images

**Hero Section**
- No large hero image - replace with animated gradient background and floating particles/abstract shapes
- Focus on typography and ambient effects

**Portfolio Projects**
- Project thumbnail images for each portfolio item (16:10 aspect ratio)
- High-quality screenshots or mockups
- Hover reveals full-color; default state with slight desaturation

**Profile Photo**
- Circular or rounded-lg profile image (400x400px minimum)
- Displayed in About section with gradient border effect
- Admin can upload/replace via dashboard

**Accent Graphics**
- Abstract geometric shapes or gradient blobs as decorative elements
- Subtle background patterns with low opacity

## Accessibility
- Maintain WCAG AA contrast ratios with light text on dark backgrounds
- Focus states with visible glow rings
- Semantic HTML structure
- Keyboard navigation support throughout

## Responsive Behavior
- Desktop: Multi-column layouts, larger spacing, hover effects
- Tablet: 2-column grids, adjusted spacing
- Mobile: Single column, touch-optimized hit areas (min 44px), simplified animations

## Key Differentiators
- Dark ambient aesthetic with glowing accent elements
- Smooth, cinematic animations and transitions
- Premium glassmorphism UI components
- Professional yet visually striking presentation
- Seamless blend of technical precision and creative flair