---
id: 00-REPO-README
title: Completed Research Repository README
section: 00_System
doc_type: readme
status: active
authority: canonical
version: 1.0
updated: 2026-04-06
summary: Repository entry point and navigation guide for Completed Research. Defines core repository rules, archive system, workflow standards, and file naming conventions.
---

# 7513 Ballydawn STR - Completed Research Repository

## Purpose
This repository is the active research and documentation workspace for the 7513 Ballydawn short-term rental project.

Its purpose is to support the creation of new, accurate, up-to-date, decision-ready documents across all research categories required to prepare, launch, and operate the property as a short-term rental.

This folder is not intended to preserve rough drafts as active working files. It is intended to produce finalized, current documentation built from verified research, current requirements, and real-world data.

---

## Core Repository Rule
The active category folders are the source of all current project documentation.

Any document created for actual use, planning, execution, purchasing, compliance, setup, operations, or launch readiness must be created in the appropriate active parent folder.

Archived documents are never to be treated as current working documents. This repository must always distinguish between historical reference material and current authoritative deliverables.

Generated active documents must follow the repository’s structured naming convention. When created from prompt-pack files, the final document name must preserve the prompt file’s identifier and core title while removing prompt-only suffixes.

---

## Canonical Repository Rules
These rules are authoritative across this repository and must be interpreted the same way in all contexts.

1. Active section folders contain the current working and final authoritative documents.
2. `.ARCHIVE` folders are reference-only and must never be treated as the current source of truth.
3. Archived files may be consulted for context, but final deliverables must be created or updated in the active parent section.
4. When a prompt-pack file is used, the final deliverable name must preserve the prompt file’s identifier and core title while removing prompt-only suffixes.
5. If an active document already exists for the same purpose, update that document instead of creating a duplicate.
6. Create a new active file only when the deliverable is materially different in purpose or scope.
7. Do not move, promote, or relabel archived files as active deliverables.
8. All active deliverables must be current, verified, clearly structured, and usable for real project execution.

---

## The `.ARCHIVE` System
Each major category folder may contain a `.ARCHIVE` subfolder that stores older, preliminary, or temporary documentation created earlier in the project.

These archived files exist only for reference.

### `.ARCHIVE` Rules
1. **Reference only**
   - Files inside `.ARCHIVE` may be reviewed to understand previous ideas, draft structures, incomplete research, or earlier assumptions.
   - They may help guide the scope, outline, or formatting of a new document.
   - They must not be treated as final, current, or authoritative.

2. **Do not move archive documents into active use**
   - Nothing from `.ARCHIVE` should be moved out, promoted, renamed into active use, or reused as if it were the final deliverable.

3. **Do not directly edit archive documents as the final solution**
   - Archive documents should remain preserved as historical reference points.
   - If a topic already exists in `.ARCHIVE`, that archived file may be consulted, but the correct action is to create a new updated document in the active parent folder.

4. **Always create a new current-version document**
   - When a prompt or task covers a topic that already has a similar archived document, the archive may be used only as background context.
   - The actual output must be a newly created or properly updated active document containing verified, current, relevant information.

5. **Archive content may be incomplete, outdated, or inaccurate**
   - Archived files may contain placeholder ideas, early-stage assumptions, old pricing, obsolete rules, or unverified research.
   - They are useful for orientation only.

---

## Required Workflow
The standard workflow for this repository is:

**Reference -> Research -> Verify -> Create Current Document**

### Workflow Meaning
- **Reference** archived material only when useful for context
- **Research** the topic using current and relevant information
- **Verify** facts, dimensions, regulations, pricing, requirements, and operational assumptions
- **Create** a current active document in the appropriate main section folder

This repository should never rely on archived documentation as the final answer.

---

## Prompt Execution Rules
Any prompt run against this repository must follow the rules below.

### 1. Check for existing context first
Before creating a new document, review:
- the active folder for any current related document
- the corresponding `.ARCHIVE` folder for historical reference only
- any relevant repository instructions such as `GEMINI.md`, section checklists, or prompt pack guidance

### 2. Use `.ARCHIVE` for reference only
If a similar document exists inside `.ARCHIVE`:
- review it only to understand prior scope, structure, ideas, placeholders, or incomplete research
- do not copy it forward as if it were complete
- do not treat it as the final source of truth
- do not move it out of `.ARCHIVE`
- do not overwrite its historical function

