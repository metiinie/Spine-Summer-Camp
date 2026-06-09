# Design Document: Mobile Responsive Design

## Overview

This design implements a comprehensive responsive design system for the Spine Summer Camp registration website, targeting mobile (320px-767px), tablet (768px-1023px), and desktop (1024px+) viewports. The key innovation is a bottom tab bar navigation pattern for mobile devices, replacing the traditional hamburger menu with a more native app-like experience.

The implementation leverages Tailwind CSS's responsive utilities and React component composition to create adaptive layouts without requiring a full rewrite. We introduce a new `BottomTabBar` component for mobile navigation and a `CheckStatusPage` for users to track their registration status.

## Architecture

### Component Hierarchy

```
App Layout
├── Navigation (Conditional)
│   ├── TopNavBar (tablet/desktop)
│   └── BottomTabBar (mobile)
├── Page Content
│   ├── HomePage (responsive)
│   ├── RegisterPage (responsive)
│   ├── ActivitiesPage (responsive)
│   ├── CheckStatusPage (new, responsive)
│   ├── AdminDashboard (responsive with card view)
│   └── PaymentPage (responsive)
└── Footer (responsive)
```

### Responsive Strategy

**Breakpoint System:**
- Mobile: `< 768px` (Tailwind default)
- Tablet: `md:` prefix (`768px - 1023px`)
- Desktop: `lg:` prefix (`≥ 1024px`)

**Layout Approach:**
1. **Mobile-first design**: Base styles target mobile, progressively enhanced for larger screens
2. **Container queries**: Use max-width containers with responsive padding
3. **Fluid typography**: Scale font sizes using responsive utilities
4. **Touch targets**: Minimum 44x44px for all interactive elements
5. **Safe areas**: Account for device notches and home indicators

## Components and Interfaces

### 1. BottomTabBar Component

**Purpose**: Provides mobile-specific navigation with 4 fixed tabs at the bottom of the viewport.

**Interface:**
```typescript
interface BottomTabBarProps {
  locale: string;
  currentPath: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  href: string;
  matchPaths: string[]; // Paths that should highlight this tab
}
```

**Implementation Details:**
- Fixed position at bottom with `pb-safe` for device notches
- Z-index of 50 to stay above content
- Active state styling with highlighted icon and text
- Icons from lucide-react library
- Backdrop blur for glassmorphism effect
- Only rendered on mobile viewports (hidden on md+)

**Tabs:**
1. Home (Home icon) → `/`
2. Register (PenLine icon) → `/register`
3. About Us (Info icon) → `/activities`
4. Check Status (Search icon) → `/check-status`

**Styling:**
```css
position: fixed
bottom: 0
left: 0
right: 0
height: 64px + safe-area-inset-bottom
background: white/95 with backdrop-blur
border-top: 1px border-slate-200
shadow-lg
z-index: 50
display: grid
grid-template-columns: repeat(4, 1fr)
```

### 2. TopNavBar Component (Enhanced)

**Purpose**: Traditional top navigation for tablet and desktop viewports.

**Changes:**
- Hidden on mobile (`hidden md:flex`)
- Remains sticky on tablet/desktop
- Contains same navigation links as tabs
- Includes language switcher
- Includes admin login link

### 3. Layout Wrapper Component

**Purpose**: Manages viewport-specific layout and spacing, including bottom tab bar spacing on mobile.

**Interface:**
```typescript
interface LayoutWrapperProps {
  children: React.ReactNode;
  locale: string;
  currentPath: string;
}
```

**Implementation:**
- Adds `pb-20` (80px) on mobile to prevent content from being hidden behind bottom tabs
- No extra padding on tablet/desktop
- Conditionally renders BottomTabBar or TopNavBar

### 4. Responsive AdminDashboard

**Current Issue**: Data table causes horizontal scroll on mobile

**Solution**: Conditional rendering based on viewport
- **Mobile**: Card-based list view
- **Tablet/Desktop**: Keep existing table

**Card View Structure:**
```typescript
interface RegistrationCard {
  registration: Registration;
  onView: () => void;
}
```

Each card displays:
- Camper name (prominent)
- Status badge
- Session type badge
- Parent contact
- Registration date
- Tap anywhere to view details

**Mobile Layout:**
```
┌─────────────────────────────┐
│ John Doe                 [↗]│
│ ●●● Approved                │
│ 📅 Full Day                 │
│ 👤 Jane Doe                 │
│ 📆 Jan 15, 2026             │
└─────────────────────────────┘
```

### 5. Responsive Registration Form

**Progress Indicator Changes:**
- Mobile: Hide step labels, show only icons with connecting lines
- Tablet/Desktop: Show icons + labels

