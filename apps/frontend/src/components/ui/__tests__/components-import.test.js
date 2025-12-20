/**
 * Simple import test to verify all shadcn/ui components can be imported
 * This ensures all components are properly set up and accessible
 */

describe('shadcn/ui Components Import Test', () => {
  it('should import all core components without errors', async () => {
    // Use dynamic imports for Vitest ESM compatibility
    await expect(
      Promise.all([
        import('@/components/ui/alert'),
        import('@/components/ui/alert-dialog'),
        import('@/components/ui/avatar'),
        import('@/components/ui/badge'),
        import('@/components/ui/button'),
        import('@/components/ui/card'),
        import('@/components/ui/checkbox'),
        import('@/components/ui/dialog'),
        import('@/components/ui/dropdown-menu'),
        import('@/components/ui/input'),
        import('@/components/ui/label'),
        import('@/components/ui/popover'),
        import('@/components/ui/radio-group'),
        import('@/components/ui/select'),
        import('@/components/ui/separator'),
        import('@/components/ui/skeleton'),
        import('@/components/ui/sonner'),
        import('@/components/ui/switch'),
        import('@/components/ui/tabs'),
        import('@/components/ui/textarea'),
        import('@/components/ui/tooltip'),
      ])
    ).resolves.toBeDefined();
  });
});
