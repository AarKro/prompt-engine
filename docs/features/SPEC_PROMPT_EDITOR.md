# Feature Specification: Prompt Editor
## Overview
The Prompt Editor is the main interactive component of the application. It serves as a visually distinct, large-type interface where users can populate prompt templates. The design is inspired by the "Spotify Lyrics" page—clean, centered, and typography-focused—ensuring high readability and a clear separation between static context and user input. The editor features smart clipboard functionality that intelligently compiles the final prompt based on user activity.

## User Interface (UI) & Layout
### Header Section

* Title: An h1 header displaying "Prompt Engine".
* Subtitle: A brief, sentence-like subtitle immediately below the title explaining the current action (e.g., "Select a use case and fill in the details to generate your prompt.").
* Action Bar: Located below the subtitle and above the editor area. Contains two buttons positioned side-by-side:

Copy Button: Triggers the copy action (copies the compiled prompt to clipboard).
Reset Button: Clears all user inputs and reverts dynamic fields to their placeholder state.



### Editor Area

* Visual Style: The layout should mimic the "Spotify Lyrics" aesthetic.

Typography: Large font size for maximum readability.
Alignment: Centered text alignment for a focused reading experience.


* Content Structure: The editor renders a prompt template composed of:

Fixed Parts: Non-editable text segments that provide context or instructions. These should be visually distinct but subtle (e.g., lower opacity or neutral color).
Dynamic Parts: Editable input fields embedded directly within the text flow.


* Contrast & Indication: There must be a noticeable visual contrast between fixed and dynamic parts to easily identify what needs to be filled out.

Example: Dynamic fields could have a subtle background highlight, an underline, or a border that changes color upon focus/editing to indicate completion status.


* Placeholders: All dynamic fields must contain descriptive placeholder text to guide the user on what information is required (e.g., "[Enter product name here]").

## Functional Requirements
1. Dynamic Input Handling

* Users should be able to click into dynamic parts and type freely.
* The focus when loading into the website is automatically put on the first input field so the user can immediatly start typing.
* By using the Tab key the user can navigate freely between the possible input fields of the prompt template.
* The editor must track which sections or dynamic fields have been modified by the user.

2. Smart Copy Logic
The "Copy" feature (both via button and keyboard shortcut) must compile the final string based on logic:

* Trigger:

Clicking the "Copy" button.
Pressing Command + C (Mac) or Ctrl + C (Windows/Linux) when the editor or page is active.


* Compilation Logic:

The prompt template is divided into logical sections.
The system must check the status of the dynamic fields within each section.
Inclusion Rule: If a user has edited a dynamic field within a section, the entire section (both fixed parts and the filled dynamic parts) is included in the copied text.
Omission Rule: If a section contains dynamic fields that the user has not edited (i.e., they still contain placeholder text or are empty), that specific section is omitted entirely from the clipboard output.


* Feedback: Upon successful copying, a visual indicator (e.g., toast notification or button text change) should confirm the action.

3. Reset Functionality

* Clicking the "Reset" button clears all user input from dynamic fields.
* All dynamic fields revert to their default placeholder text.
* The state of the editor returns to "unmodified".

## Baseline

As a basline template use the following ""Erstelle [Output] für [Zielgruppe] im Kontext von [Situation], mit Fokus auf [Kernziel], in einem [Stil], sodass [konkrete Nutzung] möglich ist." 