**Form Layout Changes:**
- Mobile: Single column for all form fields
- Date inputs: Keep 3-column grid but reduce padding
- Tablet: 2 columns for appropriate fields
- Desktop: Original 2-3 column layouts

**Button Changes:**
- Mobile: Full-width stacked buttons
- Tablet/Desktop: Inline buttons

### 6. CheckStatusPage Component (New)

**Purpose**: Allow users to check registration status using their reference number.

**Interface:**
```typescript
interface CheckStatusPageProps {
  locale: string;
}

interface RegistrationStatus {
  referenceNumber: string;
  status: Status;
  camperName: string;
  session: string;
  amount: string;
  createdAt: string;
  approvedAt?: string;
  rejectionReason?: string;
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│  Check Registration Status          │
│                                     │
│  Enter your reference number:       │
│  ┌──────────────────────────────┐  │
│  │ REF-XXXXXX                   │  │
│  └──────────────────────────────┘  │
│                                     │
│  [Check Status Button]              │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Status: Approved ✓           │  │
│  │ Camper: John Doe             │  │
│  │ Session: Full Day            │  │
│  │ Amount: 40,000 ETB           │  │
│  │ Date: Jan 15, 2026           │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

**API Endpoint:**
```typescript
// GET /api/registration-status?ref=REF-XXXXXX
// Returns: RegistrationStatus | { error: string }
```

## Data Models

### Responsive Breakpoints

```typescript
const BREAKPOINTS = {
  mobile: 0,      // 0-767px
  tablet: 768,    // 768-1023px
  desktop: 1024,  // 1024px+
} as const;

const CONTAINER_PADDING = {
  mobile: '1rem',    // 16px
  tablet: '1.5rem',  // 24px
  desktop: '2rem',   // 32px
} as const;

const CARD_PADDING = {
  mobile: '1rem',     // 16px
  tablet: '1.25rem',  // 20px
  desktop: '1.5rem',  // 24px
} as const;
```

### Touch Target Sizes

```typescript
const TOUCH_TARGETS = {
  minimum: 44,        // 44px × 44px
  comfortable: 48,    // 48px × 48px
  input: 44,          // Form inputs
  button: 44,         // Buttons
  spacing: 8,         // Minimum spacing between targets
} as const;
```

### Typography Scale

```typescript
const TYPOGRAPHY = {
  mobile: {
    h1: '1.75rem',    // 28px
    h2: '1.5rem',     // 24px
    h3: '1.25rem',    // 20px
    body: '0.875rem', // 14px
    small: '0.75rem', // 12px
  },
  tablet: {
    h1: '2.25rem',    // 36px
    h2: '1.875rem',   // 30px
    h3: '1.5rem',     // 24px
    body: '1rem',     // 16px
    small: '0.875rem',// 14px
  },
  desktop: {
    h1: '3rem',       // 48px
    h2: '2.25rem',    // 36px
    h3: '1.875rem',   // 30px
    body: '1rem',     // 16px
    small: '0.875rem',// 14px
  },
} as const;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Bottom Tab Bar Visibility

*For any* mobile viewport (width < 768px), the Bottom_Tab_Bar should be rendered and visible at the bottom of the screen with fixed positioning.

**Validates: Requirements 1.1, 1.5**

### Property 2: Top Navigation Hiding on Mobile

*For any* mobile viewport (width < 768px), the traditional top navigation should be hidden and not rendered in the DOM.

**Validates: Requirements 1.6**

### Property 3: Content Padding for Bottom Tabs

*For any* page with Bottom_Tab_Bar visible, the main content container should have bottom padding of at least 80px to prevent content from being obscured by the fixed bottom bar.

**Validates: Requirements 1.5**

### Property 4: Active Tab Highlighting

*For any* currently active route, the corresponding tab in the Bottom_Tab_Bar should have visual highlighting (different color/weight) distinct from inactive tabs.

**Validates: Requirements 1.4**

### Property 5: Touch Target Minimum Size

*For any* interactive element (button, link, input, tab), the minimum clickable/tappable area should be 44px × 44px on mobile viewports.

**Validates: Requirements 6.1, 6.3, 6.4, 6.5**

### Property 6: Form Field Single Column on Mobile

*For any* form with grid layout on desktop, all form fields should stack in a single column (grid-cols-1) on mobile viewports, except specifically exempted layouts like date inputs.

**Validates: Requirements 3.2**

### Property 7: Admin Table to Cards Transformation

*For any* mobile viewport viewing the admin dashboard, the data table should be replaced with a card-based list view, and the table should not be rendered.

**Validates: Requirements 4.2, 4.3**

