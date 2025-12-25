import React from 'react';

/**
 * Tailwind CSS Test Component
 *
 * This component is used to verify that Tailwind CSS is working correctly.
 * It demonstrates various Tailwind utility classes including:
 * - Colors (background, text)
 * - Spacing (padding, margin)
 * - Typography (font sizes, weights)
 * - Borders and rounded corners
 * - Shadows
 * - Hover states
 * - Dark mode support
 *
 * This is a temporary component for Phase 2 verification.
 * Can be removed after confirming Tailwind CSS is working.
 */
export const TailwindTest = () => {
  return (
    <div className="p-8 max-w-2xl mx-auto mt-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Tailwind CSS Test Component
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          If you can see this styled correctly, Tailwind CSS is working!
        </p>

        {/* Color Test */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Color Utilities
          </h3>
          <div className="flex gap-2 flex-wrap">
            <div className="bg-blue-500 text-white px-4 py-2 rounded">Blue</div>
            <div className="bg-green-500 text-white px-4 py-2 rounded">Green</div>
            <div className="bg-red-500 text-white px-4 py-2 rounded">Red</div>
            <div className="bg-yellow-500 text-white px-4 py-2 rounded">Yellow</div>
            <div className="bg-purple-500 text-white px-4 py-2 rounded">Purple</div>
          </div>
        </div>

        {/* Theme Colors Test */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Theme Colors (shadcn/ui compatible)
          </h3>
          <div className="flex gap-2 flex-wrap">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded">Primary</div>
            <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded">
              Secondary
            </div>
            <div className="bg-accent text-accent-foreground px-4 py-2 rounded">Accent</div>
            <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded">
              Destructive
            </div>
            <div className="bg-muted text-muted-foreground px-4 py-2 rounded">Muted</div>
          </div>
        </div>

        {/* Spacing Test */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Spacing Utilities
          </h3>
          <div className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded">
            <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">Padding and Margin</div>
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">More Spacing</div>
          </div>
        </div>

        {/* Typography Test */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Typography
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Small text</p>
          <p className="text-base text-gray-700 dark:text-gray-300">Base text</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Large semibold</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">Extra large bold</p>
        </div>

        {/* Button Test */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Interactive Elements
          </h3>
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg shadow-md hover:bg-primary/90 transition-colors mr-2">
            Primary Button
          </button>
          <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg shadow-md hover:bg-secondary/90 transition-colors">
            Secondary Button
          </button>
        </div>

        {/* Dark Mode Test */}
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
            Dark Mode Support
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Add{' '}
            <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
              class=&quot;dark&quot;
            </code>{' '}
            to the HTML element to test dark mode.
          </p>
        </div>

        {/* Container Test */}
        <div className="container mx-auto p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300">
            This uses the container utility with centered content and padding.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;
