# Design System Documentation

This document outlines the design system and aesthetic patterns used throughout the Stitch Style application. All future frontend development should adhere to these guidelines to maintain consistency.

## Typography System

### Font Families
- **Primary Font**: `Figtree` - used for most body text and headings
- **Serif Font**: `Lora` - used for italicized, elegant text elements
- **Monospace Font**: `Space Mono` - used for code, time displays, and technical elements

### Font Sizes & Scales
- **H1**: 5xl (3rem) on mobile, 8xl (8rem) on desktop (landing page hero)
- **H2**: 4xl (2.25rem) on mobile, 5xl (3rem) on desktop (section headers)
- **H3**: 2xl (1.5rem) for card titles and subheadings
- **Body**: Base (1rem) for main content
- **Small**: Text-sm (0.875rem) for captions and secondary text

### Tracking Classes
- `tracking-tight`: -0.025em (headings, titles)
- `tracking-wide`: 0.025em (secondary text, dates)
- `tracking-[0.1em]`: 0.1em (buttons)
- `tracking-[0.15em]`: 0.15em (navigation links)
- `tracking-[0.2em]`: 0.2em (labels, footer sections)
- `tracking-[0.3em]`: 0.3em (hero section labels)

### Font Weights
- `font-light`: 300 (hero headings, subtle text)
- `font-medium`: 500 (navigation, buttons)
- `font-normal`: 400 (card titles, body text)

## Color System (HSL-based)

### Core Colors
- **Background**: 0° 0% 96.0784% (light), 0° 0% 15% (dark)
- **Foreground**: 120° 100% 1% (light), 248° 0.3% 98.4% (dark)
- **Primary**: 0° 0% 9% (light), 256° 1.3% 92.9% (dark)
- **Secondary**: 21° 10% 73% (light), 260° 4.1% 27.9% (dark)
- **Muted**: 17° 9% 85% (light), 260° 4.1% 27.9% (dark)
- **Border**: 0° 0% 90% (light), 0° 0% 100% / 10% (dark)

### Semantic Colors
- **Destructive**: 357° 82% 42% (red for errors/deletes)
- **Accent**: 18° 8% 60% (light), 260° 4.1% 27.9% (dark)
- **Card**: 60° 9.0909% 97.8431% (light), 266° 4% 20.8% (dark)

## Spacing System

### Container & Layout
- **Container**: 2rem padding
- **Max Width**: 1400px (2xl screens)

### Common Spacing Values
- **Gap scales**: gap-2 (0.5rem), gap-4 (1rem), gap-8 (2rem)
- **Padding**: p-6 (1.5rem) for cards and dialogs
- **Section padding**: py-32 (8rem), py-24 (6rem), py-16 (4rem), py-12 (3rem)
- **Grid gaps**: gap-4, gap-8, gap-12 for layouts
- **Button padding**: px-6 py-2 (default), px-4 (sm), px-8 (lg), px-10 (xl)

### Component Dimensions
- **Button heights**: h-10 (default), h-9 (sm), h-12 (lg), h-14 (xl)
- **Icon sizes**: h-4 w-4 (default), h-3.5 w-3.5 (small), h-5 w-5 (medium)

## Component Design Patterns

### Buttons
#### Variants
- `default`: Rounded-md, primary colors
- `hero`: Rounded-none, primary colors, no border
- `heroOutline`: Rounded-none, border-foreground, transparent bg
- `outline`: Border-input, background hover states
- `ghost`: Hover:bg-accent, transparent background

#### Sizes
- `sm`: h-9 px-4
- `default`: h-10 px-6 py-2
- `lg`: h-12 px-8 text-base
- `xl`: h-14 px-10 text-base

#### Typography
- Uppercase, tracking-[0.1em], text-sm/base
- Focus: focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
- Disabled: disabled:pointer-events-none disabled:opacity-50

### Cards
#### Base Styling
- Border, bg-card, shadow-sm
- Rounded: Default rounded-lg

#### Sections
- **Headers**: p-6, flex-col, space-y-1.5
- **Content**: p-6, pt-0 for first content area
- **Titles**: text-2xl, font-semibold, tracking-tight
- **Descriptions**: text-sm, text-muted-foreground

### Dialogs
#### Size & Position
- Max-width-lg, centered modal
- Fixed positioning with translate-x-[-50%] translate-y-[-50%]

#### Animation
- Zoom in/out with slide transitions
- Duration-200 for smooth transitions

#### Styling
- Border, bg-background, shadow-lg
- Rounded-lg (custom, not using rounded-none)

### Forms
#### Inputs
- Rounded-md, border-input, bg-background
- Height: h-10, padding: px-3 py-2
- Text: text-base (mobile), text-sm (desktop)
- Placeholder: placeholder:text-muted-foreground

#### Labels
- Text-sm, font-medium, tracking-tight
- Leading-none for compact spacing

#### Spacing
- Grid gaps, consistent padding

## Animation & Interaction Patterns

### Transitions
- **Hover states**: duration-300
- **Focus states**: duration-300
- **General**: duration-300 for all interactive elements

### Animations
- `fadeIn`: 0.8s ease-out
- `slideUp`: 0.8s ease-out with translateY(20px)
- `fade-in-delayed`: with 0.3s delay
- `fade-in-delayed-more`: with 0.5s delay

