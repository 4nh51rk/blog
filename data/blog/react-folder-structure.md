---
title: React Folder Structure
date: '2021-05-29'
tags: ['react', 'folder', 'structure']
draft: false
summary: Clean up your imports using Absolute Imports
---

Structuring React apps is an opinionated topic. Most React projects start with a `src/components` directory. But if we were to put all of our files into the `components` folder, things would soon get messy and out of control, especially if each component has a test and a style file attached to it.

A better way to strucure this is to put each component into it's own nested folder structure. You may also to choose to put in additional folders inside this component folder with logic that should be considered private for that specific component.

```bash
├── src
│   ├── components
│   │   ├── Navigation
│   │   │   ├── api
│   │   │   ├── components
│   │   │   ├── hooks
│   │   │   ├── utils
│   │   └── index.ts
│   │   └── Navigation.ts
│   │   └── Navigation.css
│   │   └── Navigation.test
│   │   ├── Footer
│   │   │   ├── api
│   │   │   ├── components
│   │   │   ├── hooks
│   │   │   ├── utils
│   │   └── index.ts
│   │   └── Footer.ts
│   │   └── Footer.css
│   │   └── Footer.test
│   ├── common
│   │   └── ...
```

Inside the `src/` directory we have a `common` folder. This contains reusable code that our entire application can access. This common director typically will contain reusable components (usually this consits of buttons and inputs), hooks, business logic, constants and utility functions.

Inside each component folder, we have an `index.ts` file in each components directory allows you to import the directory via the `index.ts` file, which looks something like this: `src/components/Navigation`.
NB: This `index.ts` file contains nothing more but `export { default as Navigation } from './Navigation;`.

The `api` directory contains business logic for that specific component which contain logic that deals with data manipulation and calculations.

The `components` directory will more than likely be the largest, which contains all sub-components for the main component.

The `hooks` directory contains hook functions is used as an abstraction mechanism for any kind of functionality.

The `utils` directory contains small generic functions typically used for things like validations and formatting.
