import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';

const dest = 'test/repo';
if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest);
}

const npx = /^win/.test(process.platform) ? 'npx.cmd' : 'npx';
const yo = spawn(npx, ['yo', '../../generator/app'], {
  cwd: path.resolve(dest),
  stdio: 'inherit',
});

yo.stdout?.on('data', console.log);
yo.stderr?.on('data', console.error);

export {};
