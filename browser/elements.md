# UI Component & Element Documentation

This document provides a comprehensive overview of the core UI components and design tokens used in this application. It is intended to help developers get up to speed quickly with our visual framework.

## 1. Design Tokens

Design tokens are the foundational values of our design system, stored as CSS Custom Properties. They ensure consistency across the entire UI.

### 1.1 Colors (`_colors.css`)

Our palette is based on a single pastel color to create a cohesive, single-material feel.

- `--color-base`: The main background and component color (`#f2f2f8`).
- `--color-light-shadow` / `--color-dark-shadow`: Used exclusively for creating neumorphic shadows.
- `--color-text-primary` / `--color-text-secondary`: Standard text colors.
- `--color-accent`: Used for interactive states like hover (`#8e82ff`).

### 1.2 Shadows (`_shadows.css`)

The core of our neumorphic style relies on a dual-shadow system.

- `--shadow-neumorphic`: The default, "extruded" or pushed-out shadow effect.
- `--shadow-neumorphic-inset`: The "inset" or pressed-in shadow, used for active states.

### 1.3 Spacing & Sizing (`_spacing.css`)

- `--header-element-height`: The main header height (`48px`) for the overall header container.
- `--header-element-padding`: Padding to subtract from header height (`8px`) for sub-elements.
- `--header-element-content-height`: Calculated height for sub-elements (`32px`) to ensure they fit within the header.

### 1.4 Transitions (`_transitions.css`)

Smooth animations for enhanced user experience.

- `--transition-duration-fast`: Quick transitions (`0.1s`) for immediate feedback.
- `--transition-duration-normal`: Standard transitions (`0.2s`) for smooth animations.
- `--transition-easing`: Consistent easing function (`ease-in-out`) for all animations.

## 2. Layout System (`_layout.css`)

The application uses a flexbox-based layout with intelligent visibility management for a distraction-free experience.

- `.app-header`: The container at the top of the window, holding the URL bar and window controls. **Hidden by default** with smooth height and opacity animations. Appears when mouse is within 40px of the top edge.
- `.main-container`: A horizontal flexbox container that holds both the sidebar and content area. Ensures proper layout flow and dynamic resizing.
- `.content-area`: A flexible container that holds the main content. Provides the hover detection zones for both header and sidebar. **Dynamically resizes** when the sidebar appears.
- `.is-visible`: A JavaScript-toggled class applied to show hidden elements with smooth animations.

### 2.1 Main Container Layout

The application uses a sophisticated layout system that ensures the sidebar and webview work together seamlessly:

**Structure:**
- **Body**: Vertical flexbox containing header and main container
- **Main Container**: Horizontal flexbox containing sidebar and content area
- **Content Area**: Contains hover detection zones and webview
- **Dynamic Resizing**: Webview automatically adjusts size when header and sidebar appear

**Layout Flow:**
1. **Header**: Fixed at top, hidden by default, appears on hover within 40px of top edge
2. **Main Container**: Takes remaining viewport height, uses horizontal flexbox
3. **Sidebar**: Left-aligned, starts at 0px width, expands to 200px on hover
4. **Content Area**: Right-aligned, contains webview and hover detection zones
5. **Webview**: Fills available space, responds to header and sidebar visibility

**Technical Implementation:**
- Uses `display: flex` with `flex-direction: row` for main container
- Sidebar uses `flex-shrink: 0` to maintain fixed width when visible
- Content area uses `flex: 1` to take remaining space
- Webview uses `flex: 1` to fill content area
- Hover detection zones positioned absolutely for precise edge detection
- Smooth transitions on both sidebar width and webview resizing

### 2.2 Hover Detection System

The application implements a sophisticated hover detection system for both the header and sidebar with coordinated animations:

**Header Detection:**
- **Trigger Zone**: 40px from the top edge of the window
- **Behavior**: Smoothly expands from 0px to 48px height with opacity transition
- **Persistence**: Stays visible when hovering over the header itself or when URL bar is focused

**Sidebar Detection:**
- **Trigger Zone**: 20px from the left edge of the window  
- **Behavior**: Smoothly expands from 0px to 200px width with opacity transition (synchronized with header)
- **Persistence**: Stays visible when hovering over the sidebar itself
- **Layout Impact**: When visible, the sidebar becomes part of the normal document flow, causing the main content to resize dynamically

