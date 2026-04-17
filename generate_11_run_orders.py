import os

base_dir = r"C:\Rental Docs\Completed Research\.PROMPTS\TASK_MAPPED_PROMPT_PACK"
output_dir = os.path.join(base_dir, "00_Prompt_Run_Orders")

os.makedirs(output_dir, exist_ok=True)

categories = sorted([d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d)) and d[0:2].isdigit()])

count = 0

for category in categories:
    cat_path = os.path.join(base_dir, category)
    files = sorted([file for file in os.listdir(cat_path) if file.endswith('.md')])
    
    # Categorize the files
    init_files = [x for x in files if x.startswith("00_")]
    seq_files = [x for x in files if len(x) > 3 and x[0:2].isdigit() and x[2].isalpha() and x[2].isupper() and '_' in x]
    util_files = [x for x in files if "Challenge_Response" in x or "Completion_Rule" in x or "Artifact_Generation" in x or "Task_Completion" in x]
    
    # Find Execution prompts
    exec_files = [x for x in files if x not in init_files and x not in seq_files and x not in util_files]
    
    # Sort utils logically
    completion = [x for x in util_files if "Completion_Rule" in x]
    artifact = [x for x in util_files if "Artifact_Generation" in x]
    task_comp = [x for x in util_files if "Task_Completion" in x]
    challenge = [x for x in util_files if "Challenge_Response" in x]
    
    output_filename = f"{category}_Run_Order.md"
    output_path = os.path.join(output_dir, output_filename)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(f"# {category.replace('_', ' ')}: Prompt Run Order\n\n")
        f.write("This document provides the definitive, step-by-step execution order for this specific module. Following this sequence ensures complete documentation generation without missing steps or circular dependencies.\n\n")
        f.write("---\n\n")
        
        step = 1
        
        # 1. Initialization
        if init_files:
            f.write(f"**Step {step}. Module Initialization**\n")
            f.write("Run the standards and run-order file to prime the LLM with the module's baseline rules.\n")
            for x in init_files:
                f.write(f"- `{os.path.join('..', category, x)}`\n")
            f.write("\n")
            step += 1
            
        # 2. Sequential Workflows
        if seq_files:
            f.write(f"**Step {step}. Sequential Workflow Processing**\n")
            f.write("Run these prompts in alphabetical order. They build the core strategy and documentation iteratively.\n")
            for x in seq_files:
                f.write(f"- `{os.path.join('..', category, x)}`\n")
            f.write("\n")
            step += 1
            
        # 3. Execution Prompts
        if exec_files:
            f.write(f"**Step {step}. Specific Execution & Feature Tasks**\n")
            f.write("Run these functional prompts to generate specific trackers, audits, and checklists as mandated by the sequential workflows.\n")
            for x in exec_files:
                f.write(f"- `{os.path.join('..', category, x)}`\n")
            f.write("\n")
            step += 1
            
        # 4. Finalization
        final_files = completion + artifact + task_comp
        if final_files:
            f.write(f"**Step {step}. Module Finalization & Consolidation**\n")
            f.write("Run these to verify completion, generate final artifacts, and formally close out the module.\n")
            for x in final_files:
                f.write(f"- `{os.path.join('..', category, x)}`\n")
            f.write("\n")
            step += 1
            
        # 5. Support (Optional)
        if challenge:
            f.write("*(Optional) Troubleshooting & Blockers*\n")
            f.write("If issues arise during the module, run the SOP challenge prompt.\n")
            for x in challenge:
                f.write(f"- `{os.path.join('..', category, x)}`\n")
            f.write("\n")
            
        f.write("---\n\n")

        f.write("## Execution Best Practices\n")
        f.write("- **One Prompt Per Message**: Do not dump multiple prompts into the LLM at once.\n")
        f.write("- **Verify Outputs**: Before moving to the next prompt, ensure the output complies with the rules defined in the `00_` initialization file.\n")
        f.write("- **Save Artifacts**: Save generated Markdown and CSV files to the `Completed Research` directory exactly as named by the LLM.\n")

    count += 1
    print(f"Created: {output_filename}")

print(f"\nSuccessfully generated {count} separate run orders in {output_dir}")
