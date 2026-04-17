/**
 * Design System Showcase Component
 * 
 * A comprehensive visual demonstration of the updated design system
 * including typography, colors, and component variants.
 * 
 * Usage: Import and render in a dedicated design system page
 */

'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Select, Textarea } from '@/components/ui/input';
import { ProgressBar } from '@/components/ui/progress';

export function DesignSystemShowcase() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="font-display font-bold text-5xl gradient-text">
          Design System
        </h1>
        <p className="text-lg text-secondary max-w-3xl leading-relaxed">
          A friendly, approachable design system with improved typography, warmer colors, 
          and enhanced readability for a more welcoming user experience.
        </p>
      </div>

      {/* Typography Section */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Headings */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Headings</h3>
            <div className="space-y-3">
              <h1 className="font-display font-bold text-5xl">Heading 1 - Plus Jakarta Sans</h1>
              <h2 className="font-display font-bold text-4xl">Heading 2 - Bold Display</h2>
              <h3 className="font-display font-semibold text-3xl">Heading 3 - Semibold</h3>
              <h4 className="font-display font-semibold text-2xl">Heading 4 - Section Title</h4>
              <h5 className="font-display font-medium text-xl">Heading 5 - Subsection</h5>
              <h6 className="font-display font-medium text-lg">Heading 6 - Small Section</h6>
            </div>
          </div>

          {/* Body Text */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Body Text</h3>
            <div className="space-y-3">
              <p className="text-lg text-primary">
                Large body text - DM Sans provides excellent readability with its geometric design
                and optimized letter spacing for digital interfaces.
              </p>
              <p className="text-base text-secondary leading-relaxed">
                Base body text with improved line height (1.7) ensures comfortable reading across
                various screen sizes. The warmer color palette reduces eye strain during extended use.
              </p>
              <p className="text-sm text-muted">
                Small text maintains readability even at reduced sizes thanks to the well-designed
                font family and careful color selection.
              </p>
              <p className="text-xs text-faint uppercase tracking-wider font-bold">
                Extra Small Text - Labels & Metadata
              </p>
            </div>
          </div>

          {/* Monospace */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Monospace (Data)</h3>
            <div className="font-mono space-y-2">
              <div className="text-2xl data-number text-warm-400">$3,456.78</div>
              <div className="text-lg data-number text-accent-400">127 tasks</div>
              <div className="text-base data-number">2024-12-28 14:30:00</div>
              <code className="text-sm text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg">
                const greeting = "Hello, World!";
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colors Section */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Warm Colors */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Warm (Primary)</h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-warm-300"></div>
                <p className="text-xs text-center text-muted">warm-300</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-warm-400"></div>
                <p className="text-xs text-center text-muted">warm-400</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-warm-500"></div>
                <p className="text-xs text-center text-muted">warm-500</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-warm-600"></div>
                <p className="text-xs text-center text-muted">warm-600</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-warm-700"></div>
                <p className="text-xs text-center text-muted">warm-700</p>
              </div>
            </div>
          </div>

          {/* Accent Colors */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Accent (Interactive)</h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-accent-300"></div>
                <p className="text-xs text-center text-muted">accent-300</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-accent-400"></div>
                <p className="text-xs text-center text-muted">accent-400</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-accent-500"></div>
                <p className="text-xs text-center text-muted">accent-500</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-accent-600"></div>
                <p className="text-xs text-center text-muted">accent-600</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-accent-700"></div>
                <p className="text-xs text-center text-muted">accent-700</p>
              </div>
            </div>
          </div>

          {/* Success Colors */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Success (Positive)</h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-success-300"></div>
                <p className="text-xs text-center text-muted">success-300</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-success-400"></div>
                <p className="text-xs text-center text-muted">success-400</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-success-500"></div>
                <p className="text-xs text-center text-muted">success-500</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-success-600"></div>
                <p className="text-xs text-center text-muted">success-600</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-success-700"></div>
                <p className="text-xs text-center text-muted">success-700</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buttons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Variants</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger">Danger Button</Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">States</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Normal</Button>
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Timing Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="timing" timing="Pre-Listing">Pre-Listing</Badge>
              <Badge variant="timing" timing="Ongoing">Ongoing</Badge>
              <Badge variant="timing" timing="Post-Listing">Post-Listing</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Status Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Badge variant="status" status="blocked">Blocked</Badge>
              <Badge variant="status" status="in-progress">In Progress</Badge>
              <Badge variant="status" status="na">Not Applicable</Badge>
              <Badge variant="default">Default</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Elements Section */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input 
            label="Text Input" 
            placeholder="Enter text here..."
          />
          
          <Select 
            label="Select Dropdown"
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
            ]}
          />
          
          <Textarea 
            label="Textarea" 
            placeholder="Enter longer text here..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Progress Bars Section */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Progress States</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-secondary mb-2">25% Complete</p>
                <ProgressBar value={25} />
              </div>
              <div>
                <p className="text-sm text-secondary mb-2">50% Complete</p>
                <ProgressBar value={50} />
              </div>
              <div>
                <p className="text-sm text-secondary mb-2">75% Complete</p>
                <ProgressBar value={75} />
              </div>
              <div>
                <p className="text-sm text-secondary mb-2">100% Complete</p>
                <ProgressBar value={100} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Sizes</h3>
            <div className="space-y-4">
              <ProgressBar value={60} size="sm" />
              <ProgressBar value={60} size="md" />
              <ProgressBar value={60} size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Section */}
      <Card>
        <CardHeader>
          <CardTitle>Card Variants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default" className="p-6">
              <h4 className="font-display font-semibold text-lg mb-2">Default Card</h4>
              <p className="text-sm text-secondary">
                Standard glass card with subtle borders and shadows.
              </p>
            </Card>

            <Card variant="glass" className="p-6">
              <h4 className="font-display font-semibold text-lg mb-2">Glass Card</h4>
              <p className="text-sm text-secondary">
                Enhanced glass effect with stronger backdrop blur.
              </p>
            </Card>

            <Card variant="brutal" className="p-6">
              <h4 className="font-display font-semibold text-lg mb-2">Brutal Card</h4>
              <p className="text-sm text-secondary">
                Bold borders with offset shadow effect.
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover className="p-6">
              <h4 className="font-display font-semibold text-lg mb-2">Hoverable Card</h4>
              <p className="text-sm text-secondary">
                Hover over this card to see the interactive effect.
              </p>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-secondary">
            <li className="flex items-start gap-3">
              <span className="text-success-400 mt-1">✓</span>
              <span>WCAG AA compliant contrast ratios for all text/background combinations</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-success-400 mt-1">✓</span>
              <span>Enhanced focus states with 2px rings and 3px offset for clear keyboard navigation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-success-400 mt-1">✓</span>
              <span>Minimum 44x44px touch targets for mobile accessibility</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-success-400 mt-1">✓</span>
              <span>16px base font size prevents mobile browser zoom on form inputs</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-success-400 mt-1">✓</span>
              <span>Semantic HTML with proper heading hierarchy and ARIA labels</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-success-400 mt-1">✓</span>
              <span>Color is never the only means of conveying information</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