**Coordinated Behavior:**
- **Linked Animations**: Header and sidebar show/hide together with synchronized timing
- **Cross-Hover**: Hovering over header shows sidebar, hovering over sidebar shows header
- **Unified Hide**: Both elements hide together when mouse moves away from both areas
- **Menu Button Control**: Manual toggle via menu button for both elements simultaneously

**Technical Implementation:**
- Uses `document.addEventListener('mousemove')` for global mouse tracking
- Absolute coordinate detection (`e.clientY`, `e.clientX`) for precise edge detection
- State tracking with boolean flags to prevent unnecessary class toggling
- Smooth transitions using CSS custom properties for consistent timing (0.2s duration)
- **Coordinated Functions**: `showBoth()` and `hideBoth()` ensure synchronized animations
- **Event Delegation**: Tab management uses event delegation for reliable button interactions
- **Hover Detection Zones**: Invisible overlay zones positioned absolutely for precise edge detection
- **Webview Integration**: Webview positioned below hover zones, allowing seamless interaction
- **No Overlay**: Sidebar is positioned as `relative` instead of `fixed`, ensuring it doesn't float above content

### 2.3 Platform-Specific Layout

The application automatically detects the operating system and adjusts the layout accordingly:

**macOS (`.platform-macos`):**
- Window controls positioned on the left side of the header
- Navigation controls (back, forward, home) positioned on the right side
- Follows macOS design conventions

**Windows/Linux (`.platform-windows`):**
- Navigation controls positioned on the left side of the header
- Window controls positioned on the right side
- Follows Windows/Linux design conventions

The platform detection is handled by the `ComponentManager` class in `js/components.js` and uses the `window.electronAPI.getPlatform()` method to determine the current platform.

## 3. Core Components

### 3.1 URL Bar (`_url-bar.css`)

A glassy, pill-shaped URL bar that serves as the primary navigation input.

- **Purpose**: To provide a space for users to type URLs or search queries.
- **Structure**: A `.url-bar` container holds an `.url-bar__input` element.
- **Style**: It uses a complex, multi-layered gradient and a subtle border to create a distinct glassy appearance. Its height is set by the `--header-element-height` token. A dynamic shine effect sweeps across the bar on hover, enhancing the illusion of a polished, reflective surface. The `:focus` state provides a clear visual indicator that the user is actively typing.
- **Visibility**: Part of the header system that appears on top-edge hover detection.

### 3.2 Menu Button (`_menu-button.css`)

A circular, glassy button with three horizontal lines (a "hamburger" icon).

- **Purpose**: To toggle the visibility of both header and sidebar simultaneously.
- **Structure**: A `.menu-button` container holds three `.menu-button__line` spans.
- **Style**: Matches the glassy, neumorphic aesthetic of the other controls. Its diameter is set by the `--header-element-height` token to ensure alignment with the URL bar and window controls pill.
- **Behavior**: 
  - **Toggle Function**: Click to show/hide both header and sidebar together
  - **Active State**: Visual feedback when sidebar is visible (accent color and border)
  - **Coordinated Animation**: Ensures header and sidebar animate together

### 3.3 Navigation Controls (`_nav-controls.css`)

Individual circular navigation buttons styled after the hamburger menu button for consistent visual feedback.

- **Purpose**: To provide standard browser back/forward navigation and home functionality.
- **Structure**: A `.nav-controls-container` holds three `.nav-button` elements with SVG icons.
- **Style**: Each button is a circular, glassy neumorphic button with the same styling as the menu button. Uses `--header-element-content-height` for sizing.
- **Behavior**: Provides bounce animation on hover and active states, with color transitions to accent color.
- **Modifiers**: `.nav-button--back`, `.nav-button--forward`, and `.nav-button--home`.
- **Responsive**: Has minimum width of 120px and won't shrink below this size.

### 3.4 Home Button

*Note: The home button has been integrated into the navigation controls as `.nav-button--home`.*

### 3.5 Webview (`_webview.css`)

A full-featured web browser component that displays web content within the application.

