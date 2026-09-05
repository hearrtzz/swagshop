import fs from 'fs';
let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

content = content.replace(
`              <Reorder.Group
                axis="y"
                values={visualLayers}
                onReorder={(newOrderLayers) => {
                  const newOrderIds = newOrderLayers.map(l => l.id).reverse();
                  onChange(prev => ({ ...prev, layerOrder: newOrderIds }));
                }}`,
`              <Reorder.Group
                axis="y"
                values={currentOrder.slice().reverse()}
                onReorder={(newOrderIds) => {
                  onChange(prev => ({ ...prev, layerOrder: [...newOrderIds].reverse() }));
                }}`
);

content = content.replace(
`                    <Reorder.Item
                      key={layer.id}
                      value={layer}`,
`                    <Reorder.Item
                      key={layer.id}
                      value={layer.id}`
);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
