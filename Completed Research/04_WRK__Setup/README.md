# 04 Setup Execution - Directory Structure

**CRITICAL GOVERNANCE NOTE**

The `04_Setup_Execution` folder intentionally utilizes a **flat directory structure** for all active execution and tracking files. 

All primary deliverables (`04A` through `04I`, `PH-*` Phase Gates, `FIN-001`, `STG-001`, `TECH-001`, `SET-*`, etc.) must reside directly in the root of `C:\Rental Docs\Completed Research\04_Setup_Execution\`. 

## Why a Flat Structure?
- **Execution Phase Requirements:** Unlike Section 02 (Property Design) which acts as a permanent reference library, Section 04 contains active, time-sensitive trackers, matrices, and checklists for the 30-day setup sprint. A flat structure ensures immediate visibility and rapid cross-referencing.
- **Prompt Specifications:** The core prompts generating this section explicitly define the flat structure.

## The `.ARCHIVE` Folder
The nested subfolders present within the `.ARCHIVE` directory (e.g., `01_Prelaunch_Master_Plan`, `02_Site_Prep_and_Installations`, etc.) are for **reference and historical context only**. 
- **Do not move active files** into the `.ARCHIVE` subfolders in an attempt to "organize" the root directory. Doing so will break cross-references and tracking linkages.
- Checklist headers that use parenthetical notation (like "(02_Site_Prep_and_Installations)") are categorical tags corresponding to the checklist's organizational model, **not** physical path directives.

## Rule Enforcement
Any automated agent, script, or user interacting with this directory must respect the flat structure of the active deliverables to maintain the integrity of the project's setup and execution timeline.
