const fs = require('fs');
const path = require('path');

const sourceDir = process.argv[2];
if (!sourceDir) {
    console.error('Usage: node scripts/build-fade-data.js <fades folder>');
    process.exit(1);
}

function compact(file) {
    const tables = JSON.parse(fs.readFileSync(path.join(sourceDir, file), 'utf8'));
    const out = {};
    for (const { weapon, percentages } of tables) {
        const bySeed = [];
        for (const { seed, percentage, ranking } of percentages) {
            bySeed[seed] = [Math.round(percentage * 10) / 10, ranking];
        }
        out[weapon.toLowerCase()] = Array.from(bySeed, (entry) => entry ?? null);
    }
    return out;
}

const data = {
    fade: compact('fade-percentages.json'),
    'amber fade': compact('amber-fade-percentages.json'),
    'acid fade': compact('acid-fade-percentages.json'),
};

const target = path.join(__dirname, '..', 'src', 'data', 'fade.json');
fs.writeFileSync(target, JSON.stringify(data));
console.log(`${target}: ${(fs.statSync(target).size / 1024).toFixed(0)} KB`);
