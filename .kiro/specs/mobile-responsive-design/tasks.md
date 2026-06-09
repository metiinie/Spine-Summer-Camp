# Implementation Plan: Mobile Responsive Design

## Overview

This implementation plan converts the Spine Summer Camp website into a fully responsive experience with mobile-first design. The work is organized into incremental tasks that build on each other, starting with foundational navigation components and progressively enhancing each page for responsive layouts.

## Tasks

- [-] 1. Create Bottom Tab Bar Navigation Component
  - Create `frontend/src/components/navigation/BottomTabBar.tsx` component
  - Implement fixed bottom positioning with safe area insets
  - Add 4 tabs: Home, Register, About Us, Check Status
  - Implement active tab highlighting based on current path
  - Style with glassmorphism effect (backdrop-blur + semi-transparent background)
  - Add responsive visibility (visible mobile, hidden tablet/desktop)
  - Use Lucide icons: Home, PenLine, Info, Search
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.8_

- [ ] 1.1 Write property test for bottom tab bar visibility
  - **Property 1: Bottom Tab Bar Visibility**
  - **Validates: Requirements 1.1, 1.5**

- [-] 2. Update Layout to Support Bottom Tab Navigation
  - Modify the root layout component (`frontend/src/app/[locale]/layout.tsx`)
  - Add conditional rendering: BottomTabBar for mobile, existing nav for tablet/desktop
  - Add bottom padding (`pb-20` / 80px) to main content on mobile viewports
  - Ensure z-index layering is correct (tabs at z-50)
  - Test navigation between all 4 tabs
  - _Requirements: 1.6, 1.7_

- [ ] 2.1 Write property test for content padding
  - **Property 3: Content Padding for Bottom Tabs**
  - **Validates: Requirements 1.5**

- [ ] 2.2 Write property test for top navigation hiding
  - **Property 2: Top Navigation Hiding on Mobile**
  - **Validates: Requirements 1.6**

- [ ] 3. Create Check Status Page and API Endpoint
  - [x] 3.1 Create backend API endpoint for registration status lookup
    - Create `backend/src/registrations/registrations.controller.ts` GET method
    - Add `findByReference` method to service
    - Endpoint: `GET /api/registration-status?ref=REF-XXXXX`
    - Return: `{ referenceNumber, status, camperName, session, amount, createdAt }`
    - Handle invalid reference with 404 error
    - _Requirements: 13.2, 13.3, 13.4_

  - [x] 3.2 Create Check Status page component
    - Create `frontend/src/app/[locale]/check-status/page.tsx`
    - Build form with reference number input
    - Add "Check Status" button
    - Display status result card with color-coded badges
    - Handle loading and error states
    - Make fully responsive (mobile/tablet/desktop)
    - _Requirements: 13.1, 13.5, 13.6, 13.7, 13.8_

- [ ] 3.3 Write property test for check status API
  - **Property 13: Check Status API Response**
  - **Validates: Requirements 13.2, 13.3, 13.4**

