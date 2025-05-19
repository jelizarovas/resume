const fs = require("fs");
const path = require("path");

const outputFile = "directory-structure.md"; // or .txt

function generateTree(dirPath, depth = 0) {
  let tree = "";
  const indent = "  ".repeat(depth);
  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  items.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  for (const item of items) {
    const itemPath = path.join(dirPath, item.name);
    if (item.isDirectory()) {
      tree += `${indent}- 📁 ${item.name}\n`;
      tree += generateTree(itemPath, depth + 1);
    } else {
      tree += `${indent}- 📄 ${item.name}\n`;
    }
  }

  return tree;
}

const startPath = process.cwd();
const treeOutput = `# Project Directory Structure\n\n${generateTree(startPath)}`;

fs.writeFileSync(outputFile, treeOutput);
console.log(`✅ Directory structure exported to ${outputFile}`);
