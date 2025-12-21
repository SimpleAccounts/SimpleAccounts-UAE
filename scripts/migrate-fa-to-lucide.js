#!/usr/bin/env node

/**
 * Migration Script: Font Awesome to Lucide React Icons
 * 
 * This script automatically replaces Font Awesome icons with Lucide React equivalents
 * across the frontend codebase.
 * 
 * Usage: node scripts/migrate-fa-to-lucide.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Icon mapping: FA icon class -> Lucide component name
const ICON_MAP = {
  // Navigation & Actions
  'fa-bars': 'Menu',
  'fa-chevron-down': 'ChevronDown',
  'fa-chevron-up': 'ChevronUp',
  'fa-chevron-left': 'ChevronLeft',
  'fa-chevron-right': 'ChevronRight',
  'fa-arrow-left': 'ArrowLeft',
  'fa-arrow-right': 'ArrowRight',
  'fa-arrow-up': 'ArrowUp',
  'fa-arrow-down': 'ArrowDown',
  'fa-arrow-alt-circle-right': 'ArrowRightCircle',
  'fa-arrow-alt-circle-left': 'ArrowLeftCircle',
  'fa-angle-down': 'ChevronDown',
  'fa-angle-up': 'ChevronUp',
  'fa-angle-left': 'ChevronLeft',
  'fa-angle-right': 'ChevronRight',
  
  // Common Actions
  'fa-plus': 'Plus',
  'fa-minus': 'Minus',
  'fa-edit': 'Pencil',
  'fa-pencil': 'Pencil',
  'fa-trash': 'Trash2',
  'fa-trash-o': 'Trash2',
  'fa-delete': 'Trash2',
  'fa-close': 'X',
  'fa-times': 'X',
  'fa-times-circle': 'XCircle',
  'fa-check': 'Check',
  'fa-check-circle': 'CheckCircle',
  'fa-check-circle-o': 'CheckCircle',
  'fa-check-double': 'CheckCheck',
  'fa-copy': 'Copy',
  'fa-save': 'Save',
  'fa-download': 'Download',
  'fa-upload': 'Upload',
  'fa-refresh': 'RefreshCw',
  'fa-sync': 'RefreshCw',
  'fa-redo': 'Redo',
  'fa-undo': 'Undo',
  'fa-search': 'Search',
  'fa-filter': 'Filter',
  'fa-sort': 'ArrowUpDown',
  'fa-ban': 'Ban',
  'fa-send': 'Send',
  'fa-share': 'Share',
  'fa-link': 'Link',
  'fa-unlink': 'Unlink',
  'fa-external-link': 'ExternalLink',
  'fa-expand': 'Expand',
  'fa-compress': 'Shrink',
  
  // Files & Documents
  'fa-file': 'File',
  'fa-file-o': 'File',
  'fa-file-text': 'FileText',
  'fa-file-text-o': 'FileText',
  'fa-file-pdf': 'FileText',
  'fa-file-pdf-o': 'FileText',
  'fa-file-invoice': 'FileText',
  'fa-file-alt': 'FileText',
  'fa-folder': 'Folder',
  'fa-folder-open': 'FolderOpen',
  'fa-folder-plus': 'FolderPlus',
  
  // Users & People
  'fa-user': 'User',
  'fa-user-o': 'User',
  'fa-user-circle': 'UserCircle',
  'fa-user-plus': 'UserPlus',
  'fa-user-minus': 'UserMinus',
  'fa-user-times': 'UserX',
  'fa-user-check': 'UserCheck',
  'fa-user-tie': 'UserCircle',
  'fa-user-tag': 'UserCog',
  'fa-users': 'Users',
  'fa-id-card': 'IdCard',
  'fa-id-card-alt': 'IdCard',
  'fa-address-book': 'BookUser',
  'fa-address-card': 'Contact',
  
  // Business & Finance
  'fa-money': 'Banknote',
  'fa-money-bill': 'Banknote',
  'fa-money-check': 'Wallet',
  'fa-money-check-alt': 'Wallet',
  'fa-dollar': 'DollarSign',
  'fa-dollar-sign': 'DollarSign',
  'fa-credit-card': 'CreditCard',
  'fa-university': 'Landmark',
  'fa-bank': 'Landmark',
  'fa-building': 'Building2',
  'fa-briefcase': 'Briefcase',
  'fa-shopping-cart': 'ShoppingCart',
  'fa-cart-plus': 'ShoppingCart',
  'fa-receipt': 'Receipt',
  'fa-calculator': 'Calculator',
  'fa-percent': 'Percent',
  'fa-chart-line': 'LineChart',
  'fa-chart-bar': 'BarChart',
  'fa-chart-pie': 'PieChart',
  'fa-chart-area': 'AreaChart',
  'fa-area-chart': 'AreaChart',
  'fa-donate': 'HandCoins',
  'fa-exchange': 'ArrowLeftRight',
  'fa-exchange-alt': 'ArrowLeftRight',
  
  // Communication
  'fa-envelope': 'Mail',
  'fa-envelope-o': 'Mail',
  'fa-inbox': 'Inbox',
  'fa-paper-plane': 'Send',
  'fa-comment': 'MessageSquare',
  'fa-comments': 'MessageCircle',
  'fa-bell': 'Bell',
  'fa-phone': 'Phone',
  
  // UI Elements
  'fa-eye': 'Eye',
  'fa-eye-slash': 'EyeOff',
  'fa-cog': 'Settings',
  'fa-cogs': 'Settings',
  'fa-gear': 'Settings',
  'fa-gears': 'Settings',
  'fa-sliders': 'SlidersHorizontal',
  'fa-info': 'Info',
  'fa-info-circle': 'Info',
  'fa-question': 'HelpCircle',
  'fa-question-circle': 'HelpCircle',
  'fa-exclamation': 'AlertTriangle',
  'fa-exclamation-circle': 'AlertCircle',
  'fa-exclamation-triangle': 'AlertTriangle',
  'fa-warning': 'AlertTriangle',
  'fa-lock': 'Lock',
  'fa-unlock': 'Unlock',
  'fa-key': 'Key',
  'fa-shield': 'Shield',
  
  // Media & Display
  'fa-print': 'Printer',
  'fa-image': 'Image',
  'fa-picture-o': 'Image',
  'fa-camera': 'Camera',
  'fa-video': 'Video',
  'fa-play': 'Play',
  'fa-pause': 'Pause',
  'fa-stop': 'Square',
  
  // Time & Calendar
  'fa-calendar': 'Calendar',
  'fa-calendar-alt': 'Calendar',
  'fa-clock': 'Clock',
  'fa-clock-o': 'Clock',
  'fa-history': 'History',
  
  // Status & Indicators
  'fa-circle': 'Circle',
  'fa-dot-circle': 'CircleDot',
  'fa-dot-circle-o': 'CircleDot',
  'fa-spinner': 'Loader2',
  'fa-star': 'Star',
  'fa-star-o': 'Star',
  'fa-heart': 'Heart',
  'fa-heart-o': 'Heart',
  'fa-thumbs-up': 'ThumbsUp',
  'fa-thumbs-down': 'ThumbsDown',
  'fa-flag': 'Flag',
  
  // Misc
  'fa-home': 'Home',
  'fa-dashboard': 'LayoutDashboard',
  'fa-tachometer': 'Gauge',
  'fa-list': 'List',
  'fa-list-ul': 'List',
  'fa-list-ol': 'ListOrdered',
  'fa-th': 'LayoutGrid',
  'fa-th-large': 'LayoutGrid',
  'fa-table': 'Table',
  'fa-database': 'Database',
  'fa-server': 'Server',
  'fa-cloud': 'Cloud',
  'fa-cloud-upload': 'CloudUpload',
  'fa-cloud-download': 'CloudDownload',
  'fa-globe': 'Globe',
  'fa-map': 'Map',
  'fa-map-marker': 'MapPin',
  'fa-location-arrow': 'Navigation',
  'fa-tag': 'Tag',
  'fa-tags': 'Tags',
  'fa-bookmark': 'Bookmark',
  'fa-book': 'Book',
  'fa-graduation-cap': 'GraduationCap',
  'fa-trophy': 'Trophy',
  'fa-gift': 'Gift',
  'fa-magic': 'Wand2',
  'fa-lightbulb': 'Lightbulb',
  'fa-bolt': 'Zap',
  'fa-fire': 'Flame',
  'fa-leaf': 'Leaf',
  'fa-tree': 'TreeDeciduous',
  'fa-sun': 'Sun',
  'fa-moon': 'Moon',
  'fa-diamond': 'Diamond',
  'fa-gem': 'Gem',
  'fa-palette': 'Palette',
  'fa-paint-brush': 'Paintbrush',
  'fa-object-group': 'LayoutGrid',
  'fa-sitemap': 'Network',
  'fa-project-diagram': 'Network',
  'fa-boxes': 'Package',
  'fa-box': 'Package',
  'fa-cube': 'Box',
  'fa-cubes': 'Boxes',
  'fa-warehouse': 'Warehouse',
  'fa-hdd': 'HardDrive',
  'fa-hdd-o': 'HardDrive',
  'fa-sign-out': 'LogOut',
  'fa-sign-in': 'LogIn',
  'fa-power-off': 'Power',
  'fa-plug': 'Plug',
  'fa-stack-exchange': 'ArrowUpDown',
};

// Find all files with FA icons
function findFilesWithFAIcons(directory) {
  try {
    const result = execSync(
      `grep -rl "className=.*fa-" "${directory}" --include="*.js" --include="*.jsx" --include="*.tsx" --include="*.ts" 2>/dev/null || true`,
      { encoding: 'utf-8' }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch (e) {
    return [];
  }
}

// Extract all FA icons used in a file
function extractFAIcons(content) {
  const iconPattern = /fa[srb]?\s+fa-([a-z0-9-]+)/g;
  const icons = new Set();
  let match;
  while ((match = iconPattern.exec(content)) !== null) {
    icons.add(`fa-${match[1]}`);
  }
  return Array.from(icons);
}

// Get Lucide import name for FA icon
function getLucideIcon(faIcon) {
  return ICON_MAP[faIcon] || null;
}

// Generate Lucide imports statement
function generateLucideImports(icons) {
  const lucideIcons = icons
    .map(icon => getLucideIcon(icon))
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i); // unique

  if (lucideIcons.length === 0) return null;
  
  return `import { ${lucideIcons.join(', ')} } from 'lucide-react';`;
}

// Replace FA icon with Lucide in content
function replaceFAWithLucide(content) {
  let newContent = content;
  
  // Pattern to match FA icon elements with various formats
  const patterns = [
    // Self-closing with various FA prefixes
    /<i\s+className=["'](?:fa[srb]?\s+)?fa-([a-z0-9-]+)(?:\s+[^"']*)?["']\s*\/>/gi,
    // With closing tag
    /<i\s+className=["'](?:fa[srb]?\s+)?fa-([a-z0-9-]+)(?:\s+[^"']*)?["']\s*><\/i>/gi,
    // With nav-icon prefix
    /<i\s+className=["']nav-icon\s+(?:fa[srb]?\s+)?fa-([a-z0-9-]+)(?:\s+[^"']*)?["']\s*\/>/gi,
    /<i\s+className=["']nav-icon\s+(?:fa[srb]?\s+)?fa-([a-z0-9-]+)(?:\s+[^"']*)?["']\s*><\/i>/gi,
    // With ID attribute before className
    /<i\s+id="[^"]+"\s+className=["'](?:fa[srb]?\s+)?fa-([a-z0-9-]+)(?:\s+[^"']*)?["']\s*><\/i>/gi,
    /<i\s+id="[^"]+"\s+className=["'](?:fa[srb]?\s+)?fa-([a-z0-9-]+)(?:\s+[^"']*)?["']\s*\/>/gi,
  ];
  
  for (const pattern of patterns) {
    newContent = newContent.replace(pattern, (match, iconName) => {
      const lucideIcon = getLucideIcon(`fa-${iconName}`);
      if (lucideIcon) {
        // Check if original had an id attribute
        const idMatch = match.match(/id="([^"]+)"/);
        if (idMatch) {
          return `<${lucideIcon} id="${idMatch[1]}" className="h-4 w-4 inline" />`;
        }
        return `<${lucideIcon} className="h-4 w-4" />`;
      }
      return match; // Keep original if no mapping
    });
  }
  
  return newContent;
}

// Check if file already has Lucide import
function hasLucideImport(content) {
  return content.includes("from 'lucide-react'") || content.includes('from "lucide-react"');
}

// Add Lucide imports to file
function addLucideImports(content, icons) {
  const lucideIcons = icons
    .map(icon => getLucideIcon(icon))
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);
  
  if (lucideIcons.length === 0) return content;
  
  // If already has lucide import, merge
  if (hasLucideImport(content)) {
    const importMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
    if (importMatch) {
      const existingIcons = importMatch[1].split(',').map(s => s.trim());
      const allIcons = [...new Set([...existingIcons, ...lucideIcons])].sort();
      const newImport = `import { ${allIcons.join(', ')} } from 'lucide-react'`;
      return content.replace(importMatch[0], newImport);
    }
  }
  
  // Add new import after existing imports
  const importInsertPoint = content.search(/^import\s/m);
  if (importInsertPoint !== -1) {
    // Find end of imports section
    const lines = content.split('\n');
    let lastImportLine = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') || 
          (lines[i].includes("from '") && !lines[i].includes('export'))) {
        lastImportLine = i;
      }
    }
    
    const lucideImport = `import { ${lucideIcons.join(', ')} } from 'lucide-react';`;
    lines.splice(lastImportLine + 1, 0, lucideImport);
    return lines.join('\n');
  }
  
  return content;
}

// Process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Extract FA icons used
    const faIcons = extractFAIcons(content);
    if (faIcons.length === 0) return { file: filePath, changed: false };
    
    // Replace FA icons with Lucide components
    content = replaceFAWithLucide(content);
    
    // Add Lucide imports if content changed
    if (content !== originalContent) {
      content = addLucideImports(content, faIcons);
      fs.writeFileSync(filePath, content, 'utf-8');
      return { file: filePath, changed: true, icons: faIcons };
    }
    
    return { file: filePath, changed: false };
  } catch (error) {
    return { file: filePath, error: error.message };
  }
}

// Main execution
function main() {
  const srcDir = path.join(__dirname, '../apps/frontend/src');
  
  console.log('🔍 Finding files with Font Awesome icons...');
  const files = findFilesWithFAIcons(srcDir);
  console.log(`Found ${files.length} files with FA icons\n`);
  
  let changedCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    const result = processFile(file);
    if (result.error) {
      console.log(`❌ Error in ${result.file}: ${result.error}`);
      errorCount++;
    } else if (result.changed) {
      console.log(`✅ Updated: ${result.file}`);
      changedCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files updated: ${changedCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Skipped (no changes): ${files.length - changedCount - errorCount}`);
}

main();


