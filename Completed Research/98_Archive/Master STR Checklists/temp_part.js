const fs = require('fs');

const roadmapMd = fs.readFileSync('C:\\Rental Docs\\Master STR Checklists\\Master_STR_Roadmap_Pre_vs_Post_Listing.md', 'utf8');
const docsMd = fs.readFileSync('C:\\Rental Docs\\Master STR Checklists\\Master_STR_Documentation_Index.md', 'utf8');
let htmlContent = fs.readFileSync('C:\\Rental Docs\\Master STR Checklists\\STR Launch Command Center.html', 'utf8');

// --- DATA EXTRACTION ---
const roadmapDescriptions = {};
roadmapMd.split('\n').forEach(line => {
    if (line.includes('| [ ] ') || line.includes('| **')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 4) {
            let task = parts[1].replace('[ ] ', '').replace(/\[x\] /i, '').replace(/\*\*/g, '');
            roadmapDescriptions[task] = parts[3];
        }
    }
});

const docsDescriptions = {};
docsMd.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- **') || trimmed.startsWith('* **')) {
        const parts = trimmed.split('**:');
        if (parts.length >= 2) {
            const name = parts[0].replace(/^[-*\s]+/, '').replace(/\*\*/g, '').trim();
            docsDescriptions[name] = parts[1].trim();
        }
    } else if (trimmed.includes('`') && trimmed.includes(':') && (trimmed.includes('.') || trimmed.includes('-'))) {
        const idMatch = trimmed.match(/`([^`]+)`/);
        const nameMatch = trimmed.match(/`[^`]+`:\s*([^.\-]+)/);
        const descMatch = trimmed.match(/[.\-]\s*(.*)$/);
        if (nameMatch && descMatch) {
            const name = nameMatch[1].trim();
            const desc = descMatch[1].trim();
            docsDescriptions[name] = desc;
            if (idMatch) docsDescriptions[idMatch[1].trim()] = desc;
        }
    }
});

// --- UPDATE DATA ARRAYS ---
const roadmapDataMatch = htmlContent.match(/const roadmapData = (\[[\s\S]*?\]);/);
const documentationDataMatch = htmlContent.match(/const documentationData = (\[[\s\S]*?\]);/);

let roadmapData = eval(`(${roadmapDataMatch[1]})`);
let documentationData = eval(`(${documentationDataMatch[1]})`);

roadmapData = roadmapData.map(item => {
    const taskKey = item.task.replace(/\*\*/g, '');
    return { ...item, description: roadmapDescriptions[taskKey] || "" };
});

documentationData = documentationData.map(item => {
    let artifactKey = item.artifact.split(' (')[0].trim();
    let desc = docsDescriptions[artifactKey];
    if (!desc && artifactKey.includes(': ')) {
        const parts = artifactKey.split(': ');
        desc = docsDescriptions[parts[1].trim()] || docsDescriptions[parts[0].trim()];
    }
    if (!desc) {
        for (let key in docsDescriptions) {
            if (artifactKey.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(artifactKey.toLowerCase())) {
                desc = docsDescriptions[key];
                break;
            }
        }
    }
    return { ...item, description: desc || "" };
});

// --- INJECT UPDATED DATA ---
htmlContent = htmlContent.replace(/const roadmapData = \[[\s\S]*?\];/, `const roadmapData = ${JSON.stringify(roadmapData, null, 4)};`);
htmlContent = htmlContent.replace(/const documentationData = \[[\s\S]*?\];/, `const documentationData = ${JSON.stringify(documentationData, null, 4)};`);

// --- UPDATE UI RENDERING ---

// Update renderDocumentation
// Find the block with doc.artifact and doc.id
const docPattern = /<div class="flex-grow">\s*<p class="text-xs font-medium \${isCompleted \? 'completed-text' : 'text-slate-300'}">\s*\${doc.artifact}\s*<\/p>\s*<span class="text-\[9px\] text-slate-600 font-mono uppercase mt-1 block">\${doc.id}<\/span>\s*<\/div>/;
const docReplacement = `<div class="flex-grow">
                                        <p class="text-xs font-medium \${isCompleted ? 'completed-text' : 'text-slate-300'}">
                                            \${doc.artifact}
                                        </p>
                                        <p class="text-[11px] text-slate-500 mt-1">\${doc.description || ""}</p>
                                        <span class="text-[9px] text-slate-600 font-mono uppercase mt-1 block">\${doc.id}</span>
                                    </div>`;

if (docPattern.test(htmlContent)) {
    htmlContent = htmlContent.replace(docPattern, docReplacement);
} else {
    console.error("Could not find doc render pattern");
}

// Update renderSectionDetail
// Find the block with task.task and getTagClass
const taskPattern = /<div class="flex-grow">\s*<p class="text-sm leading-relaxed \${isCompleted \? 'completed-text' : 'text-slate-200'}">\s*\${task.task}\s*<\/p>\s*<div class="flex gap-2 mt-2.5">/;
const taskReplacement = `<div class="flex-grow">
                                        <p class="text-sm leading-relaxed \${isCompleted ? 'completed-text' : 'text-slate-200'}">
                                            \${task.task}
                                        </p>
                                        <p class="text-[11px] text-slate-500 mt-1">\${task.description || ""}</p>
                                        <div class="flex gap-2 mt-2.5">`;

if (taskPattern.test(htmlContent)) {
    htmlContent = htmlContent.replace(taskPattern, taskReplacement);
} else {
    console.error("Could not find task render pattern");
}

fs.writeFileSync('C:\\Rental Docs\\Master STR Checklists\\STR Launch Command Center.html', htmlContent, 'utf8');
console.log("Successfully updated STR Launch Command Center.html");
