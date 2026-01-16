# Feature Specification: Prompt Wizard
## Overview
The Prompt Wizard is an onboarding guidance feature designed to help users select the optimal prompt template for their specific needs. By asking a series of simple, multiple-choice questions, the wizard narrows down the available templates and selects the one that best fits the user's described use case. This eliminates the need for users to manually construct or search for appropriate prompt structures.
## User Interface (UI) & Layout
### Entry Point

* Trigger Button: A distinct button (e.g., labeled "Start Wizard" or "New Prompt") is placed in the main interface (e.g., in the header or action bar).

### Wizard Modal

* Visibility: Upon clicking the trigger, a modal overlay appears, covering the entire page.
* Layout: centered within the modal, focusing on one question at a time.
* Close Mechanism: A clear "X" icon or button located in the top-right corner of the modal, allowing the user to abort the process at any time.
* Interaction Design:

The wizard presents questions one by one (linear flow).
Answers are provided by selecting predefined options (e.g., radio buttons, selectable cards, or a list).
The interface should minimize typing to ensure speed; all interactions are click-based.



## Functional Requirements
1. Questionnaire Logic

* The wizard poses a series of simple, quick-to-answer questions related to the intended task (e.g., "What is the goal of your prompt?", "Who is the target audience?").
* The user selects an answer from the provided options.

2. Template Matching

* The system maintains a mapping of logic that correlates user answers to specific prompt templates.
* Once the user completes the final question, the system evaluates the cumulative answers to identify the single best-fitting prompt template.

3. Completion & State Transition

* Auto-Close: The modal closes automatically immediately after the user answers the final question.
* Template Loading: The selected template is loaded into the Prompt Editor (as defined in SPEC_PROMPT_EDITOR.md).
* Data Handling (Overwrite):

The new template completely replaces the previously active template in the editor.
Any content or user inputs that existed in the previous template (before starting the wizard) are discarded. The editor resets to the state of the newly selected template with empty dynamic fields.



4. Cancellation

* If the user clicks the "X" button to close the modal manually:

The wizard closes.
No changes are made to the Prompt Editor. The previous template and its content remain intact.