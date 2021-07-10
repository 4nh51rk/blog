---
title: React Absolute Imports
date: '2021-05-29'
tags: ['react', 'imports']
draft: false
summary: Clean up your imports using Absolute Imports
---

In codebases it's common to have a long relative import like so:

```javascript
import Button from '../../components/Button'
```

With importing paths that traverse up and down the folder hierachy, it becomes confusing which file or folder you are importing from, and you as the developer need to think about refactorability and making it clear to see where you are importing things from.

With absolute paths however, we can make fix refactorability and clarity like so:

```javascript
import Button from '@/components/Button'
```

For this to work, you need to modify your module bundler configuration settings, so it knows to look it the `modules` directory for such files and folders.
NB: A common pattern is to append a `@` prefix to indicate that the import is an absolute path.

NextJS - https://nextjs.org/docs/advanced-features/module-path-aliases
CRA - https://create-react-app.dev/docs/importing-a-component/