### Property 8: Responsive Image Aspect Ratios

*For any* image displayed on any viewport size, the aspect ratio should be preserved without distortion or stretching.

**Validates: Requirements 8.1, 8.3**

### Property 9: Session Cards Stacking

*For any* mobile viewport viewing the homepage sessions section, the two session cards (Half Day, Full Day) should stack vertically (grid-cols-1) instead of side-by-side.

**Validates: Requirements 2.3**

### Property 10: Typography Scaling

*For any* heading element, the font size should scale down appropriately on mobile viewports compared to desktop (e.g., h1: 3rem → 1.75rem).

**Validates: Requirements 7.1, 7.3**

### Property 11: Safe Area Insets

*For any* mobile device with bottom notch or home indicator, the Bottom_Tab_Bar should include safe-area-inset-bottom padding to prevent overlap with system UI.

**Validates: Requirements 1.8**

### Property 12: Drawer Full Screen on Mobile

*For any* admin viewing registration details on mobile viewport, the detail drawer should occupy full screen width (100vw) instead of the side panel layout used on desktop.

**Validates: Requirements 4.5**

### Property 13: Check Status API Response

*For any* valid reference number submitted to the check status endpoint, the API should return a RegistrationStatus object containing at minimum: referenceNumber, status, camperName, session, and amount.

**Validates: Requirements 13.2, 13.3, 13.4**

### Property 14: Grid Layout Responsiveness

*For any* grid layout with multiple columns on desktop, the number of columns should reduce progressively: Desktop (3-4 cols) → Tablet (2 cols) → Mobile (1 col).

**Validates: Requirements 2.2, 5.1, 5.2, 5.3, 5.4**

### Property 15: Viewport Meta Tag Presence

*For any* HTML page served by the application, the document head should contain a viewport meta tag with "width=device-width, initial-scale=1".

**Validates: Requirements 12.1**

## Error Handling

### Viewport Detection Errors

**Issue**: CSS media queries fail or return unexpected results

**Solution**: 
- Use standard Tailwind breakpoints (mobile, md, lg)
- Provide fallback styles for unsupported viewports
- Test on real devices, not just browser DevTools

### Touch Target Sizing Errors

**Issue**: Interactive elements smaller than 44px on mobile

**Solution**:
- Apply minimum height/width classes: `min-h-[44px] min-w-[44px]`
- Add padding to increase touch area: `p-3` (12px) minimum
- Use `touch-manipulation` CSS to prevent double-tap zoom

### Bottom Tab Z-Index Conflicts

**Issue**: Content appears above bottom tab bar

**Solution**:
- Set BottomTabBar z-index to 50
- Ensure modals/drawers use z-index 60+
- Fixed/sticky elements should use z-index < 50 unless critical

### Safe Area Inset Support

**Issue**: Bottom tabs overlap device home indicators

**Solution**:
```css
padding-bottom: env(safe-area-inset-bottom);
/* or Tailwind plugin */
pb-safe
```

### Image Loading on Slow Connections

**Issue**: Large images cause slow page loads on mobile

**Solution**:
- Use Next.js Image component with responsive sizes
- Implement lazy loading: `loading="lazy"`
- Provide blur placeholders
- Use appropriate image formats (WebP with fallback)

### Form Validation Visibility on Mobile

**Issue**: Error messages hidden or truncated on small screens

**Solution**:
- Display errors below inputs (not inline)
- Use adequate font size (12px minimum)
- Scroll to first error on validation failure
- Ensure error text wraps properly

## Testing Strategy

### Unit Tests

**Purpose**: Verify individual component responsive behavior

**Components to Test:**
1. `BottomTabBar`: Rendering, active state, navigation
2. `TopNavBar`: Visibility on different viewports
3. `LayoutWrapper`: Padding application
4. `AdminDashboard`: Table vs cards rendering
5. `CheckStatusPage`: Form submission and status display

**Test Cases:**
```typescript
describe('BottomTabBar', () => {
  it('renders all 4 tabs', () => {})
  it('highlights active tab based on current path', () => {})
  it('navigates to correct page on tab click', () => {})
  it('applies safe area insets on iOS devices', () => {})
})

describe('Responsive Layout', () => {
  it('shows BottomTabBar on mobile viewport', () => {})
  it('hides BottomTabBar on tablet viewport', () => {})
  it('shows TopNavBar on desktop viewport', () => {})
  it('applies correct padding for bottom tabs', () => {})
})

describe('CheckStatusPage', () => {
  it('validates reference number format', () => {})
  it('fetches and displays registration status', () => {})
  it('shows error for invalid reference', () => {})
  it('displays all required status fields', () => {})
})
```

### Property-Based Tests

