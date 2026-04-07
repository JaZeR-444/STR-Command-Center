# File Governance Prompt Pack

**Generated:** 2026-04-06  
**Version:** 1.0  
**Total Prompts:** 48 (12 scopes × 4 governance categories)  

## Purpose

This prompt pack provides a comprehensive set of **reusable, section-specific, category-specific governance prompts** for auditing, validating, and improving file governance across the Completed Research repository.

Each prompt is designed to be:
- **Copy-paste ready** for future Copilot CLI sessions
- **Standards-grounded** in authoritative governance documents
- **Section-tailored** to actual repository content
- **Safety-first** with approval-gated changes and non-destructive rules
- **Audit-focused** before implementation

## Structure

```
File_Governance_Prompt_Pack/
├── 00_Repository_Root/
│   ├── YAML_Front_Matter_Standard.md
│   ├── Naming_Convention_Standard.md
│   ├── Folder_Structure_Standard.md
│   └── Duplicate_File_Control_Policy.md
├── 01_Planning/
│   ├── YAML_Front_Matter_Standard.md
│   ├── Naming_Convention_Standard.md
│   ├── Folder_Structure_Standard.md
│   └── Duplicate_File_Control_Policy.md
├── 02_Property_Design/
│   └── ... (same 4 prompts)
├── 03_Furnishing_Procurement/
│   └── ... (same 4 prompts)
├── 04_Setup_Execution/
│   └── ... (same 4 prompts)
├── 05_Operations/
│   └── ... (same 4 prompts)
├── 06_Guest_Experience/
│   └── ... (same 4 prompts)
├── 07_Marketing_Listing/
│   └── ... (same 4 prompts)
├── 08_Pricing_Revenue/
│   └── ... (same 4 prompts)
├── 09_Legal_Compliance/
│   └── ... (same 4 prompts)
├── 10_Maintenance/
│   └── ... (same 4 prompts)
├── 11_Analytics_Performance/
│   └── ... (same 4 prompts)
├── README.md (this file)
├── INDEX.md
└── FILE_GOVERNANCE_PROMPT_PACK__2026-04-06.md (consolidated version)
```

## Governance Framework

### Reference Documents
- **Primary Standards:**
  - `Completed_Research_Duplicate_File_Control_Policy.md`
  - `Completed_Research_Folder_Structure_Blueprint.md`
  - `Completed_Research_Naming_Convention_Standard.md`
  - `Completed_Research_YAML_Front_Matter_Standard.md`
- **Supporting Prompts:** PROMPT-prefixed versions in `.PROMPTS/`

### Precedence Order (When Standards Conflict)
1. Folder Structure Blueprint (placement and section control)
2. Duplicate Control Policy (authority and overlap decisions)
3. Naming Convention (file naming patterns)
4. YAML Standard (metadata completeness)

### Document Consistency
The governance reference documents are mutually consistent with clear precedence rules defined. The PROMPT-prefixed versions serve as systematic review templates for the primary standards themselves.

## Repository Patterns Observed

During prompt generation, the following patterns were observed across the repository:
- Legacy letter-suffix run orders (`01A_`, `01B_`, etc.) are widespread
- Category-sequence codes (`OPS-001`, `INV-005`, `REV-001`) are actively used
- Archive folders use `.ARCHIVE/` pattern across all sections
- PDF exports exist alongside markdown sources in some sections
- Tracker files use CSV/XLSX formats with clear naming conventions

## Four Governance Categories

### 1. YAML Front Matter Standard
**Purpose:** Ensure markdown documents have appropriate, consistent, governance-compliant metadata.

**Key Focus:**
- Required fields: `id`, `title`, `section`, `doc_type`, `status`, `authority`, `updated`, `summary`
- Controlled vocabulary compliance
- Canonical vs. derivative file designation
- CSV/XLSX tracker exemptions

### 2. Naming Convention Standard
**Purpose:** Ensure files and folders use clear, consistent, maintainable naming patterns.

**Key Focus:**
- Section-code prefixes where appropriate
- Legacy pattern preservation (letter-suffix, category codes)
- Duplicate-risk naming detection
- Delimiter consistency
- Ambiguity reduction

### 3. Folder Structure Standard
**Purpose:** Ensure clear organization supporting discoverability, growth, and operational clarity.

**Key Focus:**
- Root control files (`README.md`, `INDEX.md`, `STATUS.md`, `FILE_REGISTER.md`, `ROADMAP.md`)
- Subfolder organization justified by section needs
- Archive separation (`.ARCHIVE/` or `98_Archive/`)
- Utility folder compatibility
- Intentional variance documentation

### 4. Duplicate File Control Policy
**Purpose:** Eliminate ambiguous overlaps while preserving valid duplicates (exports, archives, backups).

**Key Focus:**
- Source-of-truth designation
- Authority field usage (`canonical`, `backup`, `export_source`, `archived_reference`, etc.)
- PDF/markdown export relationships
- Version sprawl detection
- Dated snapshot vs. canonical master distinction

