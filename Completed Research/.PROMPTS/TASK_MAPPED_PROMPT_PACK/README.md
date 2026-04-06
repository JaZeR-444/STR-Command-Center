# Task-Mapped Prompt Pack

This pack is generated directly from:
1. C:\Rental Docs\Master STR Checklists\*_Master_Checklist.md
2. C:\Rental Docs\Master STR Checklists\Master_STR_Documentation_Index.md

Nothing in this pack invents extra tasks. Each prompt embeds the exact source text it maps to.

Files included in this repository architecture (239 total files):
- `00_Master_Task_Mapped_Orchestrator_Prompt.md`: The root orchestrator flow.
- `00_Prompt_Pack_Manifest.csv`: An indexing list of the structural completion prompts.
- `[01-11] Folder Modules`: Containing the localized workflows for each checklist.
  - `00_[Section Name]_Run_Order.md`: Determines the exact order of operations.
  - `[01A-11K]_Phase_Prompts.md`: High-level strategy formulation.
  - `[TRACKER-001]_Execution_Prompt.md` / `_Audit_Prompt.md`: Granular execution files strictly mapped to the master checklist codes.
  - `[01-11]_[Section]_Artifact_Generation_Prompt.md` and `Task_Completion_Prompt.md`: Checkoff/verification loops.
