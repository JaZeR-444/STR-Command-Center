# 09 Legal & Compliance - Directory Structure

**CRITICAL GOVERNANCE NOTE**

The `09_Legal_Compliance` folder intentionally utilizes a **hybrid directory structure**. This is a deliberate design choice distinct from the purely flat structures used in other execution sections.

## Why a Hybrid Structure?
- **Process vs. Data Separation:** Analytical process documents, strategy frameworks, and cross-system audits (`09A` through `09J`, `INS-*`, `HOA-*`, etc.) reside in the root directory. This provides immediate visibility into the section's legal readiness and completion state.
- **Domain-Segregated Trackers:** Legal and compliance trackers (CSV files) and actual legal agreements are segregated into numbered subfolders based on their regulatory domain. This supports strict regulatory documentation requirements, provides a clean audit trail, and prevents mixing dissimilar compliance schemas.

## Active Subfolders
1. **`01_Licenses_Permits/`**: Contains the active permit and license tracking CSV.
2. **`02_Insurance/`**: Contains the active insurance policy metadata tracking CSV.
3. **`03_Tax_Documents/`**: Contains the active tax registration and account tracking CSV.
4. **`04_Regulations_HOA/`**: Contains the active local regulations and HOA rules tracking CSV.
5. **`05_Policies_Contracts/`**: Contains the actual executed legal contracts, service agreements (cleaner/handyman), and guest damage claim procedures.

## The `.ARCHIVE` Folder
The `.ARCHIVE` directory and its nested subfolders are for **reference and historical context only**. 
- Do not promote archived content to the active root or active subfolders without full legal re-verification against official sources.

## Rule Enforcement
Any automated agent, script, or user interacting with this directory must respect this hybrid structure. Do not flatten the CSV trackers into the root directory, and do not move the root process documents into the subfolders.