## Usage Instructions

### Recommended Execution Order Within Each Section
1. **YAML Front Matter Standard** – Establish metadata governance first
2. **Naming Convention Standard** – Normalize naming patterns
3. **Folder Structure Standard** – Organize physical structure
4. **Duplicate File Control Policy** – Resolve authority and overlap issues

### Execution Strategies

#### Strategy A: Section-by-Section (Recommended for Initial Pass)
Complete all 4 governance categories for one section before moving to the next.

**Benefits:**
- Deep section focus
- Comprehensive section governance
- Easier to track progress per section

**Example:**
1. Run all 4 prompts for `01_Planning`
2. Document findings in `95_Validation_Reports/Planning_Governance_Audit__2026-04-06.md`
3. Move to `02_Property_Design`

#### Strategy B: Category-by-Category (Recommended for Focused Improvements)
Execute one governance category across all 11 sections.

**Benefits:**
- Repository-wide consistency in one dimension
- Specialized focus (e.g., YAML-only pass)
- Easier for category-specific expertise

**Example:**
1. Run YAML prompts for all 11 sections
2. Document findings in `95_Validation_Reports/YAML_Governance_Audit__2026-04-06.md`
3. Move to Naming Convention prompts

#### Strategy C: Hybrid (Recommended for Iterative Improvement)
Mix approaches based on priority and availability.

**Example:**
- High-priority sections first (Operations, Legal Compliance, Guest Experience)
- Critical category first (Duplicate Control to establish authority)
- Remaining sections/categories in phases

### Output Documentation

For each prompt execution, document findings in `95_Validation_Reports/` with:
- Current-state assessment
- Compliance analysis
- Issue list (by severity)
- Strengths list
- Recommendations (prioritized)
- Safe implementation plan
- **Approval-gated change list** (explicit actions requiring approval)

### Safety Rules (Apply to All Prompts)

**Do Not Automatically:**
- Delete files
- Rename files
- Move files
- Overwrite content
- Archive materials
- Merge documents
- Fabricate metadata

**Always:**
- Distinguish observations from recommendations
- Preserve valid existing patterns
- Require explicit approval for changes
- Document justified variances
- Flag conflicts rather than silently resolve them

## Section-Specific Tailoring

Each section's prompts are tailored to its actual purpose and content:

| Section | Emphasis |
|---------|----------|
| **00_Repository_Root** | Root organization, utility folders, validation artifacts, cross-section documents |
| **01_Planning** | Master strategy docs, milestone tracking, budget control |
| **02_Property_Design** | Room-level specs, photo readiness, approval gates |
| **03_Furnishing_Procurement** | Inventory trackers, procurement logs, room-based organization |
| **04_Setup_Execution** | Phase gates, execution checklists, readiness audits |
| **05_Operations** | SOPs, turnover protocols, vendor management |
| **06_Guest_Experience** | Guest-facing content, amenities validation, hospitality standards |
| **07_Marketing_Listing** | Platform-specific copy, media assets, SEO implementation |
| **08_Pricing_Revenue** | Pricing models, revenue reports, financial tracking |
| **09_Legal_Compliance** | Formal naming, version traceability, compliance records |
| **10_Maintenance** | Recurring schedules, service logs, asset lifecycle |
| **11_Analytics_Performance** | KPI definitions, performance metrics, review analysis |

## Version History

### Version 1.0 (2026-04-06)
- Initial prompt pack generation
- 48 total prompts created (12 scopes × 4 categories)
- Includes repository root governance prompts
- Based on observed repository state as of 2026-04-06
- Grounded in current governance standards

## Maintenance

### When to Update This Pack
- Governance standards are revised
- New sections are added to repository
- New governance categories are introduced
- Major structural changes occur

### How to Update
1. Review actual repository state
2. Review current governance standards
3. Regenerate prompts using updated context
4. Preserve previous version in `.PROMPTS/Legacy_v1_Prompts/`
5. Update version number and change log

## Related Documents

- **Consolidated Pack:** `FILE_GOVERNANCE_PROMPT_PACK__2026-04-06.md`
- **Index:** `INDEX.md`
- **Governance Standards:** `.PROMPTS/` directory
- **Validation Reports:** `95_Validation_Reports/` (when created)

## Quick Start

1. **Choose a section** (e.g., `01_Planning`)
2. **Open first prompt** (`YAML_Front_Matter_Standard.md`)
3. **Copy prompt text** into Copilot CLI
4. **Execute and document findings**
5. **Repeat for remaining categories**
6. **Store results** in `95_Validation_Reports/`

## Support

For questions about:
- **Prompt usage:** See `INDEX.md` for detailed prompt catalog
- **Governance standards:** See reference documents in `.PROMPTS/`
- **Repository structure:** See `Completed_Research_Folder_Structure_Blueprint.md`

---

**Generated by:** GitHub Copilot CLI  
**Date:** 2026-04-06  
**Repository:** Completed Research  
**Owner:** Jay Thomas