### 3. Create or update only in the active section
If the task is to produce a usable document, the output must exist in the active parent section folder.

Examples:
- `01_Planning/`
- `02_Property_Design/`
- `08_Pricing_Revenue/`
- `09_Legal_Compliance/`

No final deliverable should live only inside `.ARCHIVE`.

### 4. Prefer current active documents over creating duplicates
If a current active document already exists for the same purpose:
- update or expand the active document when appropriate
- create a new document only when a separate deliverable is clearly justified
- avoid producing near-duplicate files with overlapping scope

### 5. Replace outdated assumptions with verified facts
Do not preserve placeholder information just because it already exists in an archive document.

All new active deliverables should replace:
- unverified assumptions
- placeholder notes
- outdated pricing
- obsolete regulations
- rough brainstorming language
- incomplete planning logic

### 6. Keep archive and active roles separate
The archive explains what was previously started.  
The active folder contains what is currently usable.

These two roles must remain separate at all times.

### 7. Produce decision-ready outputs
Every generated document should aim to be:
- current
- accurate
- verified
- clearly structured
- practical for execution
- useful for real project decisions

### 8. Preserve factual integrity
Whenever a topic depends on factual details, the prompt must verify and use the most current reliable information available.

This includes, where relevant:
- local Austin and Texas regulations
- permit and compliance requirements
- property dimensions and layout facts
- current pricing and market data
- furnishing costs and vendor availability
- operational requirements for launch readiness

### 9. Do not treat older wording as mandatory
Archived documents may suggest a useful purpose, but their wording, sections, and conclusions do not need to be preserved.

The goal is not to recreate the old draft.  
The goal is to create the best current version of the document.

### 10. Final outputs must match the real purpose of the section
Each active document should belong to the section whose purpose it actually serves.

Do not allow one section to become a catch-all for material that belongs elsewhere.

### 11. Follow prompt-pack naming exactly
If a task is generated from a prompt pack file, use the prompt filename as the basis for the final deliverable name.

Keep:
- the identifier prefix
- the core deliverable title

Remove:
- prompt-only instruction suffixes

This ensures prompt files, indexes, generated documents, and task tracking remain aligned.

---

## File Naming and Supersession Rules
All active files must follow clear naming, identifier, and authority rules so the repository remains clean, traceable, and easy to maintain.

### 1. Use structured document IDs at the beginning of filenames
Active documents should use a structured identifier prefix when applicable.

Preferred format:  
`[CODE]-[NUMBER]_[Document_Name].md`

Examples:
- `TIM-001_Design_and_Theme_Lock.md`
- `BUD-001_Variance_Compliance.md`
- `LEG-001_Permits_and_Licenses.md`
- `OPS-001_Turnover_Workflow.md`

These identifiers help preserve:
- ordering
- traceability
- prompt-to-document alignment
- section clarity
- stable references inside indexes and checklists

### 2. Prompt filenames are the naming source for generated documents
When a document is generated from a prompt file, the generated document name should inherit the core name of the prompt file.

The prompt filename should be treated as the source naming template for the deliverable.

Examples:
- Prompt file: `BUD-001_Variance_Compliance_Execution_Prompt.md`
- Generated document: `BUD-001_Variance_Compliance.md`

- Prompt file: `TIM-001_Design_and_Theme_Lock_Execution_Prompt.md`
- Generated document: `TIM-001_Design_and_Theme_Lock.md`

### 3. Remove prompt-only suffixes from final deliverables
Prompt instruction suffixes should not appear in the final active document filename.

Remove suffixes such as:
- `_Execution_Prompt`
- `_Artifact_Generation_Prompt`
- `_Task_Completion_Prompt`
- `_Prompt`
- other prompt-control labels that describe the instruction file rather than the deliverable itself

The final document should keep only the core identifier and document purpose.

### 4. Preserve the identifier when updating an existing active document
If the document already exists in active form and the purpose remains the same:
- keep the same structured ID
- keep the same filename
- update the contents rather than generating a renamed duplicate

Example:
- update `TIM-001_Design_and_Theme_Lock.md`
- do not create `TIM-001_Design_and_Theme_Lock_v2.md`
- do not create `TIM-001_Design_and_Theme_Lock_Updated.md`

### 5. Create a new identifier only when the deliverable is meaningfully different
A new ID should be created only when the new file is actually a separate deliverable with distinct scope or purpose.

