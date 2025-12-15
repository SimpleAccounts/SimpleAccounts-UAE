/**
 * Simple import test to verify all shadcn/ui components can be imported
 * This ensures all components are properly set up and accessible
 */

describe('shadcn/ui Components Import Test', () => {
  it('should import all core components without errors', () => {
    expect(() => {
      require('@/components/ui/alert');
      require('@/components/ui/alert-dialog');
      require('@/components/ui/avatar');
      require('@/components/ui/badge');
      require('@/components/ui/button');
      require('@/components/ui/card');
      require('@/components/ui/checkbox');
      require('@/components/ui/dialog');
      require('@/components/ui/dropdown-menu');
      require('@/components/ui/input');
      require('@/components/ui/label');
      require('@/components/ui/popover');
      require('@/components/ui/radio-group');
      require('@/components/ui/select');
      require('@/components/ui/separator');
      require('@/components/ui/skeleton');
      require('@/components/ui/sonner');
      require('@/components/ui/switch');
      require('@/components/ui/tabs');
      require('@/components/ui/textarea');
      require('@/components/ui/tooltip');
    }).not.toThrow();
  });
});

