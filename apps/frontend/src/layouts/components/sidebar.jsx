import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * Sidebar Component
 * Neumorphic navigation sidebar with collapsible items
 */
export function Sidebar({ className, items = [], pathname = '', minimized = false }) {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <aside
        className={cn(
          'hidden md:flex flex-col bg-neu-bg dark:bg-neu-bg-dark',
          'shadow-neu-out dark:shadow-neu-out-dark',
          'rounded-2xl flex-shrink-0',
          minimized ? 'w-20' : 'w-64',
          className
        )}
      >
        <div className="p-4">
          <p className="text-sm text-muted-foreground">No navigation items available</p>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-neu-bg dark:bg-neu-bg-dark',
        'shadow-neu-out dark:shadow-neu-out-dark',
        'rounded-2xl transition-all duration-300 flex-shrink-0',
        minimized ? 'w-20' : 'w-64',
        className
      )}
    >
      <ScrollArea className="h-[calc(100vh-160px)]">
        <nav className="flex flex-col gap-2 p-4">
          {items.map(item => (
            <NavItem
              key={item.url || item.name}
              item={item}
              pathname={pathname}
              minimized={minimized}
            />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}

function NavItem({ item, pathname, minimized, isSubItem = false }) {
  const [isOpen, setIsOpen] = useState(
    item.children?.some(child => child?.url && pathname.startsWith(child.url))
  );

  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const isChildActive = hasChildren && item.children.some(child => child?.url && pathname.startsWith(child.url));

  // Parent menu item with children
  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            // Base styles
            'flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium',
            'transition-all duration-200 ease-out',
            'bg-neu-bg dark:bg-neu-bg-dark',
            // Default state - subtle flat shadow
            'shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.7)]',
            'dark:shadow-[3px_3px_6px_#1e1f23,-3px_-3px_6px_#383b43]',
            // Hover state - raised effect
            'hover:shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]',
            'dark:hover:shadow-[5px_5px_10px_#1e1f23,-5px_-5px_10px_#383b43]',
            'hover:-translate-y-0.5',
            // Open/Active state - pressed effect
            (isOpen || isChildActive) && [
              'shadow-neu-in dark:shadow-neu-in-dark',
              'text-primary',
              'translate-y-0',
            ],
            // Text colors
            'text-slate-700 dark:text-slate-200',
            minimized && 'justify-center px-3'
          )}
          title={minimized ? item.name : undefined}
        >
          <div className="flex items-center gap-3">
            {item.icon && (
              <i
                className={cn(
                  item.icon,
                  'w-5 text-center transition-colors duration-200',
                  (isOpen || isChildActive) ? 'text-primary' : 'text-slate-500 dark:text-slate-400',
                  minimized && 'text-lg'
                )}
              />
            )}
            {!minimized && <span className="truncate">{item.name}</span>}
          </div>
          {!minimized && (
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                (isOpen || isChildActive) ? 'text-primary' : 'text-slate-400',
                isOpen && 'rotate-180'
              )}
            />
          )}
        </button>

        {/* Submenu items */}
        {isOpen && !minimized && (
          <div className="ml-3 mt-1 space-y-1 border-l-2 border-primary/20 pl-3">
            {item.children.map(child => (
              <NavItem
                key={child.url || child.name}
                item={child}
                pathname={pathname}
                minimized={false}
                isSubItem={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Leaf menu item (no children)
  return (
    <NavLink
      to={item.url}
      className={({ isActive }) =>
        cn(
          // Base styles
          'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium',
          'transition-all duration-200 ease-out',
          'bg-neu-bg dark:bg-neu-bg-dark',
          // Submenu items have different styling
          isSubItem ? [
            // Submenu - lighter, more subtle
            'py-2.5 px-3 rounded-lg',
            'hover:text-primary hover:bg-primary/5',
            isActive && [
              'text-primary font-semibold',
              'bg-primary/10',
              'shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]',
              'dark:shadow-[inset_2px_2px_4px_#1e1f23,inset_-2px_-2px_4px_#383b43]',
            ],
          ] : [
            // Main menu items - full neumorphic effect
            'shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.7)]',
            'dark:shadow-[3px_3px_6px_#1e1f23,-3px_-3px_6px_#383b43]',
            // Hover - raised
            'hover:shadow-[5px_5px_10px_rgba(163,177,198,0.5),-5px_-5px_10px_rgba(255,255,255,0.8)]',
            'dark:hover:shadow-[5px_5px_10px_#1e1f23,-5px_-5px_10px_#383b43]',
            'hover:-translate-y-0.5',
            // Active - pressed
            isActive && [
              'shadow-neu-in dark:shadow-neu-in-dark',
              'text-primary',
              'translate-y-0',
            ],
          ],
          // Text colors
          !isActive && 'text-slate-700 dark:text-slate-200',
          minimized && 'justify-center px-3'
        )
      }
      title={minimized ? item.name : undefined}
    >
      {item.icon && (
        <i
          className={cn(
            item.icon,
            'w-5 text-center transition-colors duration-200',
            isSubItem ? 'text-sm' : '',
            minimized && 'text-lg'
          )}
        />
      )}
      {!minimized && <span className="truncate">{item.name}</span>}
    </NavLink>
  );
}

export default Sidebar;