### Interactive States
- **Hover**: Opacity changes, color transitions, grayscale removal
- **Focus**: focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
- **Disabled**: disabled:cursor-not-allowed disabled:opacity-50
- **Active**: data-[state=open] states for collapsible elements

## Layout Patterns

### Container
- Centered, max-width 1400px (2xl)
- Container mx-auto with 2rem padding

### Grid Systems
- **Responsive**: Mobile-first approach with desktop enhancements
- **Card grids**: sm:grid-cols-2, lg:grid-cols-3
- **Feature grids**: md:grid-cols-2, lg:grid-cols-3

### Flex Layouts
- **Centered content**: flex items-center justify-center
- **Space distribution**: space-between for headers
- **Direction**: Responsive flex directions (flex-col, sm:flex-row)

### Special Effects
- **Backdrops**: backdrop-blur-sm for sticky headers
- **Gradients**: Not heavily used, maintained minimal approach
- **Shadows**: Subtle shadows with var(--shadow-sm) levels

## Landing Page Specific Patterns

### Header
- **Position**: Fixed top-0
- **Styling**: backdrop-blur-sm, border-b, bg-background/80
- **Layout**: Container with flex, items-center, justify-between
- **Navigation**: Hidden md:flex for desktop, uppercase tracking-[0.15em]

### Hero Section
- **Layout**: Full viewport height, flex items-center justify-center
- **Typography**: Large scale typography (5xl-8xl), leading-[0.95]
- **Spacing**: pt-16, pb-24, px-6
- **Animations**: fade-in, slide-up, delayed animations

### Feature Sections
- **Background**: bg-card for alternating sections
- **Layout**: Grid with consistent spacing (gap-x-12, gap-y-16)
- **Icons**: 12x12 border with hover effects (group-hover:bg-foreground)

### Testimonial
- **Styling**: Full-width inverted colors (bg-foreground text-background)
- **Typography**: Large quote text (3xl-5xl), leading-tight
- **Layout**: Centered with attribution

### Footer
- **Styling**: Border-t, border-border
- **Layout**: Grid md:grid-cols-4 with consistent spacing
- **Navigation**: Uppercase tracking-[0.2em] labels

## Dashboard Specific Patterns

### Main Layout
- **Container**: mx-auto max-w-5xl
- **Spacing**: px-6 py-12
- **Background**: bg-background for main content

### Header
- **Position**: Sticky top-0
- **Styling**: bg-background/80 backdrop-blur-sm, border-b border-border
- **Layout**: Flex with items-center justify-between
- **Typography**: Uppercase tracking-[0.2em] branding

### Project Cards
- **Styling**: Border, hover:border-foreground/20
- **Transitions**: Transition-all duration-300
- **Shadow**: shadow-none by default, hover:shadow-sm
- **Rounded**: rounded-none throughout
- **Image**: aspect-4/3, object-cover, grayscale-[20%] with hover removal

### Empty States
- **Layout**: Flex flex-col items-center justify-center
- **Typography**: Centered with descriptive text
- **Icons**: Muted backgrounds with appropriate iconography

### Form Elements
- **Dialogs**: Sm:max-w-md, rounded-none
- **Inputs**: Rounded-none, consistent styling
- **Buttons**: Size-appropriate with consistent variants

## Visual Hierarchy

### Primary Elements
- Bold typography, primary colors, prominent placement
- Hero text, main buttons, primary actions
- Tracking-tight for important text

### Secondary Elements
- Muted colors, smaller text, supporting information
- Secondary buttons, captions, descriptions
- Tracking-wide for secondary information

### Interactive Elements
- Hover states with opacity changes
- Focus rings for accessibility
- Cursor changes and visual feedback
- Disabled states with reduced opacity

### Decorative Elements
- Icons with consistent sizing (h-4 w-4)
- Subtle borders and dividers
- Grayscale effects with hover removal
- Consistent spacing and alignment

## Accessibility Guidelines

### Color Contrast
- Maintain WCAG AA compliance with proper contrast ratios
- Foreground/background combinations tested for readability
- Focus states clearly visible with ring indicators

### Typography
- Sufficient font sizes for readability
- Proper line heights and letter spacing
- Semantic heading hierarchy maintained

### Interactive Elements
- Keyboard navigation supported
- Focus management for modals and dropdowns
- Screen reader compatibility with proper ARIA labels

## Responsive Design

### Breakpoints
- **Mobile**: Base styles (320px+)
- **Small**: sm: (640px+) - grid-cols-2, flex-row
- **Medium**: md: (768px+) - grid-cols-2, larger typography
- **Large**: lg: (1024px+) - grid-cols-3, desktop layouts
- **Extra Large**: 2xl: (1400px+) - max container width

### Mobile-First Approach
- Base styles for mobile, enhanced for desktop
- Touch-friendly targets (minimum 44px)
- Appropriate spacing for smaller screens

## Best Practices

### Consistency
- Use established component variants consistently
- Maintain spacing ratios throughout the application
- Follow typography hierarchy strictly

### Performance
- Use appropriate image formats and sizes
- Implement lazy loading where appropriate
- Optimize animations for smooth performance

### Maintainability
- Use Tailwind utility classes over custom CSS
- Leverage component composition
- Document custom components with prop types