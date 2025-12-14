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
        // Only process .js files in src directory, skip node_modules and test files
        if (!id.match(/src\/.*\.js$/) || id.includes('node_modules') || id.includes('.test.')) {
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
    },
    // Exclude large dependencies from optimization to save memory
    exclude: [
      // Exclude test-related packages
      '@testing-library',
      'msw',
      // Exclude large UI libraries that are already optimized
      '@coreui/coreui-pro',
      '@material-ui/core',
      // Exclude build tools
      'webpack',
      'rollup',
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
      // Support existing imports without '@' prefix (e.g., 'assets/css/global.scss')
      'assets': path.resolve(__dirname, './src/assets'),
      'components': path.resolve(__dirname, './src/components'),
      'constants': path.resolve(__dirname, './src/constants'),
      'layouts': path.resolve(__dirname, './src/layouts'),
      'routes': path.resolve(__dirname, './src/routes'),
      'screens': path.resolve(__dirname, './src/screens'),
      'services': path.resolve(__dirname, './src/services'),
      'utils': path.resolve(__dirname, './src/utils'),
      'app': path.resolve(__dirname, './src/app'),
      'serviceWorker': path.resolve(__dirname, './src/serviceWorker'),
      'polyfill': path.resolve(__dirname, './src/polyfill'),
    },
  },
  
  // Dev server configuration
  server: {
    port: 3000,
    open: false, // Don't auto-open browser
    strictPort: false, // Allow fallback to next available port if 3000 is taken
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
    // Optimize chunk splitting for better caching and memory usage
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        manualChunks: (id) => {
          // More granular chunking to reduce chunk sizes and memory usage
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-dom/')) {
              return 'react-core';
            }
            // React Router
            if (id.includes('react-router')) {
              return 'react-router';
            }
            // Redux
            if (id.includes('redux') || id.includes('react-redux')) {
              return 'redux-vendor';
            }
            // Material UI - split into smaller chunks
            if (id.includes('@mui/material')) {
              return 'mui-material';
            }
            if (id.includes('@mui/x-data-grid')) {
              return 'mui-data-grid';
            }
            if (id.includes('@emotion')) {
              return 'emotion';
            }
            // CoreUI - split into smaller chunks
            if (id.includes('@coreui/coreui-pro')) {
              return 'coreui-pro';
            }
            if (id.includes('@coreui/react')) {
              return 'coreui-react';
            }
            if (id.includes('@coreui/icons')) {
              return 'coreui-icons';
            }
            // Other UI libraries
            if (id.includes('reactstrap') || id.includes('bootstrap')) {
              return 'bootstrap-vendor';
            }
            // Chart libraries
            if (id.includes('chart.js') || id.includes('apexcharts') || id.includes('react-chartjs')) {
              return 'charts';
            }
            // PDF/Excel libraries (large)
            if (id.includes('jspdf') || id.includes('@react-pdf') || id.includes('exceljs') || id.includes('@progress/kendo')) {
              return 'document-vendor';
            }
            // AG Grid (large)
            if (id.includes('ag-grid')) {
              return 'ag-grid';
            }
            // Form libraries
            if (id.includes('formik') || id.includes('yup')) {
              return 'forms';
            }
            // Date/time libraries
            if (id.includes('moment') || id.includes('react-datepicker') || id.includes('daterangepicker')) {
              return 'date-vendor';
            }
            // Large utility libraries
            if (id.includes('lodash') || id.includes('axios')) {
              return 'utils-vendor';
            }
            // Everything else from node_modules
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