- **Purpose**: To provide a complete web browsing experience within the application window.
- **Structure**: A `.webview-container` holds the `.browser-webview` element and a `.webview-loading` indicator.
- **Behavior**:
    - **Loading States**: Shows a loading spinner and text while web content is loading.
    - **Navigation**: Integrates with the URL bar and navigation controls for seamless browsing.
    - **Responsive**: Automatically adjusts size based on header and sidebar visibility.
    - **Hover Integration**: Works seamlessly with the hover detection system for header and sidebar.
- **Features**:
    - Full web browsing capabilities
    - Loading indicators
    - URL bar integration
    - Navigation control integration
    - Proper hover detection zone handling

### 3.6 Tab Sidebar (`_sidebar.css`)

A collapsible panel on the left side of the application for displaying and managing browser tabs.

- **Purpose**: To provide a space-saving way to view and manage open tabs with full tab functionality.
- **Structure**: A `.sidebar` container holds the `.sidebar__content` with `.sidebar__header` and `.sidebar__tab-list`.
- **Visibility Behavior**: 
  - **Default State**: Fully hidden (0px width, 0 opacity)
  - **Hover Detection**: Appears when mouse is within 20px of the left edge
  - **Animation**: Smoothly expands to 200px width with opacity transition (synchronized with header)
  - **Persistence**: Stays visible when hovering over the sidebar itself
  - **Linked with Header**: Shows/hides together with header for coordinated UI experience
- **Tab Management Features**:
  - **Add Tab**: Plus button in header creates new tabs (event delegation for reliability)
  - **Switch Tabs**: Click any tab to switch to it
  - **Close Tabs**: X button on each tab (keeps at least one tab open)
  - **Tab Information**: Shows page title and favicon
  - **Active Tab**: Highlighted with accent color
  - **Scrollable List**: Handles multiple tabs with vertical scrolling
  - **Keyboard Shortcut**: Ctrl+T (or Cmd+T) to create new tabs

### 3.7 Window Controls (`_window-controls.css`)

Custom window controls that replace the default OS title bar with platform-specific styling and responsive design.

- **Purpose**: To provide standard window management (close, minimize, maximize) while matching native platform conventions.
- **Structure**: A container `.window-controls` holds three `.window-controls__button` elements with platform-specific layouts.
- **Platform-Specific Styling**:
  - **macOS**: Authentic traffic light buttons (12px red, yellow, green circles) with 6px gaps
  - **Windows**: Pill divided into 3 equal sections with text icons (×, −, □) and neumorphic styling
- **Responsive Design**:
  - **Minimum width**: 120px to prevent shrinking
  - **Platform-specific sizing**: macOS uses compact traffic lights, Windows uses wider pill design
- **Modifiers**: Use `.window-controls__button--close`, `.window-controls__button--minimize`, and `.window-controls__button--maximize` for specific actions.
- **Behavior**: 
  - **macOS**: Authentic traffic light design with subtle hover icons and scale animations
  - **Windows**: Color-coded sections (red close, yellow minimize, green maximize) with smooth gradients
  - **Interactions**: Platform-appropriate hover effects and animations

## 4. Architecture

### 4.1 Component System

The application uses a modular component architecture:

- **HTML Components**: Located in `components/` directory, each component is a separate HTML file
- **Component Manager**: `js/components.js` handles loading and inserting components
- **Application Logic**: `js/app.js` contains all event handlers and application behavior
- **Platform Detection**: Automatic detection and layout adaptation for different operating systems

### 4.2 File Organization

```
src/
├── components/          # Reusable HTML components
├── js/                  # JavaScript application logic
├── styles/              # ITCSS-organized CSS files
│   ├── 01-settings/     # Design tokens and configuration
│   ├── 04-elements/     # Base element styles
│   ├── 05-objects/      # Layout and structural components
│   ├── 06-components/   # Reusable UI components
│   └── 07-platforms/    # Platform-specific styles
└── index.html          # Main application entry point
```

### 4.3 Platform-Specific Architecture

The application uses a sophisticated platform-specific CSS architecture to ensure native look and feel across different operating systems:

