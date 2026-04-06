import os

base_dir = r"C:\Rental Docs\Completed Research\.PROMPTS\TASK_MAPPED_PROMPT_PACK"

# Universal format block to append
universal_block = """
## Universal Document Structure (Required)
Every generation for ANY document, markdown file, or tracker MUST begin with the following structural YAML frontmatter so it is tagged with its specific identifier. Do not add codeblock ticks around it, just the dashes.

---
id: [SPECIFIC_IDENTIFIER e.g., MKT-001, TIM-003, or OPS-GENERAL]
title: [Exact Title of Document]
date: YYYY-MM-DD
---
# [Exact Title of Document]
"""

count = 0

for d in os.listdir(base_dir):
    p = os.path.join(base_dir, d)
    if os.path.isdir(p) and d[0:2].isdigit():
        for filename in os.listdir(p):
            if filename.startswith("00_") and filename.endswith(".md"):
                file_path = os.path.join(p, filename)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Check if it already has the block to avoid duplication
                if "Universal Document Structure" not in content:
                    with open(file_path, "a", encoding="utf-8") as f:
                        f.write("\n" + universal_block.strip() + "\n")
                    count += 1
                    print(f"Updated: {filename}")
                else:
                    print(f"Skipped (already injected): {filename}")

print(f"\nSuccessfully injected universal formatting rules into {count} standard files.")
