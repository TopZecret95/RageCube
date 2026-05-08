import fs from 'fs';
let b = fs.readFileSync('components/GameCanvas.tsx', 'utf8');
b = b.replace(/\\"\\"Press Start 2P\\", monospace\\"/g, '\"Press Start 2P\", monospace');
b = b.replace(/"Inter", system-ui, sans-serif/g, '\"Press Start 2P\", monospace');
fs.writeFileSync('components/GameCanvas.tsx', b);
