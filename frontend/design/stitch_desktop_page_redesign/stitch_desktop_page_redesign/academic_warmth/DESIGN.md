---
name: Academic Warmth
colors:
  surface: '#fdf9ee'
  surface-dim: '#dddacf'
  surface-bright: '#fdf9ee'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3e8'
  surface-container: '#f2eee3'
  surface-container-high: '#ece8dd'
  surface-container-highest: '#e6e2d8'
  on-surface: '#1c1c15'
  on-surface-variant: '#404944'
  inverse-surface: '#313129'
  inverse-on-surface: '#f4f1e6'
  outline: '#707974'
  outline-variant: '#bfc9c3'
  surface-tint: '#286956'
  primary: '#004635'
  on-primary: '#ffffff'
  primary-container: '#1b5e4b'
  on-primary-container: '#94d5bd'
  inverse-primary: '#93d4bb'
  secondary: '#a73a00'
  on-secondary: '#ffffff'
  secondary-container: '#ff7940'
  on-secondary-container: '#662000'
  tertiary: '#622d26'
  on-tertiary: '#ffffff'
  tertiary-container: '#7e433b'
  on-tertiary-container: '#ffb6ac'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#aef0d7'
  primary-fixed-dim: '#93d4bb'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#05513f'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb599'
  on-secondary-fixed: '#370e00'
  on-secondary-fixed-variant: '#7f2b00'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4a9'
  on-tertiary-fixed: '#380c08'
  on-tertiary-fixed-variant: '#6e372f'
  background: '#fdf9ee'
  on-background: '#1c1c15'
  surface-variant: '#e6e2d8'
typography:
  display-lg:
    fontFamily: Literata
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Literata
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Literata
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Literata
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-lg: 40px
  stack-md: 24px
  stack-sm: 12px
---

## Brand & Style
The design system is built on the intersection of **Classical Academic** and **Modern Softness**. It aims to evoke the feeling of a well-lit library or a high-end physical notebook—trustworthy, focused, and scholarly, yet entirely accessible to a contemporary learner. 

The aesthetic leverages **Minimalism** with a **Tactile** edge. Instead of cold, digital whites, it utilizes organic, paper-like tones and rich, botanical accents. The emotional response is one of "calm rigor"—encouraging deep focus without the sterile pressure of traditional educational software. It prioritizes clarity through generous whitespace and a sophisticated typographic hierarchy.

## Colors
The palette is rooted in a heritage-inspired spectrum. 
- **Primary (#1B5E4B):** A deep Forest Green used for high-emphasis containers, primary actions, and brand identification. It represents growth and institutional stability.
- **Secondary (#D95D26):** A burnt Terracotta used sparingly for "Practice" actions and motivational highlights, providing a warm contrast to the green.
- **Background (#F8F4E9):** A warm, creamy parchment tone that reduces eye strain during long reading sessions compared to pure white.
- **Surface Tints:** Use lower-opacity versions of the primary green (10-15%) for subtle grouping containers and progress tracks to maintain a cohesive monochromatic depth.

## Typography
The typographic strategy uses a "Serif-for-Structure" approach. **Literata** provides a literary, authoritative voice for all headlines and brand moments, ensuring the "academic" promise is met. 

For functional interface elements, data, and long-form instructional text, **Hanken Grotesk** is used. Its clean, contemporary grotesque letterforms ensure high legibility and a modern "app" feel that balances the traditionalism of the serif. Use wide line-heights (1.5x+) for body text to facilitate easy reading and translation exercises.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for desktop to maintain a "book-like" reading column that doesn't become over-extended on wide monitors.

- **Desktop:** A centered 12-column grid with a 1200px max-width. Margins are generous (64px+) to create a focused "island" of content.
- **Vertical Rhythm:** A strict 8px baseline grid is used. Sections are separated by large "stack-lg" (40px) gaps to prevent cognitive overload.
- **Mobile:** Reflows to a single column with 20px side margins. Navigation moves from a potential top/side bar to a persistent bottom tab bar for thumb-reachability.

## Elevation & Depth
This design system avoids heavy shadows, favoring **Tonal Layers** and **Low-Contrast Outlines** to communicate hierarchy.

- **Level 0 (Base):** The primary parchment background (#F8F4E9).
- **Level 1 (Cards):** White (#FFFFFF) surfaces with a very thin, soft border (1px, 10% opacity of the primary green).
- **Interactive Depth:** When a card or list item is hovered, it does not lift with a shadow; instead, its border weight increases or its background shifts to a very subtle green tint.
- **Modals:** Use a heavy backdrop blur (12px+) with a 20% opacity dark overlay to maintain the "glass" focus on the learning task at hand.

## Shapes
The shape language is **Rounded**, reflecting the "friendly" and "approachable" nature of the brand. 

Standard components (Cards, Input Fields) use a 0.5rem (8px) radius. Larger feature blocks, like the "Today's Challenge" hero, use `rounded-xl` (1.5rem / 24px) to create a soft, inviting frame. Buttons follow the `rounded-lg` (1rem / 16px) convention, ensuring they feel "clickable" and distinct from the sharper edges of academic text.

## Components
- **Buttons:** Primary buttons are solid Forest Green with white text. Secondary "Practice" buttons use the Terracotta. Text inside buttons should be Hanken Grotesk Medium for maximum clarity.
- **Cards:** White backgrounds with internal padding of 24px. Progress bars within cards should be thin (4px) and use the Primary green for the "filled" state and a 10% green for the "track."
- **Progress Chips:** Small, pill-shaped indicators with a light tint background and dark text (e.g., "0/5" or "Intermediate").
- **Input Fields:** Minimalist design with a bottom-border only or a very light 1px stroke. Focus states should transform the border to the Primary Green.
- **Navigation:** Bottom bar on mobile uses thin-line icons with Literata labels for the active state to reinforce the brand's serif identity.
- **Lesson Blocks:** Use a "Mastery" container style—a large, rounded-xl block with the Primary color as the background and white Literata headings for high-impact focus.