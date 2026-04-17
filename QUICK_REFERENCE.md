# Quick Reference: Friendly Design System

## 🎨 Color Quick Reference

### When to Use Which Color

```tsx
// 🟠 Warm (Primary actions, emphasis)
<Button variant="primary">      // Primary CTA
<span className="text-warm-400"> // Highlighted values
<Badge className="bg-warm-500">  // Important labels

// 🔵 Accent (Interactive elements)
<a className="text-accent-400">           // Links
<div className="border-accent-500">       // Interactive borders
<Button variant="secondary">              // Secondary actions

// 🟢 Success (Positive states, completion)
<Badge variant="status" status="done">    // Completed items
<ProgressBar value={100}>                 // Full progress
<span className="text-success-400">       // Success messages

// ⚪ Neutral (General UI)
<Card className="border-white/15">        // Card borders
<p className="text-secondary">            // Secondary text
<Badge variant="default">                 // Default labels
```

## 📝 Typography Quick Reference

### Font Selection

```tsx
// Headlines & Titles
className="font-display font-bold text-3xl"

// Body Text
className="text-base leading-relaxed"

// Labels & Metadata
className="text-sm text-muted uppercase tracking-wide"

// Numbers & Data
className="font-mono data-number text-warm-400"

// Code
className="font-mono text-sm bg-white/5 px-3 py-1.5 rounded-lg"
```

### Size Scale

```tsx
text-xs    // 0.75rem - Small labels
text-sm    // 0.875rem - Secondary text
text-base  // 1rem - Body text (default)
text-lg    // 1.125rem - Emphasized body
text-xl    // 1.25rem - Small headings
text-2xl   // 1.5rem - Section headings
text-3xl   // 1.875rem - Page headings
text-4xl   // 2.25rem - Large headings
text-5xl   // 3rem - Hero headings
```

## 🎯 Component Patterns

### Cards

```tsx
// Standard card
<Card className="p-6">
  <CardTitle>Title</CardTitle>
  <CardContent>Content</CardContent>
</Card>

// Interactive card
<Card hover onClick={handleClick} className="cursor-pointer">
  ...
</Card>

// Different variants
<Card variant="default">  // Glass effect (default)
<Card variant="glass">    // Enhanced glass
<Card variant="brutal">   // Bold borders
```

### Buttons

```tsx
// Primary action (warm gradient + glow)
<Button variant="primary" size="lg">
  Get Started
</Button>

// Secondary action (glass effect)
<Button variant="secondary">
  Learn More
</Button>

// Tertiary action (minimal)
<Button variant="ghost">
  Cancel
</Button>

// Destructive action (red gradient)
<Button variant="danger">
  Delete
</Button>
```

### Badges

```tsx
// Timing badges
<Badge variant="timing" timing="Pre-Listing">Pre-Listing</Badge>
<Badge variant="timing" timing="Ongoing">Ongoing</Badge>
<Badge variant="timing" timing="Post-Listing">Post-Listing</Badge>

// Status badges
<Badge variant="status" status="blocked">Blocked</Badge>
<Badge variant="status" status="in-progress">In Progress</Badge>

// Default badge
<Badge>Custom Label</Badge>
```

### Form Inputs

```tsx
// Text input (16px prevents mobile zoom)
<Input 
  label="Email Address"
  placeholder="your@email.com"
  type="email"
/>

// Select dropdown
<Select 
  label="Choose Option"
  options={[
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
  ]}
/>

// Textarea
<Textarea 
  label="Description"
  placeholder="Enter details..."
  rows={4}
/>
```

### Progress Indicators

```tsx
// Standard progress bar
<ProgressBar value={65} />

// Different sizes
<ProgressBar value={65} size="sm" />
<ProgressBar value={65} size="md" />  // default
<ProgressBar value={65} size="lg" />

// With label
<ProgressBar value={65} showLabel />
```

## 🎨 Common Color Combinations

### Text on Dark Backgrounds

```tsx
// Primary text (highest contrast)
<p className="text-primary">Main content</p>

// Secondary text (medium contrast)
<p className="text-secondary">Supporting text</p>

// Muted text (lower contrast)
<span className="text-muted">Metadata, labels</span>

// Faint text (minimal contrast)
<span className="text-faint">Disabled, placeholder</span>
```

### Colored Text for Emphasis

```tsx
// Warm (primary emphasis)
<span className="text-warm-400">$1,234</span>

// Accent (links, interactive)
<a className="text-accent-400 hover:text-accent-300">Learn more</a>

// Success (positive states)
<span className="text-success-400">✓ Complete</span>
```

### Background Gradients

```tsx
// Warm gradient (primary actions)
<div className="bg-gradient-to-br from-warm-400 to-warm-500">

// Accent gradient (info/interactive)
<div className="bg-gradient-to-br from-accent-400 to-accent-500">

// Success gradient (positive)
<div className="bg-gradient-to-br from-success-400 to-success-500">
```

## 🎯 Spacing Scale

