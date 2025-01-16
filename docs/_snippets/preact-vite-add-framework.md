```js filename=".storybook/main.js" renderer="react" language="js"
export default {
  // ...
  // framework: '@storybook/preact-webpack5', 👈 Remove this
  framework: '@storybook/preact-vite', // 👈 Add this
};
```

```ts filename=".storybook/main.ts" renderer="react" language="ts"
import { StorybookConfig } from '@storybook/preact-vite';

const config: StorybookConfig = {
  // ...
  // framework: '@storybook/preact-webpack5', 👈 Remove this
  framework: '@storybook/preact-vite', // 👈 Add this
};

export default config;
```
