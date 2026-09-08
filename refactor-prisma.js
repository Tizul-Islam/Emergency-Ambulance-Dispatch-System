const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const prismaSeed = path.join(__dirname, 'prisma', 'seed.ts');

function getRelativePath(from, to) {
    let rel = path.relative(path.dirname(from), to);
    if (!rel.startsWith('.')) rel = './' + rel;
    return rel.replace(/\.ts$/, '');
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const target = 'const prisma = new PrismaClient();';
    if (content.includes(target)) {
        const prismaTsPath = path.join(__dirname, 'src', 'utils', 'prisma.ts');
        let relPath = getRelativePath(filePath, prismaTsPath);
        relPath = relPath.replace(/\\/g, '/');
        
        const replacement = `import prisma from '${relPath}';`;
        content = content.replace(target, replacement);
        
        content = content.replace(/import\s+{\s*PrismaClient\s*}\s+from\s+['"]@prisma\/client['"];?\n?/, '');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts') && fullPath !== path.join(__dirname, 'src', 'utils', 'prisma.ts')) {
            processFile(fullPath);
        }
    }
}

walk(srcDir);
if (fs.existsSync(prismaSeed)) {
    processFile(prismaSeed);
}
