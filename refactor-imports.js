const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const prismaSeed = path.join(__dirname, 'prisma', 'seed.ts');
const rootDir = __dirname;
const targetPrismaClientDir = path.join(__dirname, 'src', 'generated', 'prisma', 'client');

function getRelativePath(from, to) {
    let rel = path.relative(path.dirname(from), to);
    if (!rel.startsWith('.')) rel = './' + rel;
    // For module imports, use / and no extension
    return rel.replace(/\\/g, '/');
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // We want to replace '@prisma/client' with the relative path to src/generated/prisma/client
    // We only replace the exact string '@prisma/client'
    const importRegex = /from\s+['"]@prisma\/client['"]/g;
    const requireRegex = /require\(['"]@prisma\/client['"]\)/g;

    if (importRegex.test(content) || requireRegex.test(content)) {
        let relPath = getRelativePath(filePath, targetPrismaClientDir);
        
        content = content.replace(importRegex, `from '${relPath}'`);
        content = content.replace(requireRegex, `require('${relPath}')`);
        
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated imports in ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // Ignore node_modules and generated
            if (file === 'node_modules' || file === 'generated') continue;
            walk(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.js')) {
            processFile(fullPath);
        }
    }
}

walk(srcDir);
if (fs.existsSync(prismaSeed)) {
    processFile(prismaSeed);
}
// Also process count.js, test.js, test2.js if they exist
['count.js', 'test.js', 'test2.js'].forEach(f => {
    const fullPath = path.join(rootDir, f);
    if (fs.existsSync(fullPath)) {
        processFile(fullPath);
    }
});