- [-] 4. Implement Responsive Homepage Layout
  - Update `frontend/src/app/[locale]/page.tsx` with responsive utilities
  - Partner logos: Stack vertically on mobile (`flex-col`), horizontal on desktop (`md:flex-row`)
  - Stats bar: Keep 3-column grid on mobile, expand on tablet/desktop
  - Session cards: Stack vertically on mobile (`grid-cols-1 md:grid-cols-2`)
  - FAQ section: Full width on mobile, max-width on tablet/desktop
  - Footer: Stack columns vertically on mobile (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
  - Reduce section padding on mobile (`px-4 md:px-6 lg:px-8`)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 9.1, 9.2, 9.3_

- [ ] 4.1 Write property test for session cards stacking
  - **Property 9: Session Cards Stacking**
  - **Validates: Requirements 2.3**

- [-] 5. Implement Responsive Registration Form
  - Update `frontend/src/components/registration/MultiStepForm.tsx`
  - Progress indicator: Hide step labels on mobile (`hidden sm:block`)
  - Form grid layouts: Change to single column on mobile (`grid-cols-1 md:grid-cols-2`)
  - Keep date inputs (Month/Day/Year) in 3-column grid but reduce padding
  - Buttons: Full width on mobile (`w-full md:w-auto`), inline on desktop
  - Reduce form card padding on mobile (`p-4 md:p-6 lg:p-8`)
  - Ensure all inputs are minimum 44px height
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 6.3, 6.4, 6.5, 9.5_

- [ ] 5.1 Write property test for form field single column
  - **Property 6: Form Field Single Column on Mobile**
  - **Validates: Requirements 3.2**

- [ ] 5.2 Write property test for touch target minimum size
  - **Property 5: Touch Target Minimum Size**
  - **Validates: Requirements 6.1, 6.3, 6.4, 6.5**

- [ ] 6. Implement Responsive Admin Dashboard
  - [x] 6.1 Create mobile card view component
    - Create `frontend/src/components/admin/RegistrationCard.tsx`
    - Display: Camper name, status badge, session, parent, date
    - Make entire card tappable to view details
    - Style with border, rounded corners, shadow on hover
    - _Requirements: 4.2, 4.3, 4.8_

  - [x] 6.2 Update AdminDashboardClient for responsive layout
    - Update `frontend/src/components/admin/AdminDashboardClient.tsx`
    - Stats cards: 2x2 grid on mobile (`grid-cols-2 lg:grid-cols-4`)
    - Filters: Stack vertically on mobile (`flex-col sm:flex-row`)
    - Conditionally render: Cards on mobile, Table on tablet/desktop
    - Use CSS classes: `block md:hidden` for cards, `hidden md:block` for table
    - _Requirements: 4.1, 4.2, 4.4, 4.7_

  - [x] 6.3 Make detail drawer full-screen on mobile
    - Update drawer container: `w-full md:max-w-lg` for responsive width
    - Adjust close button and header for mobile
    - Ensure content scrolls properly on mobile
    - _Requirements: 4.5_

  - [x] 6.4 Optimize action buttons for mobile
    - Header buttons: Show only icons on mobile, add text on desktop
    - Use `hidden sm:inline` for button text
    - Ensure buttons remain touch-friendly (min 44px)
    - _Requirements: 4.6_

- [ ] 6.5 Write property test for admin table to cards
  - **Property 7: Admin Table to Cards Transformation**
  - **Validates: Requirements 4.2, 4.3**

- [ ] 6.6 Write property test for drawer full screen
  - **Property 12: Drawer Full Screen on Mobile**
  - **Validates: Requirements 4.5**

- [x] 7. Implement Responsive Activities Page
  - Update `frontend/src/app/[locale]/activities/page.tsx`
  - Activity cards: Single column on mobile (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
  - Camp info grid: Single column on mobile, 2 columns on tablet, 3 on desktop
  - Reduce padding and spacing on mobile
  - Ensure images maintain aspect ratio with Next.js Image
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 8.1, 8.4_

- [ ] 7.1 Write property test for responsive grid layouts
  - **Property 14: Grid Layout Responsiveness**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [ ] 8. Implement Responsive Typography
  - Create or update typography utility classes
  - Scale headings: h1 (`text-4xl md:text-5xl lg:text-6xl`)
  - Hero title: (`text-5xl md:text-6xl lg:text-7xl`)
  - Body text: minimum 14px (`text-sm md:text-base`)
  - Ensure line-height is sufficient (`leading-relaxed`)
  - Apply across all pages consistently
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8.1 Write property test for typography scaling
  - **Property 10: Typography Scaling**
  - **Validates: Requirements 7.1, 7.3**

- [ ] 9. Optimize Images for Responsive Design
  - Update all Image components to use responsive `sizes` prop
  - QR code: Ensure remains scannable on mobile (min 90x90px)
  - Partner logos: Scale proportionally
  - Activity images: Add appropriate `sizes` attribute
  - Receipt images: Add tap-to-zoom modal on mobile
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9.1 Write property test for image aspect ratios
  - **Property 8: Responsive Image Aspect Ratios**
  - **Validates: Requirements 8.1, 8.3**

- [ ] 10. Add Safe Area Insets for Bottom Tab Bar
  - Install `tailwindcss-safe-area` plugin or use CSS env variables
  - Add safe area bottom padding to BottomTabBar
  - Use: `pb-[env(safe-area-inset-bottom)]` or plugin utility
  - Test on iOS simulator with notch
  - _Requirements: 1.8_

- [ ] 10.1 Write property test for safe area insets
  - **Property 11: Safe Area Insets**
  - **Validates: Requirements 1.8**

- [x] 11. Implement Touch-Friendly Interactions
  - Audit all buttons, links, inputs for minimum 44x44px size
  - Add `touch-manipulation` CSS to prevent double-tap zoom
  - Ensure minimum 8px spacing between adjacent touch targets
  - Apply across all pages
  - _Requirements: 6.1, 6.2_

- [x] 12. Verify Form Validation on Mobile
  - Test error message display on mobile viewports
  - Ensure errors appear below inputs (not inline)
  - Check error text is readable (min 12px)
  - Implement scroll-to-first-error on validation failure
  - Verify error text wraps properly
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 13. Add Viewport Meta Tag and Performance Optimizations
  - Verify `<meta name="viewport" content="width=device-width, initial-scale=1">` exists
  - Ensure no `maximum-scale` restriction (allow pinch-to-zoom)
  - Audit and optimize media queries
  - Verify Next.js Image optimization is working
  - Test orientation changes (portrait ↔ landscape)
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 13.1 Write property test for viewport meta tag
  - **Property 15: Viewport Meta Tag Presence**
  - **Validates: Requirements 12.1**

- [ ] 14. Final Cross-Device Testing and Polish
  - Test on real iPhone (SE, 12, 14 Pro)
  - Test on real iPad (portrait and landscape)
  - Test on Android devices (various sizes)
  - Test on desktop browsers (Chrome, Safari, Firefox, Edge)
  - Verify no horizontal scrolling on any page
  - Verify all touch targets are easy to tap
  - Verify text is readable without zooming
  - Check safe area insets on notched devices
  - Verify bottom tabs don't overlap content
  - Test all navigation flows

- [ ] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- The implementation follows a mobile-first approach, starting with base styles and progressively enhancing for larger screens
- Testing should be done incrementally after each task to catch issues early
- Use browser DevTools device emulation during development, but validate on real devices before completion
- The bottom tab bar is the most critical mobile-specific feature - prioritize tasks 1-2
- All property-based tests are now required for comprehensive coverage
