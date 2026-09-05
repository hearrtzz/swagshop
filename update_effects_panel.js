import fs from 'fs';

let content = fs.readFileSync('src/components/EffectsPanel.tsx', 'utf8');

// 1. Import Reorder
content = content.replace("import {", "import { Reorder } from 'motion/react';\nimport {");

// 2. Remove draggingLayerIdRef, draggedLayerId, and handleLiveSwap
content = content.replace(/const \[draggedLayerId, setDraggedLayerId\].*?;\n/g, "");
content = content.replace(/const draggingLayerIdRef.*?;\n/g, "");
content = content.replace(/draggingLayerIdRef\.current = draggedLayerId;\n/g, "");
content = content.replace(/const handleLiveSwap = React\.useCallback[\s\S]*?\}, \[state\.layerOrder, onChange\]\);\n/g, "");

// 3. Remove React.useEffect for pointermove
content = content.replace(/React\.useEffect\(\(\) => \{\n\s*if \(\!draggedLayerId\).*?}, \[draggedLayerId, handleLiveSwap\]\);\n/s, "");

// 4. Update the render logic for the list.
content = content.replace(
`              <div
                className={\`space-y-1.5 \${draggedLayerId ? 'select-none touch-none' : ''}\`}
                onDragOver={(e) => e.preventDefault()}
              >
                {visualLayers.map((layer) => {
                  const IconComp = layer.icon;
                  const isTopInStack = layer.executionIndex === currentOrder.length - 1;
                  const isBottomInStack = layer.executionIndex === 0;
                  const levelNum = layer.executionIndex + 1;
                  const isBeingDragged = draggedLayerId === layer.id;

                  return (
                    <div
                      key={layer.id}
                      data-layer-id={layer.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedLayerId(layer.id);
                        draggingLayerIdRef.current = layer.id;
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', layer.id);
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        handleLiveSwap(layer.id);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        handleLiveSwap(layer.id);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleLiveSwap(layer.id);
                        setDraggedLayerId(null);
                      }}
                      onDragEnd={() => {
                        setDraggedLayerId(null);
                        draggingLayerIdRef.current = null;
                      }}
                      onPointerDown={(e) => {
                        if ((e.target as HTMLElement).closest('button, input, select')) return;
                        if (e.button !== 0) return;
                        setDraggedLayerId(layer.id);
                        draggingLayerIdRef.current = layer.id;
                      }}
                      className={\`flex items-center justify-between p-2 rounded-lg border transition-all duration-100 \${
                        isBeingDragged
                          ? 'bg-[#2a3042] border-[#007aff] ring-2 ring-[#007aff]/50 shadow-lg scale-[1.01] z-10 cursor-grabbing'
                          : layer.isActive
                          ? 'bg-[#252528] border-[#444] shadow-xs cursor-grab active:cursor-grabbing hover:border-[#666]'
                          : 'bg-[#18181a] border-[#2a2a2c] opacity-60 cursor-grab active:cursor-grabbing hover:border-[#444]'
                      }\`}
                    >`,
`              <Reorder.Group
                axis="y"
                values={visualLayers}
                onReorder={(newOrderLayers) => {
                  const newOrderIds = newOrderLayers.map(l => l.id).reverse();
                  onChange(prev => ({ ...prev, layerOrder: newOrderIds }));
                }}
                className="space-y-1.5"
              >
                {visualLayers.map((layer) => {
                  const IconComp = layer.icon;
                  const isTopInStack = layer.executionIndex === currentOrder.length - 1;
                  const isBottomInStack = layer.executionIndex === 0;
                  const levelNum = layer.executionIndex + 1;

                  return (
                    <Reorder.Item
                      key={layer.id}
                      value={layer}
                      whileDrag={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(0,0,0,0.5)", zIndex: 10 }}
                      className={\`flex items-center justify-between p-2 rounded-lg border transition-colors \${
                        layer.isActive
                          ? 'bg-[#252528] border-[#444] shadow-xs cursor-grab active:cursor-grabbing hover:border-[#666]'
                          : 'bg-[#18181a] border-[#2a2a2c] opacity-60 cursor-grab active:cursor-grabbing hover:border-[#444]'
                      }\`}
                    >`
);

content = content.replace(
`                  return (
                    <div
                      key={layer.id}`, // If there is remaining div, we close it with Reorder.Item
`<empty>` // Not replacing here, just checking closing tag
);

content = content.replace(/<\/div>\s*\}\)\}\s*<\/div>/g, 
`</Reorder.Item>
                ))}
              </Reorder.Group>`);

fs.writeFileSync('src/components/EffectsPanel.tsx', content);
console.log('Patched');