Use a new identifier when:
- the document serves a different operational purpose
- the document is a new standalone artifact
- the document belongs as a separate indexed deliverable in the section

Do not create a new identifier merely because:
- the file was improved
- more research was added
- facts were updated
- formatting was cleaned up

### 6. One deliverable should have one authoritative active filename
Each deliverable should have one primary active file that serves as the authoritative working document.

The identifier and filename should remain stable over time unless the scope itself changes.

This prevents confusion across:
- section indexes
- prompt packs
- completion checklists
- internal references
- future update passes

### 7. Avoid unstable naming language
Do not use vague or unstable naming such as:
- `new`
- `updated`
- `final`
- `final-final`
- `revised`
- `notes`
- `draft rewrite`
- `v2`
- `v3`

These labels weaken traceability and make it harder to know which document is authoritative.

### 8. Match filename structure to section logic
Identifiers should align with the section’s naming system where applicable.

Examples:
- `TIM` for timeline or milestone-related planning artifacts
- `BUD` for budget and financial control artifacts
- `LEG` for legal/compliance artifacts
- `OPS` for operations artifacts
- `GEX` for guest experience artifacts
- `MRK` for marketing/listing artifacts
- `PRC` for pricing/revenue artifacts

If a section already has an established code pattern in the prompt pack, follow that pattern consistently.

### 9. Section indexes must reference the final active filename
Whenever a section index, checklist, tracker, or command-center file references a document, it should reference the final active deliverable name, not the prompt file name.

Example:
- reference `BUD-001_Variance_Compliance.md`
- not `BUD-001_Variance_Compliance_Execution_Prompt.md`

### 10. Default rule
If a prompt file already defines the document’s identifier and core title, use that structure for the generated file and remove only the prompt-control suffix.

Formula:  
`Prompt File Name - Prompt Suffix = Final Deliverable Name`

---

## Document Creation Standard
When working in this repository:
- create documents that reflect current and verified information
- place final working documents in the correct active category folder
- use archived materials only to understand what had previously been started
- replace outdated assumptions with confirmed facts
- produce documents that are practical, decision-ready, and usable for execution

If an archived document and an active document cover the same topic, the active document is the one intended for real project use.

---

## What This Repository Is For
This repository is intended to support:
- new research that has not yet been completed
- replacement of temporary or preliminary drafts with current validated documentation
- structured buildout of all major short-term rental planning and operating categories
- creation of clean, usable deliverables for launch preparation and ongoing management

---

## What This Repository Is Not For
This repository is not intended to:
- reuse archived drafts as final documents
- treat historical notes as authoritative
- move old files out of `.ARCHIVE` for active use
- preserve outdated assumptions in current deliverables
- blur the distinction between reference material and active documentation

---

## Directory Index

### 01_Planning
Strategic planning, project coordination, budgeting, timelines, milestone tracking, and launch preparation.

### 02_Property_Design
Room layouts, design direction, measurements, visual planning, spatial strategy, and property presentation decisions.

### 03_Furnishing_Procurement
Furniture, decor, fixtures, sourcing, purchasing research, inventory planning, and procurement tracking.

### 04_Setup_Execution
Implementation planning, installation sequencing, property setup steps, smart home setup, and launch-prep execution tasks.

### 05_Operations
Standard operating procedures, cleaning workflows, vendor coordination, turnover systems, and ongoing management processes.

### 06_Guest_Experience
Guest-facing experience planning, amenities, welcome materials, guidebooks, comfort strategy, and hospitality systems.

### 07_Marketing_Listing
Listing copy, platform positioning, photo planning, merchandising strategy, SEO considerations, and listing presentation.

### 08_Pricing_Revenue
Revenue strategy, comp analysis, dynamic pricing, demand triggers, profitability planning, and pricing documentation.

### 09_Legal_Compliance
Permits, licensing, insurance, local rules, policy requirements, risk management, and compliance documentation.

### 10_Maintenance
Preventative maintenance planning, issue tracking, upkeep schedules, repair management, and property care systems.

### 11_Analytics_Performance
KPIs, revenue tracking, occupancy analysis, guest feedback analysis, operational performance review, and optimization reporting.

---

## Expected Output Standard
All active documents created in this repository should be:
- current
- accurate
- verified
- clearly organized
- useful for real decision-making
- suitable for direct execution

The end goal is a complete, current, trustworthy research and operations library for the 7513 Ballydawn STR project.

---

*Last Updated: 2026-04-04*