**Purpose**: Verify universal responsive properties across many viewport sizes

**Test Libraries:**
- `@fast-check/jest` for property-based testing
- `@testing-library/react` for component testing
- Custom viewport generator for responsive testing

**Property Tests:**
```typescript
describe('Responsive Properties', () => {
  test('Property 1: Bottom Tab Bar Visibility', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }), // mobile widths
        (width) => {
          const { container } = render(<BottomTabBar currentPath="/" locale="en" />)
          setViewportWidth(width)
          const tabBar = container.querySelector('[data-testid="bottom-tab-bar"]')
          expect(tabBar).toBeVisible()
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 5: Touch Target Minimum Size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }),
        fc.constantFrom('button', 'a', 'input[type="submit"]'),
        (width, selector) => {
          setViewportWidth(width)
          const element = document.querySelector(selector)
          const { height, width: elWidth } = element.getBoundingClientRect()
          expect(height).toBeGreaterThanOrEqual(44)
          expect(elWidth).toBeGreaterThanOrEqual(44)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 7: Admin Table to Cards Transformation', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }),
        (width) => {
          setViewportWidth(width)
          const { container } = render(<AdminDashboard />)
          const table = container.querySelector('table')
          const cards = container.querySelectorAll('[data-testid="registration-card"]')
          expect(table).toBeNull()
          expect(cards.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 10: Typography Scaling', () => {
    fc.assert(
      fc.property(
        fc.record({
          mobile: fc.integer({ min: 320, max: 767 }),
          desktop: fc.integer({ min: 1024, max: 1920 }),
        }),
        ({ mobile, desktop }) => {
          setViewportWidth(mobile)
          const h1Mobile = document.querySelector('h1')
          const mobileFontSize = parseFloat(getComputedStyle(h1Mobile).fontSize)
          
          setViewportWidth(desktop)
          const h1Desktop = document.querySelector('h1')
          const desktopFontSize = parseFloat(getComputedStyle(h1Desktop).fontSize)
          
          expect(mobileFontSize).toBeLessThan(desktopFontSize)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 13: Check Status API Response', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 15 }), // reference numbers
        async (refNumber) => {
          const response = await fetch(`/api/registration-status?ref=${refNumber}`)
          if (response.ok) {
            const data = await response.json()
            expect(data).toHaveProperty('referenceNumber')
            expect(data).toHaveProperty('status')
            expect(data).toHaveProperty('camperName')
            expect(data).toHaveProperty('session')
            expect(data).toHaveProperty('amount')
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Integration Tests

**Purpose**: Test responsive behavior in real browser environments

**Tools:**
- Playwright for end-to-end testing
- Multiple viewport configurations
- Device emulation (iPhone, iPad, Android)

**Test Scenarios:**
1. **Mobile Navigation Flow**
   - Start on homepage mobile view
   - Tap each bottom tab
   - Verify correct page loads
   - Verify active tab updates

2. **Registration Form Mobile Flow**
   - Complete all steps on mobile viewport
   - Verify single-column layout
   - Verify touch-friendly inputs
   - Submit successfully

3. **Admin Dashboard Responsive**
   - View dashboard on mobile
   - Verify card view (not table)
   - Tap registration card
   - Verify full-screen detail drawer

4. **Check Status Flow**
   - Navigate to Check Status tab
   - Enter reference number
   - Verify status display
   - Test invalid reference

5. **Viewport Rotation**
   - Load page in portrait
   - Rotate to landscape
   - Verify layout adapts
   - Rotate back to portrait

### Visual Regression Testing

**Purpose**: Ensure responsive layouts don't break during changes

**Tools:**
- Percy or Chromatic for visual diffs
- Multiple viewport snapshots

**Viewports to Test:**
- 320px (iPhone SE)
- 375px (iPhone 12)
- 768px (iPad portrait)
- 1024px (iPad landscape)
- 1440px (Desktop)

### Manual Testing Checklist

**Devices:**
- [ ] iPhone SE (small mobile)
- [ ] iPhone 14 Pro (mobile with notch)
- [ ] iPad (tablet portrait)
- [ ] iPad (tablet landscape)
- [ ] Android phone (various sizes)
- [ ] Desktop browser (Chrome, Safari, Firefox)

**Test Cases:**
- [ ] Bottom tabs appear only on mobile
- [ ] All tabs navigate correctly
- [ ] Active tab is highlighted
- [ ] Registration form is usable on mobile
- [ ] Admin dashboard shows cards on mobile
- [ ] Check status page functions on all devices
- [ ] Images maintain aspect ratio
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling
- [ ] Touch targets are easy to tap
- [ ] Safe areas respected on notched devices
