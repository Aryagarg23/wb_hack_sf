# Pastel Neumorphic UI Framework for LLM Generation
Objective: This document provides the technical framework and stylistic guidelines for a Large Language Model (LLM) to generate code for Pastel Neumorphic user interfaces. Adherence to these rules is mandatory for ensuring visual consistency, maintainability, and accessibility.

## 1.0 Core Directives
The generated UI must adhere to the following core principles:

**1.1 Tactile Realism:** All UI components must be rendered to feel tangible. Elements are defined exclusively by light and shadow, not borders or harsh color contrasts.

**1.2 Visual Cohesion:** The entire interface must be rendered as a single, continuous surface. All components are part of the background material, either extruded (pushed out) or inset (pressed in). Do not generate code for layered or "floating" elements.

**1.3 Subtle Definition:** Neumorphism is achieved through subtlety. Shadows and highlights must be soft and diffuse to create a gentle sense of depth.

**1.4 Pastel Minimalism:** A pastel monochromatic color scheme is mandatory. Information and hierarchy are conveyed through shape, size, and depth, not a wide palette.

## 2.0 CSS Architecture Specification
The LLM must structure the generated CSS according to the following hybrid model:

**2.1 ITCSS (Inverted Triangle CSS):** Organize all generated style files according to the ITCSS layers. This ensures predictability and scalability.

**2.2 BEM (Block, Element, Modifier):** Use BEM for all CSS class naming to create a clear, readable relationship between the generated HTML and its styles.

### Required File Structure
```
/src
|-- /styles
|   |-- 01-settings
|   |   |-- _colors.css
|   |   |-- _typography.css
|   |   |-- _spacing.css
|   |   |-- _shadows.css
|   |-- 02-tools
|   |   |-- _mixins.css
|   |-- 03-generic
|   |   |-- _reset.css
|   |-- 04-elements
|   |   |-- _base.css
|   |-- 05-objects
|   |   |-- _layout.css
|   |-- 06-components
|   |   |-- _button.css
|   |-- 07-utilities
|   |   |-- _helpers.css
```

## 3.0 Naming Convention Rules
Strictly adhere to the BEM (Block, Element, Modifier) naming convention.

- **Block:** A standalone entity (e.g., `.form-card`, `.user-profile`).
- **Element:** A part of a block, delimited by two underscores (e.g., `.form-card__input`, `.user-profile__avatar`).
- **Modifier:** A variation of a block or element, delimited by two hyphens (e.g., `.button--pressed`, `.form-card--flat`).

## 4.0 Design Token Specification
All visual styles must be derived from these CSS Custom Properties (Design Tokens).

### 4.1 Color Tokens
The color palette is derived from a single pastel base color to maintain the single-material aesthetic.
```css
:root {
  /* Base Pastel Material (Soft Lavender) */
  --color-base: #f2f2f8;

  /* Shadow & Highlight Colors (derived from base) */
  --color-light-shadow: #ffffff;
  --color-dark-shadow: #d0d0d8;

  /* Text Colors */
  --color-text-primary: #5b5b6e;
  --color-text-secondary: #9a9aaf;
  
  /* Accent Color (for interactive states or highlights) */
  --color-accent: #8e82ff;
}
```

### 4.2 Shadow Tokens
The dual-shadow system is the cornerstone of Neumorphism. Generate shadows using these variables exclusively.
```css
:root {
  --shadow-distance: 5px;
  --shadow-blur: 15px;

  /* Default, extruded shadow */
  --shadow-neumorphic: 
    var(--shadow-distance) var(--shadow-distance) var(--shadow-blur) var(--color-dark-shadow),
    calc(var(--shadow-distance) * -1) calc(var(--shadow-distance) * -1) var(--shadow-blur) var(--color-light-shadow);

  /* Inset shadow for pressed state */
  --shadow-neumorphic-inset: 
    inset var(--shadow-distance) var(--shadow-distance) var(--shadow-blur) var(--color-dark-shadow),
    inset calc(var(--shadow-distance) * -1) calc(var(--shadow-distance) * -1) var(--shadow-blur) var(--color-light-shadow);
}
```

### 4.3 Typography & Spacing Tokens
Use these tokens for all text and layout spacing to ensure consistency.
```css
:root {
  --font-family-primary: 'Inter', 'Segoe UI', sans-serif;
  --font-size-base: 1rem;   /* 16px */
  --font-weight-regular: 400;
  --font-weight-bold: 600;
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
}
```

## 5.0 Component Generation Example: Button
This Button component is the canonical example for generating Neumorphic components using HTML and BEM.

**HTML:**
```html
<button class="button">
  <span class="button__text">Generate</span>
</button>
```

**CSS (`_button.css`):**
```css
.button {
  background-color: var(--color-base);
  color: var(--color-text-secondary);
  border: none;
  border-radius: 20px;
  padding: var(--space-4) var(--space-5);
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  
  /* Apply the default extruded shadow */
  box-shadow: var(--shadow-neumorphic);
  
  /* Smooth transition for the press effect */
  transition: box-shadow 0.15s ease-in-out, color 0.15s ease-in-out;
}

.button:hover {
  color: var(--color-accent);
}

.button:active {
  /* On press, switch to the inset shadow */
  box-shadow: var(--shadow-neumorphic-inset);
  color: var(--color-accent);
}

.button:focus-visible {
  outline: none;
  /* Add a subtle ring for accessibility */
  box-shadow: 0 0 0 2px var(--color-base), 0 0 0 4px var(--color-accent);
}

.button__text {
  /* BEM element for the text if needed for specific styling */
}
```

## 6.0 Implementation Mandates & Constraints
**6.1 Accessibility is Non-Negotiable:** The low-contrast nature of this style requires strict adherence to accessibility rules.

- **Mandate:** All generated text and icon colors must be tested to ensure a WCAG AA contrast ratio of at least 4.5:1 against the base color.
- **Mandate:** Use icons in combination with text labels to improve affordance.
- **Mandate:** All interactive elements must have a clear, visible `:focus-visible` state that does not rely solely on Neumorphic shadows. The example in section 5.0 is the required implementation.

**6.2 Use Sparingly:** Not every element must be extruded. Generate code using flat or inset styles for secondary elements to create visual hierarchy.

**6.3 Animate with Care:** All transitions must be quick and subtle (e.g., 0.15s ease-in-out) to mimic an immediate physical response.
