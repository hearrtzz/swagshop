const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

// Add asciiText to PhotoEffectsState
code = code.replace(
  "  asciiMode?: 'color' | 'bw' | 'green';",
  "  asciiMode?: 'color' | 'bw' | 'green';\n  asciiText: number; // 0 to 100%\n  asciiTextString: string;"
);

// Add asciiText to EffectLayerId
code = code.replace(
  "  | 'ascii'",
  "  | 'ascii'\n  | 'asciiText'"
);

// Add asciiText to DEFAULT_LAYER_ORDER
code = code.replace(
  "  'ascii',",
  "  'ascii',\n  'asciiText',"
);

// Add asciiText to DEFAULT_PHOTO_EFFECTS
code = code.replace(
  "  asciiMode: 'color',",
  "  asciiMode: 'color',\n  asciiText: 0,\n  asciiTextString: 'Hello World. ', "
);

fs.writeFileSync('src/types.ts', code);
console.log('Added asciiText to types.ts');
