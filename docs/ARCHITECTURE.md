# Architecture
## Overview
The Prompt Engine application is component-driven, defined by the feature specifications located in docs/features/*.md. The architecture is centered around the Prompt Editor, with supporting features arranged around it to facilitate workflow.
## Visual Layout & Component Placement
The application interface is designed to focus user attention on the content creation process while keeping tools accessible.
1. Central Component: Prompt Editor (SPEC_PROMPT_EDITOR.md)

* Position: Centered horizontally in the middle of the screen.
* Role: This is the heart of the application; all other features are built around this focal point.
* Structure:

Top Section: Contains the h1 Title ("Prompt Engine"), Subtitle, and the Action Toolbar (Copy/Reset buttons). This section is distinct and sits above the main content.
Bottom Section (The Template): The editable area containing the prompt text, dynamic fields, and inputs.



2. Left Component: History (SPEC_HISTORY.md)

* Position: Located to the left of the Prompt Editor.
* Vertical Alignment: This is a specific visual constraint. The top edge of the History component must align with the Template (Bottom Section) of the Prompt Editor.

Note: The History component should not align with the very top of the Prompt Editor (Title/Subtitle/Toolbar). It effectively sits "beside" the textual content area, sharing the vertical space of the prompt template.



3. Trigger Component: Prompt Wizard (SPEC_PROMPT_WIZARD.md)

* Position: Located in the top right corner of the site/application.
* Role: Serves as a global entry point to start a new workflow via the Wizard modal.

## Visual Layout Schematic
+------------------------------------------------------+
|                                [Start Wizard Button] |
|                                                      |
|                         +-------------------------+  |
|                         | Title: Prompt Engine    |  |
|                         | Subtitle description    |  |
|                         | [Copy] [Reset]          |  |
|                         +-------------------------+  |
|  |-------------------|  |                         |  |
|  |    History        |  |                         |  |
|  |    (Top aligned   |  |     Prompt Editor       |  |
|  |     with this     |  |     Template Area       |  |
|  |     area)         |  |                         |  |
|  |                   |  |                         |  |
|  |                   |  |                         |  |
|  |                   |  |                         |  |
|  +-------------------+  +-------------------------+  |
+------------------------------------------------------+