# Design System Updates

## Overview
The application has been updated with a friendlier, more approachable design system featuring warmer colors, improved typography, and better readability.

## Typography

### Font Families
- **Sans-serif (Body)**: DM Sans - A friendly, highly readable geometric sans-serif
  - Weights: 400 (regular), 500 (medium), 600 (semi-bold), 700 (bold)
  - Usage: Body text, UI elements, secondary content
  
- **Display (Headings)**: Plus Jakarta Sans - Modern, rounded sans-serif with approachable personality
  - Weights: 500 (medium), 600 (semi-bold), 700 (bold), 800 (extra-bold)
  - Usage: Headings, section titles, emphasis elements
  
- **Monospace (Data)**: JetBrains Mono - Clean, modern monospace
  - Weights: 400 (regular), 500 (medium), 600 (semi-bold)
  - Usage: Numbers, data values, code

### Font Sizes & Line Heights
Optimized for readability with increased line heights and proper letter spacing:

- `xs`: 0.75rem / 1.5 line-height / 0.01em letter-spacing
- `sm`: 0.875rem / 1.6 / 0.005em
- `base`: 1rem / 1.7 / 0
- `lg`: 1.125rem / 1.7 / -0.01em
- `xl`: 1.25rem / 1.65 / -0.015em
- `2xl`: 1.5rem / 1.5 / -0.02em
- `3xl`: 1.875rem / 1.4 / -0.025em
- `4xl`: 2.25rem / 1.3 / -0.03em
- `5xl`: 3rem / 1.2 / -0.035em

### Heading Styles
All headings use the display font family with improved spacing:
- H1: 2.5rem, line-height 1.2
- H2: 2rem, line-height 1.25
- H3: 1.5rem, line-height 1.3
- H4: 1.25rem, line-height 1.4
- H5: 1.125rem, line-height 1.5
- H6: 1rem, line-height 1.5

## Color Palette

### Background Colors (Warmer Purple-Tinted)
- `bg-dark`: #1a1625 (Deep purple-black)
- `bg-surface`: #2a2435 (Purple-gray surface)
- `card-dark`: rgba(42, 36, 53, 0.8)
- `card-hover`: rgba(61, 53, 72, 0.95)
- `border-dark`: rgba(69, 61, 82, 0.5)
- `border-light`: rgba(90, 81, 103, 0.6)

### Text Colors (Higher Contrast, Better Readability)
- `text-primary`: #faf8fc (Near white)
- `text-secondary`: #d4cfe0 (Light purple-gray)
- `text-muted`: #a79bb8 (Medium purple-gray)
- `text-faint`: #7d7088 (Faint purple-gray)

### Semantic Colors

#### Warm (Primary Actions, Emphasis)
- 50-900 scale from light cream to deep orange
- Primary: #f5a945 (400), #f28c1e (500)
- Usage: Primary buttons, highlights, warm accents

#### Accent (Interactive Elements, Links)
- 50-900 scale from light blue to deep blue
- Primary: #6794f0 (400), #4670ea (500)
- Usage: Links, interactive elements, info states

#### Success (Completion, Positive States)
- 50-900 scale from light green to deep green
- Primary: #4ade80 (400), #22c55e (500)
- Usage: Success messages, completed states, progress

## Component Updates

### Cards
- Border radius: 2xl (1.25rem) - softer, friendlier corners
- Border: white/15% opacity (increased from 10%)
- Hover: Scale up slightly with enhanced shadows
- Glass effect: Warmer backdrop with increased blur

### Buttons
- **Primary**: Warm gradient (warm-400 to warm-500)
  - Enhanced glow effect on hover
  - Scale animation (1.02) on hover
  
- **Secondary**: Glass effect with increased border visibility
  - Subtle background on hover
  
- **Ghost**: Minimal style for tertiary actions
  
- **Danger**: Red gradient with glow effect

### Badges
- Increased padding: px-3 py-1.5 (from px-2.5 py-1)
- Larger text: text-xs (from text-[10px])
- Better letter spacing: tracking-wider
- Enhanced color contrast for all variants

### Form Elements
- Increased font size to base (16px) - prevents mobile zoom
- Better focus states with accent color
- Improved label styling with better spacing
- Enhanced contrast for placeholders

### Progress Bars
- Thicker bars for better visibility (h-3 default)
- Warmer gradient colors matching new palette
- Smoother transitions

## Accessibility Improvements

### Focus States
- 2px solid accent ring at 60% opacity
- 3px offset for breathing room
- 6px border radius for friendliness
- Enhanced visibility

### Contrast Ratios
All text/background combinations meet WCAG AA standards:
- Primary text on dark bg: >12:1
- Secondary text on dark bg: >7:1
- Muted text on dark bg: >4.5:1

### Interactive Elements
- Larger hit targets (minimum 44x44px)
- Clear hover/focus states
- Smooth transitions (300ms)
- Scale animations for feedback

## Design Principles

1. **Warmth**: Purple-tinted backgrounds with warm accent colors create a more inviting atmosphere
2. **Readability**: Increased line heights, proper letter spacing, and better font choices
3. **Friendliness**: Rounded corners, gentle animations, softer shadows
4. **Accessibility**: Enhanced contrast, clear focus states, larger interactive elements
5. **Consistency**: Cohesive color system used throughout all components

## Usage Examples

### Headings
```tsx
<h1 className="font-display font-bold text-5xl">Main Heading</h1>
<h2 className="font-display font-bold text-3xl">Section Heading</h2>
<h3 className="font-display font-semibold text-2xl">Subsection</h3>
```

### Body Text
```tsx
<p className="text-base leading-relaxed">
  Body text with improved readability and line height.
</p>
<p className="text-sm text-secondary">
  Secondary text with appropriate color.
</p>
```

### Colors
```tsx
// Backgrounds
<div className="bg-bg-dark">...</div>
<div className="glass">...</div>

// Text
<span className="text-primary">Primary text</span>
<span className="text-secondary">Secondary text</span>
<span className="text-muted">Muted text</span>

// Accents
<span className="text-warm-400">Warm accent</span>
<span className="text-accent-400">Interactive accent</span>
<span className="text-success-400">Success state</span>
```

### Buttons
```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="ghost">Tertiary Action</Button>
```

### Cards
```tsx
<Card hover className="p-6">
  <CardTitle>Card Title</CardTitle>
  <CardContent>Card content with proper spacing</CardContent>
</Card>
```

## Migration Notes

### Breaking Changes
- Font families changed - ensure proper loading in layout.tsx
- Color variable names updated in CSS
- Some component class names updated

### Backwards Compatibility
- All components maintain same prop interfaces
- Existing layouts remain functional
- Gradual migration supported

## Browser Support
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Progressive enhancement for older browsers
- Graceful degradation of backdrop filters
