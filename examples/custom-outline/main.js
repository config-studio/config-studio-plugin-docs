(function() {
  const pluginId = 'custom-outline';
  if (!window.ConfigStudio) return;

  // Register custom AST outline provider for nginx / conf files
  window.ConfigStudio.registerOutlineProvider({
    language: 'conf',
    parse: (content, filename) => {
      const nodes = [];
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmed = line.trim();

        if (trimmed.startsWith('server {') || trimmed === 'server{') {
          nodes.push({
            id: `server-${lineNum}`,
            label: 'server',
            type: 'section',
            line: lineNum
          });
        }

        const locMatch = trimmed.match(/^location\s+([^{]+)\s*\{/);
        if (locMatch) {
          nodes.push({
            id: `loc-${lineNum}`,
            label: `location ${locMatch[1].trim()}`,
            type: 'function',
            line: lineNum
          });
        }
      });

      return nodes;
    }
  });

  console.log('[CustomOutline] Provider registered for .conf');
})();