**Platform Detection:**
- Automatic detection via `window.electronAPI.getPlatform()`
- Dynamic class application (`.platform-macos`, `.platform-windows`)
- Real-time layout adaptation

**CSS Organization:**
- **Base Styles**: Platform-agnostic styles in `06-components/`
- **Platform Overrides**: Platform-specific styles in `07-platforms/`
- **Separation of Concerns**: Layout, styling, and behavior separated by platform

**Platform-Specific Files:**
- `_macos.css`: macOS-specific layout and window controls
- `_windows.css`: Windows/Linux-specific layout and window controls

**Benefits:**
- **Maintainability**: Platform-specific changes isolated to dedicated files
- **Performance**: Only relevant styles loaded per platform
- **Scalability**: Easy to add new platforms or modify existing ones
- **Consistency**: Ensures native platform conventions are followed

## 5. Interaction Patterns

### 5.1 Hover Detection Zones

The application implements intelligent hover detection for a distraction-free experience:

- **Top Edge (40px)**: Triggers header visibility
- **Left Edge (20px)**: Triggers sidebar visibility
- **Global Tracking**: Uses document-level mouse tracking for reliable detection
- **State Management**: Boolean flags prevent unnecessary animations and ensure smooth transitions

### 5.2 Animation System

All UI elements use consistent animation timing and easing:

- **Fast Transitions**: 0.1s for immediate feedback (button states, content opacity)
- **Normal Transitions**: 0.2s for smooth element visibility (header/sidebar expansion)
- **Easing**: `ease-in-out` for natural, polished feel
- **Performance**: Hardware-accelerated properties (transform, opacity) for smooth 60fps animations

## 6. System Behavior

### 6.1 Webview Integration

The application integrates a full-featured webview for browsing functionality:

**Webview Features:**
- **Full Web Browsing**: Complete web content rendering and interaction
- **Loading States**: Visual feedback during page loads with spinner and text
- **Navigation Integration**: Seamless connection with URL bar and navigation controls
- **Responsive Layout**: Automatically adjusts size based on header and sidebar visibility
- **Hover Detection**: Works with existing hover detection system without interference

**Implementation:**
- **Electron Webview**: Native webview tag with full browser capabilities
- **Event Handling**: Comprehensive event listeners for loading states and navigation
- **URL Management**: Automatic URL bar updates and navigation control integration
- **Layout Integration**: Flexbox-based layout that responds to UI state changes

### 6.2 Zoom Prevention

The application implements comprehensive zoom prevention to ensure consistent UI scaling:

**Prevention Methods:**
- **Viewport Meta Tag**: `user-scalable=no` with fixed scale limits
- **CSS Zoom Prevention**: Multiple CSS rules to prevent scaling and zoom
- **JavaScript Interception**: Blocks Ctrl/Cmd + Plus/Minus/0 keyboard shortcuts
- **Touch Gesture Prevention**: Blocks pinch-to-zoom and double-tap zoom

**Implementation:**
- **HTML**: Viewport meta tag with `maximum-scale=1.0, minimum-scale=1.0`
- **CSS**: `touch-action: manipulation`, `user-select: none`, transform prevention
- **JavaScript**: Event listeners for keyboard shortcuts and touch gestures

### 6.3 Startup Behavior

**Default Zoom Level:**
- Application starts at exactly 100% zoom level
- Zoom factor reset to 1.0 on startup
- Visual zoom limits set to prevent scaling
- Cached zoom preferences cleared to ensure fresh start

**Header Visibility:**
- Header starts hidden by default for distraction-free experience
- Appears when mouse is within 40px of top edge
- Stays visible when URL bar is focused or hovering over header
- Smooth transitions with 250ms delay to prevent flickering

**Webview Initialization:**
- Webview loads with Google homepage by default
- Loading indicator shows during initial page load
- Navigation controls become functional once webview is ready
- URL bar updates automatically as webview navigates

## 7. Known Issues

- **Button Click Visuals**: The back, forward, and home buttons currently do not provide a visual "press" effect when clicked. The JavaScript and CSS for this are in place but are not functioning as expected. This needs further investigation.
- **Webview Security**: The webview is currently configured for development. For production use, additional security measures should be implemented including content security policies and sandboxing.