# Design Style Guide
## Visual Direction
The design language of the Prompt Engine is Modern, Typographic, and Minimalist. The primary inspiration is the "Spotify Lyrics" view: focused, immersive, and centered around large, readable typography. The interface should feel like a "focus mode" tool—stripping away distractions to let the content shine.
Dark mode is the default aesthetic to reduce eye strain and provide high contrast for the text.

## Color Palette
### Backgrounds

* Global Background (bg-app): Deep Black (#000000 or #121212).
* Surface Background (bg-surface): Dark Gray (#181818 or #1E1E1E). Used for the editor container, history sidebar, and modal backdrops.
* Input Field Background (bg-input): A lighter shade than the surface to distinguish editable areas (#2A2A2A or #333333 with transparency).

### Typography

* Primary Text (text-main): Off-White (#FFFFFF) for maximum readability on dark backgrounds.
* Secondary Text (text-muted): Light Gray (#B3B3B3) for fixed parts of the prompt template, subtitles, and metadata.
* Accent Text (text-accent): Used sparingly for highlights or emphasis (#1DB954 - Spotify Green, or a custom vibrant color).

### Interactive Elements

* Primary Action Color (color-primary): Vibrant Green (#1DB954). Used for the "Copy" button and "Start Wizard" button.
* Secondary Action/Destructive (color-secondary): Subtle Gray or a soft Red for "Reset" or "Close" actions.
* Hover States: Slightly lighten the background color or increase brightness.
* Focus States: A crisp, white or green outline (border-width: 2px) to indicate keyboard navigation.


## Typography

* Font Family: System sans-serif stack (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif). This ensures fast loading and native feel.
* Base Size: 16px (1rem).

### Hierarchy

* H1 Title ("Prompt Engine"): 3rem (48px), Bold Weight (700).
* Subtitle: 1.125rem (18px), Regular Weight (400), text-muted color.
* Editor Text (The Prompt): 1.5rem (24px) to 2rem (32px). Large and spaced out (line-height: 1.5).

Fixed Parts: Lower opacity (0.6) or text-muted.
Dynamic Parts: Full opacity (text-main) with contrasting background.


* Wizard Questions: 1.25rem (20px), Medium Weight (500).
* History Items: 1rem (16px), Regular Weight.


## Components & Styling Details
1. Prompt Editor Container

* Layout: Centered column.
* Style: Card-like appearance with bg-surface and substantial rounded corners (border-radius: 16px). Soft drop shadow (box-shadow) to lift it from the global background.
* Dynamic Fields:

Design must ensure "noticeable contrast".
Implementation Idea: Fixed text is opaque; editable fields have a bg-input (e.g., #333333) with a border that highlights on focus.
Placeholder text: Italicized, text-muted.



2. History Sidebar

* Container: Transparent or matching bg-app.
* Items:

Background: bg-surface (slightly lighter than app bg).
Border: Subtle border (1px solid #333) separating items.
Hover: Shift to bg-input.
Counter Bubble: Small circle, color-primary background, white text, centered text.



3. Buttons

* Shape: Pill-shaped (fully rounded ends) or rounded rectangles (border-radius: 50px or 8px).
* Copy Button: bg-color-primary, bold white text.
* Reset Button: Ghost button (transparent background, text-muted border) or subtle outline.
* Padding: Generous padding (12px 24px) to accommodate easy clicking.

4. Wizard Modal

* Backdrop: bg-app with opacity: 0.9 or backdrop-filter: blur(10px).
* Content Box: Centered, bg-surface, heavy shadow, rounded corners.
* Selection Options: Displayed as clickable cards or large buttons. Hover effects should feel responsive.


## Spacing & Layout

* Consistency: Use a 4px grid system for spacing (multiples of 4, 8, 16, 32px).
* Whitespace: generous whitespace is crucial to achieve the "Spotify" clean look. Do not crowd elements.
* Editor Alignment:

As per ARCHITECTURE.md, theHistory list top edge aligns with the Template part of the Editor, not the Title. Use CSS Flexbox align-items or Grid positioning to achieve this offset.




## Animation & Micro-interactions

* Transitions: Smooth transitions (transition: all 0.2s ease) on hover states, background colors, and focus rings.
* Loading (Optional): If calculation takes time, a subtle pulse animation on the active element.