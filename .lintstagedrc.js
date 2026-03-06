const path = require('path');

module.exports = {
  '**/*.{js,ts,jsx,tsx,md}': (filenames) => {
    // Filter out files from packages that have their own ESLint config
    // and dotfiles (which are ignored by ESLint by default)
    const filteredFiles = filenames.filter((file) => {
      const basename = path.basename(file);
      return (
        !file.includes('/packages/project-navigator/') &&
        !file.includes('/docs/specs/') &&
        !basename.startsWith('.')
      );
    });

    if (filteredFiles.length === 0) {
      return [];
    }

    return [`npx eslint --max-warnings 0 ${filteredFiles.join(' ')}`];
  },
};
