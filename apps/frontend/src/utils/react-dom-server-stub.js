// Stub for react-dom/server in browser environment
// react-to-print imports this but doesn't actually use it in the browser
// This stub prevents Vite from trying to load server-side rendering code

export default {};
export const renderToString = () => '';
export const renderToStaticMarkup = () => '';
