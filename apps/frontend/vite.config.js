import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      enforce: 'pre', // Run before other plugins
      async transform(code, id) {
        // Only process .js files in src directory, skip node_modules (but include test files for Vitest)
        if (!id.match(/src\/.*\.js$/) || id.includes('node_modules')) {
          return null;
        }

        // Only transform if file contains JSX syntax (more efficient)
        if (!code.includes('<') || !code.includes('>')) {
          return null;
        }

        // Transform .js files as JSX using esbuild
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      },
    },
    react({
      // Allow JSX in .js files (for migration compatibility)
      include: '**/*.{jsx,tsx,js}',
      // Use Fast Refresh for better performance
      fastRefresh: true,
    }),
  ],

  // Optimize dependencies to handle JSX in .js files
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
      // Define global variables for CJS modules
      define: {
        global: 'globalThis',
      },
    },
    // Include React and react-is to ensure proper module resolution
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-is',
      'hoist-non-react-statics',
      'prop-types',
      'react-router-dom', // Ensure React Router is properly bundled
      'to-words', // CJS module that needs pre-bundling
      'dayjs', // Pre-bundle dayjs to avoid initialization issues
      'bootstrap', // Pre-bundle bootstrap to ensure jQuery is loaded first
      '@emotion/react', // Pre-bundle emotion to ensure React is available
    ],
    // Exclude large dependencies from optimization to save memory
    exclude: [
      // Exclude test-related packages
      '@testing-library',
      'msw',
      // Exclude large UI libraries that are already optimized
      '@coreui/coreui-pro',
      // Exclude build tools
      'webpack',
      'rollup',
      // Exclude codemirror - it has complex exports that break with optimization
      'codemirror',
      // Exclude react-router-navigation-prompt - incompatible with React Router v6 (uses withRouter)
      'react-router-navigation-prompt',
    ],
    // Reduce memory usage during optimization
    force: false, // Don't force re-optimization
    entries: [], // Let Vite auto-discover entries
  },

  // Resolve path aliases (matching jsconfig.json)
  resolve: {
    alias: {
      // Map '@' to src directory for absolute imports
      '@': path.resolve(__dirname, './src'),
      // Replace react-router-navigation-prompt with our v6-compatible shim
      'react-router-navigation-prompt': path.resolve(
        __dirname,
        './src/utils/react-router-navigation-prompt-shim.js'
      ),
      // Support existing imports without '@' prefix (e.g., 'assets/css/global.scss')
      assets: path.resolve(__dirname, './src/assets'),
      components: path.resolve(__dirname, './src/components'),
      constants: path.resolve(__dirname, './src/constants'),
      layouts: path.resolve(__dirname, './src/layouts'),
      routes: path.resolve(__dirname, './src/routes'),
      screens: path.resolve(__dirname, './src/screens'),
      services: path.resolve(__dirname, './src/services'),
      utils: path.resolve(__dirname, './src/utils'),
      app: path.resolve(__dirname, './src/app'),
      serviceWorker: path.resolve(__dirname, './src/serviceWorker'),
      polyfill: path.resolve(__dirname, './src/polyfill'),
    },
    // Ensure proper resolution of CJS modules in ESM context
    // Deduplicate React to prevent multiple instances (fixes "Invalid hook call" errors)
    dedupe: ['react', 'react-dom', 'react-is', 'hoist-non-react-statics', 'prop-types'],
  },

  // Dev server configuration
  server: {
    port: 3000,
    host: true, // Listen on all interfaces (0.0.0.0 and ::)
    open: false, // Don't auto-open browser
    strictPort: false, // Allow fallback to next available port if 3000 is taken
    allowedHosts: ['localhost', '.nip.io', '.dev.simpleaccounts.local', '.dev.simpleaccounts.io'], // Restrict to known hosts for security
    // Proxy API requests to Spring Boot backend (localhost:8080)
    // This makes the Vite dev server act as a reverse proxy
    // Works in both local devcontainer and Coder workspaces because:
    // - Browser talks to frontend dev server (port 3000)
    // - Dev server proxies API calls to backend (port 8080) on same machine
    // - No cross-origin issues, no need for absolute URLs
    proxy: {
      // Proxy all paths except frontend routes and static assets
      '/': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Bypass proxy for frontend routes and static files
        bypass: function (req, res, options) {
          const url = req.url;

          // Static assets - serve from Vite (check first for performance)
          if (url.match(/\.(js|css|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$/)) {
            return url;
          }

          // Vite dev server internal paths
          if (url.startsWith('/@') || url.startsWith('/node_modules') || url.startsWith('/src')) {
            return url;
          }

          // Frontend SPA routes - return index.html (Vite/React Router handles routing)
          // These routes are defined in:
          // - apps/frontend/src/routes/initial.js (login, register, reset-password, etc.)
          // - apps/frontend/src/routes/main.js (admin, theme-reference)
          const frontendRoutes = [
            '/',
            '/login',
            '/logout',
            '/register',
            '/reset-password',
            '/new-password',
            '/theme-reference',
          ];

          // Check exact match for root-level SPA routes
          if (frontendRoutes.includes(url.split('?')[0])) {
            return '/index.html';
          }

          // Check if URL starts with /admin (admin routes)
          if (url.startsWith('/admin')) {
            return '/index.html';
          }

          // Everything else goes to Spring Boot backend (API calls)
          return null;
        },
      },
    },
    // Reduce memory usage in dev
    fs: {
      // Limit file system access
      strict: true,
      allow: ['..'],
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps to reduce memory usage
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
    },
    // Optimize chunk splitting for better caching and memory usage
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        manualChunks: id => {
          // Simplified chunking: Keep React in main bundle, only split large libraries
          if (id.includes('node_modules')) {
            // DO NOT split React - keep it in main bundle to ensure it loads first
            // React, React-DOM, React Router, Redux stay in main bundle

            // Only split very large libraries that don't have React dependencies at module level
            if (id.includes('ag-grid')) {
              return 'ag-grid';
            }

            // Everything else from node_modules goes into vendor chunk
            // This ensures proper dependency resolution
            return 'vendor';
          }
        },
      },
      // Reduce memory usage - process fewer files in parallel
      maxParallelFileOps: 1,
    },
    // Increase chunk size warning limit (we're splitting into many small chunks)
    chunkSizeWarningLimit: 500,
    // Reduce memory usage
    minify: 'esbuild', // Use esbuild instead of terser (faster, less memory)
    // Use terser for production builds (better compression, but can use more memory)
    // For now, keep esbuild for lower memory usage
  },

  // Public directory (assets served at root)
  publicDir: 'public',

  // CSS preprocessor options
  css: {
    preprocessorOptions: {
      scss: {
        // Add node_modules to includePaths for easier imports
        includePaths: [path.resolve(__dirname, './node_modules')],
      },
    },
    // Suppress CSS warnings (like unknown properties from SCSS variables)
    devSourcemap: true,
  },

  // Suppress build warnings
  logLevel: 'warn',
});
