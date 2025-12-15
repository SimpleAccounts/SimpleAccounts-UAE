import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * Comprehensive test component for shadcn/ui integration
 * Demonstrates all installed components with various variants and states
 */
export const ShadcnTest = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">shadcn/ui Test Component</h1>
        <p className="text-muted-foreground">
          If you can see this styled correctly, shadcn/ui is working! 🎉
        </p>
      </div>

      {/* Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Button Component</CardTitle>
          <CardDescription>Testing all button variants and sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🔍</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled>Disabled</Button>
            <Button variant="default" disabled>
              Disabled Default
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Input Component */}
      <Card>
        <CardHeader>
          <CardTitle>Input Component</CardTitle>
          <CardDescription>Testing input field with various states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="Enter text here..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />
          <Input type="email" placeholder="Email address" />
          <Input type="password" placeholder="Password" />
          <Input type="text" placeholder="Disabled input" disabled />
          <p className="text-sm text-muted-foreground">Current value: {inputValue || '(empty)'}</p>
        </CardContent>
      </Card>

      {/* Card Component */}
      <Card>
        <CardHeader>
          <CardTitle>Card Component</CardTitle>
          <CardDescription>This card demonstrates the card component structure</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">
            Cards are perfect for grouping related content. They provide a clean, structured way to
            display information with proper spacing and shadows.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Confirm</Button>
        </CardFooter>
      </Card>

      {/* Dialog Component */}
      <Card>
        <CardHeader>
          <CardTitle>Dialog Component</CardTitle>
          <CardDescription>Testing modal dialog functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Test</DialogTitle>
                <DialogDescription>
                  This is a test dialog. It should display as a modal overlay with proper animations
                  and focus management.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  Dialog content goes here. You can add any content you need.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Theme Colors Test */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Colors</CardTitle>
          <CardDescription>Verifying CSS variable-based theming</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-12 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">Primary</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-secondary rounded-md flex items-center justify-center">
                <span className="text-secondary-foreground text-sm font-medium">Secondary</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-destructive rounded-md flex items-center justify-center">
                <span className="text-destructive-foreground text-sm font-medium">Destructive</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-muted rounded-md flex items-center justify-center">
                <span className="text-muted-foreground text-sm font-medium">Muted</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Indicator */}
      <Card className="border-green-500 bg-green-50 dark:bg-green-950">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-900 dark:text-green-100">
                shadcn/ui Setup Complete!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                All components are working correctly. You can now use shadcn/ui components
                throughout your application.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShadcnTest;
