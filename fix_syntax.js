import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

content = content.replace(
  "        </button>\n      </div>\n      </div> {/* End hidden tabs */}\n\n      {/* Content Body */}",
  "        </button>\n      </div> {/* End hidden tabs */}\n\n      {/* Content Body */}"
);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
