# SimpleAccounts Frontend Admin Website

## Project Folder Structure

### assets

In this folder, you have to save all resource files like images, icons and so forth as well as the scss and css files.

### components

In this folder, you have to save all the global components which are used for many times in the project.

### constants

In this folder, you have to save all constants and settings for this project.

### layouts

In this folder, you have to save the layouts of the project.

### routes

In this folder, you have to save the router information.

### screens

In this folder, you have to save the main pages.

### services

In this folder, you have to manage the redux store.

### utils

In this folder, you have to save the all global functions.

## Available Scripts

This project uses [Vite](https://vitejs.dev/) as the primary build tool for fast development and optimized production builds.

### `npm start`

Runs the app in development mode using Vite.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload automatically when you make edits (Hot Module Replacement).<br />
You will also see any lint errors in the console.

**Note:** For CRA compatibility, use `npm run start:cra`

### `npm test`

Launches the test runner in interactive watch mode (using Jest via react-scripts).<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production using Vite to the `dist` folder.<br />
The build is optimized for production with code splitting, tree-shaking, and minification.

The build is minified and the filenames include content hashes for optimal caching.<br />
Your app is ready to be deployed!

**Note:** For CRA compatibility, use `npm run build:cra` (outputs to `build/` folder)

### `npm run preview`

Preview the production build locally using Vite's preview server.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Troubleshooting

### Build Issues

If you encounter build issues:

1. Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
2. Clear build cache: `rm -rf dist build .vite`
3. Check Node.js version: Requires Node 20+ (`node --version`)

### Legacy CRA Build

If you need to use the CRA build system:

- Use `npm run build:cra` instead of `npm run build`
- CRA outputs to `build/` directory, Vite outputs to `dist/`

### Add GitPod
