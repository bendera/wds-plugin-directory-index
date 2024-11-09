# Web Dev Server Directory Index Plugin

Directory index plugin for [@web/dev-server](https://modern-web.dev/docs/dev-server/overview/).

![screenshot](screenshot.png)

## Installation

```
npm install --save-dev @bendera/wds-plugin-directory-index
```

## Usage

Add the plugin to the Web Dev Server configuration file (web-dev-server.config.mjs).

```javascript
import { directoryIndexPlugin } from '@bendera/wds-plugin-directory-index';

export default {
  //...
  plugins: [
    directoryIndexPlugin()
  ]
};
```

That's it! There are no settings.