```tsx
// Padding
p-2    // 0.5rem - Tight
p-4    // 1rem - Comfortable
p-6    // 1.5rem - Spacious (default for cards)
p-8    // 2rem - Very spacious

// Gaps
gap-2   // 0.5rem - Tight
gap-4   // 1rem - Comfortable (default)
gap-6   // 1.5rem - Spacious
gap-8   // 2rem - Very spacious

// Margins
mt-4   // 1rem - Standard spacing
mb-6   // 1.5rem - Section spacing
my-8   // 2rem - Large section spacing
```

## 🎨 Border Radius Scale

```tsx
rounded-lg   // 0.5rem - Small elements
rounded-xl   // 0.75rem - Buttons, inputs
rounded-2xl  // 1.25rem - Cards (default)
rounded-3xl  // 1.5rem - Large cards
rounded-full // Pills, badges, avatars
```

## 💡 Animation & Transitions

```tsx
// Standard transition
<div className="transition-all duration-300">

// Hover effects
<div className="hover:scale-[1.02] hover:shadow-glow-warm">

// Focus states (automatic)
<button> // Gets focus:ring-2 focus:ring-accent-400/50

// Loading animation
<Button isLoading>Processing</Button>
```

## ♿ Accessibility Patterns

```tsx
// Focus visible states (automatic)
// All interactive elements get clear focus rings

// Minimum touch targets (44x44px)
<Button>  // Already sized appropriately

// Proper contrast
// All color combinations meet WCAG AA

// Semantic HTML
<h1> to <h6>  // Use proper heading hierarchy
<label>       // Associate with inputs
<button>      // For clickable actions
<a>           // For navigation
```

## 🎯 Layout Patterns

### Grid Layouts

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>

// Auto-fit grid
<div className="grid grid-cols-auto-fit-[200px] gap-4">
  ...
</div>
```

### Flex Layouts

```tsx
// Horizontal with gap
<div className="flex items-center gap-4">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>

// Space between
<div className="flex items-center justify-between">
  <h2>Title</h2>
  <Button>Action</Button>
</div>

// Vertical stack
<div className="flex flex-col gap-4">
  <Card>...</Card>
  <Card>...</Card>
</div>
```

### Container Widths

```tsx
// Max width containers
<div className="max-w-7xl mx-auto px-6">  // Full page
<div className="max-w-4xl mx-auto">       // Article
<div className="max-w-md mx-auto">        // Form
```

## 🔧 Common Utilities

```tsx
// Glass effect
<div className="glass">                    // Standard
<div className="glass-heavy">              // Enhanced

// Shadows
<div className="shadow-soft">              // Subtle
<div className="shadow-medium">            // Default
<div className="shadow-strong">            // Prominent
<div className="shadow-glow-warm">         // Warm glow
<div className="shadow-glow-accent">       // Accent glow

// Borders
<div className="border border-white/15">   // Standard
<div className="border-2 border-warm-400"> // Colored

// Scrollbars
<div className="sidebar-scrollbar">        // Thin scrollbar
<div className="hide-scrollbar">           // Hidden scrollbar
```

## 📊 Data Visualization

```tsx
// Numbers with monospace
<div className="font-mono data-number text-3xl text-warm-400">
  $12,345.67
</div>

// Percentages
<div className="text-2xl font-bold text-success-400">
  {percentage}%
</div>

// Stats grid
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div className="text-center">
    <div className="text-3xl font-mono text-warm-400">42</div>
    <div className="text-sm text-muted">Tasks</div>
  </div>
  ...
</div>
```

## 🎨 Special Effects

```tsx
// Gradient text
<h1 className="gradient-text">
  Beautiful Heading
</h1>

// Shimmer border
<div className="shimmer-border rounded-2xl p-6">
  Premium content
</div>

// Glow effect
<Button className="shadow-glow-warm">
  Highlighted Action
</Button>
```

## 💻 Responsive Patterns

```tsx
// Hide on mobile
<div className="hidden md:block">Desktop only</div>

// Show on mobile only
<div className="block md:hidden">Mobile only</div>

// Responsive text sizes
<h1 className="text-3xl md:text-4xl lg:text-5xl">
  Responsive Heading
</h1>

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">
  Responsive spacing
</div>
```

## 🚀 Performance Tips

```tsx
// Lazy load images
<img loading="lazy" />

// Memoize expensive components
const MemoizedCard = React.memo(Card);

// Use CSS transitions (not JS)
<div className="transition-all duration-300">

// Avoid inline styles when possible
// Use Tailwind classes instead
```

## ✅ Code Quality Checklist

```tsx
// ✓ Use semantic HTML
// ✓ Include proper ARIA labels
// ✓ Ensure keyboard navigation
// ✓ Meet contrast requirements
// ✓ Add focus states
// ✓ Use responsive units
// ✓ Follow naming conventions
// ✓ Keep components modular
```

---

**Pro Tips:**
- Use the design-system-showcase component to see all options
- Check DESIGN_SYSTEM.md for detailed documentation
- Test with keyboard navigation
- Verify color contrast with DevTools
- Preview on mobile devices
