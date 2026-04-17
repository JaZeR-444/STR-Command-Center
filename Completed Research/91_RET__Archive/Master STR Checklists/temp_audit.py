import os, json, re

html_path = r'C:\Rental Docs\Completed Research\STR_Launch_Command_Center_2026-04-03.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Extract current vault
start = html.index('const documentVault = ') + len('const documentVault = ')
end = html.index(';\n', start)
vault = json.loads(html[start:end])

# Find all prompt/agent-related false positives
exclude_patterns = ['prompt', 'PROMPT', '_prompts', '.PROMPTS', 'TASK_MAPPED', 'agent']
false_positives = {}
for k, v in vault.items():
    path_lower = v['path'].lower()
    if any(p.lower() in path_lower for p in exclude_patterns):
        false_positives[k] = v

print(f"False positives to remove: {len(false_positives)}")
for k, v in sorted(false_positives.items()):
    print(f"  {k}: {v['name'][:60]} -> {v['path'][:80]}")

# Also check for README, SCHEMA_NOTES, and other meta files
meta_matches = {}
for k, v in vault.items():
    name_lower = v['name'].lower()
    if any(m in name_lower for m in ['readme', 'schema_notes', 'template', 'navigator']):
        meta_matches[k] = v

print(f"\nMeta/template files (potential false positives): {len(meta_matches)}")
for k, v in sorted(meta_matches.items()):
    print(f"  {k}: {v['name'][:60]} -> {v['path'][:80]}")

print(f"\nTotal current matches: {len(vault)}")
print(f"After removing prompt files: {len(vault) - len(false_positives)}")
