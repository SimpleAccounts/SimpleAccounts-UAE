import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Settings,
  BarChart3,
  Folder,
  Bell,
  LogOut,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Menu,
  X,
  Check,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Copy,
  Heart,
  Star,
  ArrowLeft,
  ArrowDown,
  RefreshCw,
  Loader,
  Clock,
  Globe,
  User,
  Lock,
  CreditCard,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  PieChart,
  Activity,
  Zap,
  Award,
  Gift,
  FileText,
  Maximize,
  Calculator,
  Receipt,
  Landmark,
  Hash,
  MessageSquare,
  Layers,
  Target,
  Briefcase,
  Wallet,
  Tag,
  Percent,
  ChevronsRight,
  ArrowUpRight,
  Terminal,
  Book,
  Palette,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';
import { StepWizard } from '@/components/ui/step-wizard';
import { SocialLoginButtons } from '@/components/ui/social-login-buttons';

import { Currency, Loader as AppLoader } from '@/components';

/*
 * SIMPLE ACCOUNTS - NEUMORPHISM UI COMPONENT LIBRARY
 */

const theme = {
  bg: '#e8eef5',
  shadowDark: '#c4c9cf',
  shadowLight: '#ffffff',
  primary: '#2064d8',
  primaryDark: '#1a4fa8',
  secondary: '#21d8aa',
  secondaryDark: '#00a67a',
  textPrimary: '#1e3a5f',
  textSecondary: '#3d5a80',
  textTertiary: '#6b8299',
  textMuted: '#98afc2',
  danger: '#ff4d6a',
  dangerDark: '#e6325a',
  warning: '#ffb020',
  warningDark: '#e69500',
};

const shadows = {
  raised: {
    xs: `2px 2px 4px ${theme.shadowDark}, -2px -2px 4px ${theme.shadowLight}`,
    sm: `3px 3px 6px ${theme.shadowDark}, -3px -3px 6px ${theme.shadowLight}`,
    md: `4px 4px 8px ${theme.shadowDark}, -4px -4px 8px ${theme.shadowLight}`,
    lg: `6px 6px 12px ${theme.shadowDark}, -6px -6px 12px ${theme.shadowLight}`,
    xl: `8px 8px 16px ${theme.shadowDark}, -8px -8px 16px ${theme.shadowLight}`,
  },
  inset: {
    xs: `inset 2px 2px 4px ${theme.shadowDark}, inset -2px -2px 4px ${theme.shadowLight}`,
    sm: `inset 3px 3px 6px ${theme.shadowDark}, inset -3px -3px 6px ${theme.shadowLight}`,
    md: `inset 4px 4px 8px ${theme.shadowDark}, inset -4px -4px 8px ${theme.shadowLight}`,
    lg: `inset 6px 6px 12px ${theme.shadowDark}, inset -6px -6px 12px ${theme.shadowLight}`,
  },
};

const gradients = {
  primary: `linear-gradient(145deg, ${theme.primary}, ${theme.primaryDark})`,
  secondary: `linear-gradient(145deg, ${theme.secondary}, ${theme.secondaryDark})`,
  danger: `linear-gradient(145deg, ${theme.danger}, ${theme.dangerDark})`,
  warning: `linear-gradient(145deg, ${theme.warning}, ${theme.warningDark})`,
};

// Code Block Component with Copy functionality
function CodeBlock({ code, language = 'jsx' }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-4 rounded-xl overflow-hidden" style={{ background: '#1e293b' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <span className="text-xs font-medium text-gray-400 uppercase">{language}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all"
          style={{
            background: copied ? theme.secondary : 'rgba(255,255,255,0.1)',
            color: copied ? 'white' : '#94a3b8',
          }}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" /> Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="text-gray-300">{code}</code>
      </pre>
    </div>
  );
}

// Documentation Block Component
function DocBlock({ description, children }) {
  return (
    <div className="mb-4">
      {description && (
        <p className="text-sm mb-4" style={{ color: theme.textTertiary }}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

function ComponentCard({ title, children, className = '', code, description }) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div
      className={`p-6 rounded-2xl mb-6 ${className}`}
      style={{ background: theme.bg, boxShadow: shadows.raised.lg }}
    >
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h3 className="font-semibold" style={{ color: theme.textPrimary }}>
            {title}
          </h3>
        )}
        {code && (
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: showCode ? theme.primary : theme.bg,
              boxShadow: showCode ? shadows.raised.sm : shadows.inset.xs,
              color: showCode ? 'white' : theme.textSecondary,
            }}
          >
            {showCode ? (
              <>
                <Eye className="w-3.5 h-3.5" /> Preview
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" /> Code
              </>
            )}
          </button>
        )}
      </div>
      {description && !showCode && (
        <p className="text-sm mb-4" style={{ color: theme.textTertiary }}>
          {description}
        </p>
      )}
      {showCode && code ? <CodeBlock code={code} /> : children}
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-2" style={{ color: theme.textPrimary }}>
        {title}
      </h1>
      {subtitle && <p style={{ color: theme.textTertiary }}>{subtitle}</p>}
    </div>
  );
}

// Collapsible Sidebar Demo Component
function CollapsibleSidebarDemo({ theme, shadows, gradients }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({ accounting: true, banking: true });
  const [selectedMenu, setSelectedMenu] = useState('banking');

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
    {
      id: 'accounting',
      icon: Calculator,
      label: 'Accounting',
      submenu: [
        { id: 'journal-entries', label: 'Journal Entries', icon: FileText },
        { id: 'transactions', label: 'Transactions', icon: Receipt },
        { id: 'chart-of-accounts', label: 'Chart of Accounts', icon: Clock },
      ],
    },
    {
      id: 'banking',
      icon: CreditCard,
      label: 'Banking',
      submenu: [
        { id: 'bank-accounts', label: 'Bank Accounts', icon: Landmark },
        { id: 'reconciliation', label: 'Reconciliation', icon: TrendingUp },
      ],
    },
    { id: 'contacts', icon: Users, label: 'Contacts', badge: 12 },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const toggleSubmenu = menuId => {
    setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const handleMenuClick = item => {
    if (item.submenu && item.submenu.length > 0) {
      toggleSubmenu(item.id);
    }
    setSelectedMenu(item.id);
  };

  return (
    <div className="flex rounded-2xl overflow-hidden" style={{ height: '550px' }}>
      {/* Collapsible Sidebar */}
      <aside
        className="flex flex-col transition-all duration-300 ease-in-out"
        style={{
          width: isCollapsed ? '72px' : '280px',
          background: theme.bg,
          boxShadow: shadows.raised.lg,
        }}
      >
        {/* Logo Section */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: theme.shadowDark }}
        >
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: gradients.primary, boxShadow: shadows.raised.sm }}
            >
              S
            </div>
            {!isCollapsed && (
              <span className="font-bold text-lg" style={{ color: theme.textPrimary }}>
                Simple<span style={{ color: theme.primary }}>Accounts</span>
              </span>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute right-0 top-16 translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10"
          style={{ background: theme.bg, boxShadow: shadows.raised.sm }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" style={{ color: theme.textSecondary }} />
          ) : (
            <ChevronLeft className="w-4 h-4" style={{ color: theme.textSecondary }} />
          )}
        </button>

        {/* Menu Items */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenus[item.id];
            const isSelected = selectedMenu === item.id;

            return (
              <div key={item.id}>
                {/* Main Menu Item */}
                <button
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 ${
                    isCollapsed ? 'justify-center' : ''
                  }`}
                  style={{
                    background: theme.bg,
                    boxShadow: isSelected ? 'none' : shadows.raised.sm,
                    border: isSelected ? `2px solid ${theme.warning}` : '2px solid transparent',
                    color: theme.textSecondary,
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  {/* Icon Container */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.raised.xs,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: theme.textSecondary }} />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span
                        className="flex-1 text-left font-medium text-sm"
                        style={{ color: theme.textPrimary }}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                          style={{ background: gradients.primary }}
                        >
                          {item.badge}
                        </span>
                      )}
                      {hasSubmenu && (
                        <ChevronUp
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`}
                          style={{ color: theme.textMuted }}
                        />
                      )}
                    </>
                  )}
                </button>

                {/* Submenu with Green Vertical Line */}
                {hasSubmenu && !isCollapsed && (
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: isExpanded ? `${item.submenu.length * 56}px` : '0',
                      opacity: isExpanded ? 1 : 0,
                    }}
                  >
                    <div className="flex mt-2">
                      {/* Green Vertical Line */}
                      <div
                        className="rounded-full ml-6 mr-3"
                        style={{ background: theme.secondary, width: '2px' }}
                      />
                      {/* Submenu Items */}
                      <div className="flex-1 space-y-2">
                        {item.submenu.map(subItem => {
                          const SubIcon = subItem.icon;
                          return (
                            <button
                              key={subItem.id}
                              className="w-full flex items-center gap-3 p-2 rounded-xl text-sm transition-all"
                              style={{
                                background: theme.bg,
                                boxShadow: shadows.raised.xs,
                              }}
                            >
                              {/* Submenu Icon Container */}
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: theme.bg,
                                  boxShadow: shadows.raised.xs,
                                }}
                              >
                                <SubIcon
                                  className="w-4 h-4"
                                  style={{ color: theme.textTertiary }}
                                />
                              </div>
                              <span style={{ color: theme.textSecondary }}>{subItem.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile */}
        {!isCollapsed && (
          <div className="p-3 border-t" style={{ borderColor: theme.shadowDark }}>
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: theme.bg, boxShadow: shadows.raised.sm }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ background: gradients.secondary }}
              >
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: theme.textPrimary }}>
                  John Doe
                </p>
                <p className="text-xs truncate" style={{ color: theme.textMuted }}>
                  Administrator
                </p>
              </div>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: theme.bg, boxShadow: shadows.raised.xs }}
              >
                <LogOut className="w-4 h-4" style={{ color: theme.danger }} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Demo Content Area */}
      <main className="flex-1 p-6 overflow-auto" style={{ background: `${theme.bg}88` }}>
        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-4 rounded-xl"
            style={{ background: theme.bg, boxShadow: shadows.raised.md }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${theme.primary}20` }}
              >
                <DollarSign className="w-5 h-5" style={{ color: theme.primary }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Revenue
                </p>
                <p className="font-bold" style={{ color: theme.textPrimary }}>
                  $24,500
                </p>
              </div>
            </div>
          </div>
          <div
            className="p-4 rounded-xl"
            style={{ background: theme.bg, boxShadow: shadows.raised.md }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${theme.secondary}20` }}
              >
                <TrendingUp className="w-5 h-5" style={{ color: theme.secondary }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Growth
                </p>
                <p className="font-bold" style={{ color: theme.textPrimary }}>
                  +23%
                </p>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-center" style={{ color: theme.textMuted }}>
          Click the arrow button to collapse/expand the sidebar
        </p>
      </main>
    </div>
  );
}

export default function ComponentLibrary() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [checked, setChecked] = useState(true);
  const [toggle, setToggle] = useState(true);
  const [radioValue, setRadioValue] = useState('option1');
  const [sliderValue, setSliderValue] = useState(60);
  const [activeTab, setActiveTab] = useState(0);
  const [accordionOpen, setAccordionOpen] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('default');
  const [tooltipVisible, setTooltipVisible] = useState(null);
  const [counter, setCounter] = useState({ users: 0, revenue: 0, orders: 0 });
  const [cartItems] = useState([
    { id: 1, name: 'Wireless Headphones', price: 89.99, qty: 1, image: '🎧' },
    { id: 2, name: 'Smart Watch', price: 199.99, qty: 2, image: '⌚' },
  ]);

  const sections = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'buttons', label: 'Buttons', icon: Zap },
    { id: 'forms', label: 'Forms', icon: Edit },
    { id: 'cards', label: 'Cards', icon: CreditCard },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'navigation', label: 'Navigation', icon: Menu },
    { id: 'tables', label: 'Tables', icon: BarChart3 },
    { id: 'charts', label: 'Charts', icon: PieChart },
    { id: 'progress', label: 'Progress', icon: Activity },
    { id: 'avatars', label: 'Avatars', icon: User },
    { id: 'modals', label: 'Modals', icon: Maximize },
    { id: 'tooltips', label: 'Tooltips', icon: Info },
    { id: 'iconboxes', label: 'Icon Boxes', icon: Gift },
    { id: 'counters', label: 'Counters', icon: Hash },
    { id: 'ecommerce', label: 'E-Commerce', icon: ShoppingCart },
    { id: 'app-components', label: 'App Components', icon: Layers },
    { id: 'typography', label: 'Typography', icon: FileText },
    { id: 'misc', label: 'Misc', icon: Package },
  ];

  // Chart Data
  const lineData = [
    { name: 'Jan', value: 4000, value2: 2400 },
    { name: 'Feb', value: 3000, value2: 1398 },
    { name: 'Mar', value: 2000, value2: 9800 },
    { name: 'Apr', value: 2780, value2: 3908 },
    { name: 'May', value: 1890, value2: 4800 },
    { name: 'Jun', value: 2390, value2: 3800 },
  ];

  const barData = [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 2000 },
    { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 1890 },
  ];

  const pieData = [
    { name: 'Direct', value: 400 },
    { name: 'Social', value: 300 },
    { name: 'Referral', value: 200 },
    { name: 'Organic', value: 100 },
  ];
  const pieColors = [theme.primary, theme.secondary, theme.warning, theme.danger];

  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', status: 'Inactive' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: theme.bg }}>
      {/* Sidebar */}
      <nav className="w-56 p-4 flex-shrink-0 overflow-y-auto" style={{ background: theme.bg }}>
        <div
          className="flex items-center gap-2 px-3 py-3 rounded-xl mb-6"
          style={{ background: theme.bg, boxShadow: shadows.raised.md }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: gradients.primary }}
          >
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div className="flex items-baseline">
            <span style={{ color: theme.primary }} className="font-bold text-sm">
              Simple
            </span>
            <span style={{ color: theme.secondary }} className="font-bold text-sm">
              UI
            </span>
          </div>
        </div>

        {/* Back to Dashboard Button */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl mb-4 transition-all duration-200"
          style={{
            background: theme.bg,
            boxShadow: shadows.raised.sm,
            color: theme.primary,
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        <div className="space-y-1">
          {sections.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left"
                style={
                  isActive
                    ? {
                        background: theme.bg,
                        boxShadow: shadows.inset.sm,
                        color: theme.primary,
                      }
                    : {
                        color: theme.textSecondary,
                      }
                }
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl">
          {/* OVERVIEW SECTION */}
          {activeSection === 'overview' && (
            <div>
              <SectionTitle
                title="SimpleAccounts Neumorphism UI"
                subtitle="A comprehensive design system based on soft UI principles"
              />

              <ComponentCard title="Getting Started">
                <div className="prose max-w-none">
                  <p className="mb-4" style={{ color: theme.textSecondary }}>
                    This component library implements Neumorphism (Soft UI) design, which creates
                    depth through subtle shadows rather than flat colors or heavy borders. Every
                    component uses a two-shadow system for a realistic 3D effect.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{ background: theme.bg, boxShadow: shadows.raised.md }}
                    >
                      <Palette className="w-8 h-8 mx-auto mb-2" style={{ color: theme.primary }} />
                      <h4 className="font-semibold mb-1" style={{ color: theme.textPrimary }}>
                        Soft Shadows
                      </h4>
                      <p className="text-sm" style={{ color: theme.textTertiary }}>
                        Dual light/dark shadows create depth
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{ background: theme.bg, boxShadow: shadows.raised.md }}
                    >
                      <Layers className="w-8 h-8 mx-auto mb-2" style={{ color: theme.secondary }} />
                      <h4 className="font-semibold mb-1" style={{ color: theme.textPrimary }}>
                        Raised & Pressed
                      </h4>
                      <p className="text-sm" style={{ color: theme.textTertiary }}>
                        Elements pop out or sink in
                      </p>
                    </div>
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{ background: theme.bg, boxShadow: shadows.raised.md }}
                    >
                      <Target className="w-8 h-8 mx-auto mb-2" style={{ color: theme.warning }} />
                      <h4 className="font-semibold mb-1" style={{ color: theme.textPrimary }}>
                        Consistent BG
                      </h4>
                      <p className="text-sm" style={{ color: theme.textTertiary }}>
                        Same background across components
                      </p>
                    </div>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Theme Configuration"
                description="Copy this theme object to use the neumorphic design system in your components."
                code={`// Theme colors
const theme = {
  bg: '#e8eef5',           // Main background
  shadowDark: '#c4c9cf',   // Dark shadow color
  shadowLight: '#ffffff',  // Light shadow color
  primary: '#2064d8',      // Primary brand color
  primaryDark: '#1a4fa8',  // Primary gradient end
  secondary: '#21d8aa',    // Success/secondary
  danger: '#ff4d6a',       // Error/danger
  warning: '#ffb020',      // Warning
  textPrimary: '#1e3a5f',  // Main text
  textSecondary: '#3d5a80', // Secondary text
  textTertiary: '#6b8299', // Muted text
  textMuted: '#98afc2',    // Very muted text
};

// Shadow definitions
const shadows = {
  raised: {
    xs: \`2px 2px 4px \${theme.shadowDark}, -2px -2px 4px \${theme.shadowLight}\`,
    sm: \`3px 3px 6px \${theme.shadowDark}, -3px -3px 6px \${theme.shadowLight}\`,
    md: \`4px 4px 8px \${theme.shadowDark}, -4px -4px 8px \${theme.shadowLight}\`,
    lg: \`6px 6px 12px \${theme.shadowDark}, -6px -6px 12px \${theme.shadowLight}\`,
    xl: \`8px 8px 16px \${theme.shadowDark}, -8px -8px 16px \${theme.shadowLight}\`,
  },
  inset: {
    xs: \`inset 2px 2px 4px \${theme.shadowDark}, inset -2px -2px 4px \${theme.shadowLight}\`,
    sm: \`inset 3px 3px 6px \${theme.shadowDark}, inset -3px -3px 6px \${theme.shadowLight}\`,
    md: \`inset 4px 4px 8px \${theme.shadowDark}, inset -4px -4px 8px \${theme.shadowLight}\`,
    lg: \`inset 6px 6px 12px \${theme.shadowDark}, inset -6px -6px 12px \${theme.shadowLight}\`,
  },
};

// Gradients for colored elements
const gradients = {
  primary: \`linear-gradient(145deg, \${theme.primary}, \${theme.primaryDark})\`,
  secondary: \`linear-gradient(145deg, \${theme.secondary}, \${theme.secondaryDark})\`,
  danger: \`linear-gradient(145deg, \${theme.danger}, \${theme.dangerDark})\`,
  warning: \`linear-gradient(145deg, \${theme.warning}, \${theme.warningDark})\`,
};`}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      Color Palette
                    </h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Primary', color: theme.primary },
                        { name: 'Secondary', color: theme.secondary },
                        { name: 'Danger', color: theme.danger },
                        { name: 'Warning', color: theme.warning },
                        { name: 'Background', color: theme.bg },
                      ].map(item => (
                        <div key={item.name} className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg"
                            style={{ background: item.color, boxShadow: shadows.raised.xs }}
                          />
                          <span className="text-sm" style={{ color: theme.textSecondary }}>
                            {item.name}
                          </span>
                          <code
                            className="text-xs px-2 py-1 rounded"
                            style={{ background: theme.bg, boxShadow: shadows.inset.xs }}
                          >
                            {item.color}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      Shadow Levels
                    </h4>
                    <div className="space-y-3">
                      {['xs', 'sm', 'md', 'lg'].map(size => (
                        <div key={size} className="flex items-center gap-3">
                          <div
                            className="w-12 h-8 rounded-lg"
                            style={{ background: theme.bg, boxShadow: shadows.raised[size] }}
                          />
                          <span className="text-sm" style={{ color: theme.textSecondary }}>
                            raised.{size}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Tailwind CSS Integration"
                description="Use these custom Tailwind classes defined in tailwind.config.js for neumorphic styling."
                code={`// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        'neu-raised-sm': '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
        'neu-raised': '6px 6px 12px #c4c9cf, -6px -6px 12px #ffffff',
        'neu-raised-lg': '10px 10px 20px #c4c9cf, -10px -10px 20px #ffffff',
        'neu-pressed-sm': 'inset 2px 2px 4px #c4c9cf, inset -2px -2px 4px #ffffff',
        'neu-pressed': 'inset 3px 3px 6px #c4c9cf, inset -3px -3px 6px #ffffff',
        'neu-btn': '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
        'neu-input': 'inset 2px 2px 4px #c4c9cf, inset -2px -2px 4px #ffffff',
      },
      colors: {
        neu: {
          bg: '#e8eef5',
          'shadow-dark': '#c4c9cf',
          'shadow-light': '#ffffff',
        }
      }
    }
  }
}

// Usage in components:
<button className="shadow-neu-raised hover:shadow-neu-raised-lg">
  Raised Button
</button>

<input className="shadow-neu-input focus:shadow-neu-pressed" />

<div className="bg-neu-bg shadow-neu-raised rounded-xl p-4">
  Card Content
</div>`}
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <div
                      className="px-4 py-2 rounded-xl text-sm"
                      style={{ background: theme.bg, boxShadow: shadows.raised.sm }}
                    >
                      <code style={{ color: theme.primary }}>shadow-neu-raised</code>
                    </div>
                    <div
                      className="px-4 py-2 rounded-xl text-sm"
                      style={{ background: theme.bg, boxShadow: shadows.inset.sm }}
                    >
                      <code style={{ color: theme.primary }}>shadow-neu-pressed</code>
                    </div>
                    <div
                      className="px-4 py-2 rounded-xl text-sm"
                      style={{ background: theme.bg, boxShadow: shadows.raised.xs }}
                    >
                      <code style={{ color: theme.primary }}>bg-neu-bg</code>
                    </div>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Basic Usage Pattern"
                description="The fundamental pattern for creating neumorphic components."
                code={`// Basic Neumorphic Component Pattern
function NeuCard({ children }) {
  return (
    <div
      className="p-6 rounded-xl"
      style={{
        background: '#e8eef5',
        boxShadow: '6px 6px 12px #c4c9cf, -6px -6px 12px #ffffff',
      }}
    >
      {children}
    </div>
  );
}

// Interactive Button with States
function NeuButton({ children, onClick }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className="px-5 py-2.5 rounded-xl font-medium transition-all"
      style={{
        background: '#e8eef5',
        boxShadow: pressed
          ? 'inset 3px 3px 6px #c4c9cf, inset -3px -3px 6px #ffffff'
          : '4px 4px 8px #c4c9cf, -4px -4px 8px #ffffff',
      }}
    >
      {children}
    </button>
  );
}

// Input Field
function NeuInput({ ...props }) {
  return (
    <input
      className="px-4 py-2.5 rounded-xl outline-none w-full"
      style={{
        background: '#e8eef5',
        boxShadow: 'inset 2px 2px 4px #c4c9cf, inset -2px -2px 4px #ffffff',
        color: '#1e3a5f',
      }}
      {...props}
    />
  );
}`}
              >
                <div className="space-y-4">
                  <p className="text-sm" style={{ color: theme.textTertiary }}>
                    Click the &quot;Code&quot; button above to see implementation examples for
                    cards, buttons, and inputs.
                  </p>
                  <div className="flex gap-4 items-center">
                    <div
                      className="p-4 rounded-xl flex-1"
                      style={{ background: theme.bg, boxShadow: shadows.raised.md }}
                    >
                      <span style={{ color: theme.textSecondary }}>Raised Card</span>
                    </div>
                    <div
                      className="p-4 rounded-xl flex-1"
                      style={{ background: theme.bg, boxShadow: shadows.inset.md }}
                    >
                      <span style={{ color: theme.textSecondary }}>Pressed Card</span>
                    </div>
                  </div>
                </div>
              </ComponentCard>
            </div>
          )}

          {/* BUTTONS SECTION */}
          {activeSection === 'buttons' && (
            <div>
              <SectionTitle title="Buttons" subtitle="Various button styles and states" />

              <ComponentCard
                title="Raised Buttons"
                description="Raised buttons create a 3D effect using dual shadows (dark + light). Use for primary actions that need visual prominence."
                code={`// Default Raised Button
<button
  className="px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
  style={{
    background: '#e8eef5',
    boxShadow: '4px 4px 8px #c4c9cf, -4px -4px 8px #ffffff',
    color: '#3d5a80',
  }}
>
  Default
</button>

// Primary Raised Button
<button
  className="px-5 py-2.5 rounded-xl font-medium text-white transition-all hover:scale-105"
  style={{
    background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
    boxShadow: '4px 4px 8px #c4c9cf, -4px -4px 8px #ffffff',
  }}
>
  Primary
</button>

// Using Tailwind with custom shadows
<button className="px-5 py-2.5 rounded-xl font-medium text-white
  bg-gradient-to-br from-blue-500 to-blue-700
  shadow-neu-raised hover:shadow-neu-raised-lg transition-all">
  Primary
</button>`}
              >
                <div className="flex flex-wrap gap-3">
                  <button
                    className="px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.raised.md,
                      color: theme.textSecondary,
                    }}
                  >
                    Default
                  </button>
                  <button
                    className="px-5 py-2.5 rounded-xl font-medium text-white transition-all hover:scale-105"
                    style={{ background: gradients.primary, boxShadow: shadows.raised.md }}
                  >
                    Primary
                  </button>
                  <button
                    className="px-5 py-2.5 rounded-xl font-medium text-white transition-all hover:scale-105"
                    style={{ background: gradients.secondary, boxShadow: shadows.raised.md }}
                  >
                    Secondary
                  </button>
                  <button
                    className="px-5 py-2.5 rounded-xl font-medium text-white transition-all hover:scale-105"
                    style={{ background: gradients.danger, boxShadow: shadows.raised.md }}
                  >
                    Danger
                  </button>
                  <button
                    className="px-5 py-2.5 rounded-xl font-medium text-white transition-all hover:scale-105"
                    style={{ background: gradients.warning, boxShadow: shadows.raised.md }}
                  >
                    Warning
                  </button>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Pressed/Inset Buttons"
                description="Inset buttons appear pushed into the surface using inner shadows. Use for active/selected states or toggle buttons."
                code={`// Pressed/Inset Button
<button
  className="px-5 py-2.5 rounded-xl font-medium"
  style={{
    background: '#e8eef5',
    boxShadow: 'inset 3px 3px 6px #c4c9cf, inset -3px -3px 6px #ffffff',
    color: '#2064d8',
  }}
>
  Pressed
</button>

// Toggle button pattern (pressed when active)
const [isActive, setIsActive] = useState(false);

<button
  onClick={() => setIsActive(!isActive)}
  style={{
    background: '#e8eef5',
    boxShadow: isActive
      ? 'inset 3px 3px 6px #c4c9cf, inset -3px -3px 6px #ffffff'
      : '4px 4px 8px #c4c9cf, -4px -4px 8px #ffffff',
  }}
>
  {isActive ? 'Active' : 'Inactive'}
</button>`}
              >
                <div className="flex flex-wrap gap-3">
                  <button
                    className="px-5 py-2.5 rounded-xl font-medium"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.inset.sm,
                      color: theme.primary,
                    }}
                  >
                    Pressed
                  </button>
                  <button
                    className="px-5 py-2.5 rounded-xl font-medium"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.inset.sm,
                      color: theme.secondary,
                    }}
                  >
                    Active
                  </button>
                </div>
              </ComponentCard>

              <ComponentCard title="Outline Buttons">
                <div className="flex flex-wrap gap-3">
                  <button
                    className="px-5 py-2.5 rounded-xl font-medium border-2"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.raised.sm,
                      color: theme.primary,
                      borderColor: theme.primary,
                    }}
                  >
                    Primary
                  </button>
                  <button
                    className="px-5 py-2.5 rounded-xl font-medium border-2"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.raised.sm,
                      color: theme.secondary,
                      borderColor: theme.secondary,
                    }}
                  >
                    Secondary
                  </button>
                </div>
              </ComponentCard>

              <ComponentCard title="Button Sizes">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="px-3 py-1.5 rounded-lg font-medium text-xs text-white"
                    style={{ background: gradients.primary, boxShadow: shadows.raised.xs }}
                  >
                    X-Small
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium text-sm text-white"
                    style={{ background: gradients.primary, boxShadow: shadows.raised.sm }}
                  >
                    Small
                  </button>
                  <button
                    className="px-5 py-2.5 rounded-xl font-medium text-white"
                    style={{ background: gradients.primary, boxShadow: shadows.raised.md }}
                  >
                    Medium
                  </button>
                  <button
                    className="px-7 py-3.5 rounded-xl font-medium text-lg text-white"
                    style={{ background: gradients.primary, boxShadow: shadows.raised.lg }}
                  >
                    Large
                  </button>
                </div>
              </ComponentCard>

              <ComponentCard title="Icon Buttons">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="w-10 h-10 rounded-xl flex items-center justify-center hover:scale-105"
                    style={{ background: theme.bg, boxShadow: shadows.raised.md }}
                  >
                    <Plus className="w-5 h-5" style={{ color: theme.textTertiary }} />
                  </button>
                  <button
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:scale-105"
                    style={{ background: gradients.primary, boxShadow: shadows.raised.md }}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:scale-105"
                    style={{ background: gradients.secondary, boxShadow: shadows.raised.md }}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:scale-105"
                    style={{ background: gradients.danger, boxShadow: shadows.raised.md }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105"
                    style={{ background: theme.bg, boxShadow: shadows.raised.md }}
                  >
                    <Heart className="w-5 h-5" style={{ color: theme.danger }} />
                  </button>
                </div>
              </ComponentCard>

              <ComponentCard title="Buttons with Icons">
                <div className="flex flex-wrap gap-3">
                  <button
                    className="px-4 py-2.5 rounded-xl font-medium text-white flex items-center gap-2"
                    style={{ background: gradients.primary, boxShadow: shadows.raised.md }}
                  >
                    <Plus className="w-4 h-4" /> Add New
                  </button>
                  <button
                    className="px-4 py-2.5 rounded-xl font-medium text-white flex items-center gap-2"
                    style={{ background: gradients.secondary, boxShadow: shadows.raised.md }}
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button
                    className="px-4 py-2.5 rounded-xl font-medium flex items-center gap-2"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.raised.md,
                      color: theme.textSecondary,
                    }}
                  >
                    Settings <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </ComponentCard>

              <ComponentCard title="Button States">
                <div className="flex flex-wrap gap-3">
                  <button
                    className="px-5 py-2.5 rounded-xl font-medium text-white"
                    style={{ background: gradients.primary, boxShadow: shadows.raised.md }}
                  >
                    Normal
                  </button>
                  <button
                    className="px-5 py-2.5 rounded-xl font-medium text-white opacity-50 cursor-not-allowed"
                    style={{ background: gradients.primary, boxShadow: shadows.raised.md }}
                    disabled
                  >
                    Disabled
                  </button>
                  <button
                    className="px-5 py-2.5 rounded-xl font-medium text-white flex items-center gap-2"
                    style={{ background: gradients.primary, boxShadow: shadows.raised.md }}
                  >
                    <Loader className="w-4 h-4 animate-spin" /> Loading
                  </button>
                </div>
              </ComponentCard>

              <ComponentCard title="Button Groups">
                <div className="flex flex-wrap gap-6">
                  <div
                    className="inline-flex rounded-xl overflow-hidden"
                    style={{ boxShadow: shadows.raised.md }}
                  >
                    <button
                      className="px-4 py-2 font-medium text-white"
                      style={{ background: gradients.primary }}
                    >
                      Left
                    </button>
                    <button
                      className="px-4 py-2 font-medium"
                      style={{ background: theme.bg, color: theme.textSecondary }}
                    >
                      Middle
                    </button>
                    <button
                      className="px-4 py-2 font-medium"
                      style={{ background: theme.bg, color: theme.textSecondary }}
                    >
                      Right
                    </button>
                  </div>

                  <div
                    className="inline-flex rounded-xl p-1"
                    style={{ background: theme.bg, boxShadow: shadows.inset.sm }}
                  >
                    <button
                      className="px-4 py-2 rounded-lg font-medium text-white"
                      style={{ background: gradients.primary }}
                    >
                      Day
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg font-medium"
                      style={{ color: theme.textSecondary }}
                    >
                      Week
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg font-medium"
                      style={{ color: theme.textSecondary }}
                    >
                      Month
                    </button>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Shared UI Component (Shadcn)"
                description="Standard Button component used throughout the application."
                code={`import { Button } from '@/components/ui/button';

<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Plus className="h-4 w-4" /></Button>`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default">Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </ComponentCard>
            </div>
          )}

          {/* FORMS SECTION */}
          {activeSection === 'forms' && (
            <div>
              <SectionTitle
                title="Form Elements"
                subtitle="Inputs, checkboxes, toggles, and more"
              />

              <ComponentCard
                title="Text Inputs"
                description="Neumorphic inputs use inset shadows to appear pressed into the surface, creating a natural input field effect."
                code={`// Basic Inset Input
<input
  type="text"
  placeholder="Enter text..."
  className="w-full px-4 py-3 rounded-xl outline-none"
  style={{
    background: '#e8eef5',
    boxShadow: 'inset 3px 3px 6px #c4c9cf, inset -3px -3px 6px #ffffff',
    color: '#1e3a5f',
  }}
/>

// Input with Icon
<div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
    style={{ color: '#98afc2' }} />
  <input
    type="text"
    placeholder="Search..."
    className="w-full pl-12 pr-4 py-3 rounded-xl outline-none"
    style={{
      background: '#e8eef5',
      boxShadow: 'inset 3px 3px 6px #c4c9cf, inset -3px -3px 6px #ffffff',
      color: '#1e3a5f',
    }}
  />
</div>

// Raised Input (alternative style)
<input
  type="text"
  placeholder="Raised style..."
  className="w-full px-4 py-3 rounded-xl outline-none"
  style={{
    background: '#e8eef5',
    boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
    color: '#1e3a5f',
  }}
/>`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.textSecondary }}
                    >
                      Default Input
                    </label>
                    <input
                      type="text"
                      placeholder="Enter text..."
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{
                        background: theme.bg,
                        boxShadow: shadows.inset.sm,
                        color: theme.textPrimary,
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.textSecondary }}
                    >
                      With Icon
                    </label>
                    <div className="relative">
                      <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                        style={{ color: theme.textMuted }}
                      />
                      <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl outline-none"
                        style={{
                          background: theme.bg,
                          boxShadow: shadows.inset.sm,
                          color: theme.textPrimary,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.textSecondary }}
                    >
                      Raised Input
                    </label>
                    <input
                      type="text"
                      placeholder="Raised style..."
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{
                        background: theme.bg,
                        boxShadow: shadows.raised.sm,
                        color: theme.textPrimary,
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.textSecondary }}
                    >
                      Disabled
                    </label>
                    <input
                      type="text"
                      placeholder="Disabled..."
                      disabled
                      className="w-full px-4 py-3 rounded-xl outline-none opacity-60 cursor-not-allowed"
                      style={{
                        background: theme.bg,
                        boxShadow: shadows.inset.sm,
                        color: theme.textMuted,
                      }}
                    />
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Input States">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.textSecondary }}
                    >
                      Success
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value="Valid input"
                        readOnly
                        className="w-full px-4 py-3 rounded-xl outline-none border-2"
                        style={{
                          background: theme.bg,
                          boxShadow: shadows.inset.sm,
                          color: theme.textPrimary,
                          borderColor: theme.secondary,
                        }}
                      />
                      <CheckCircle
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5"
                        style={{ color: theme.secondary }}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.textSecondary }}
                    >
                      Error
                    </label>
                    <input
                      type="text"
                      value="Invalid input"
                      readOnly
                      className="w-full px-4 py-3 rounded-xl outline-none border-2"
                      style={{
                        background: theme.bg,
                        boxShadow: shadows.inset.sm,
                        color: theme.textPrimary,
                        borderColor: theme.danger,
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: theme.danger }}>
                      This field is required
                    </p>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.textSecondary }}
                    >
                      Warning
                    </label>
                    <input
                      type="text"
                      value="Check this"
                      readOnly
                      className="w-full px-4 py-3 rounded-xl outline-none border-2"
                      style={{
                        background: theme.bg,
                        boxShadow: shadows.inset.sm,
                        color: theme.textPrimary,
                        borderColor: theme.warning,
                      }}
                    />
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Textarea">
                <textarea
                  placeholder="Enter your message..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                  style={{
                    background: theme.bg,
                    boxShadow: shadows.inset.sm,
                    color: theme.textPrimary,
                  }}
                />
              </ComponentCard>

              <ComponentCard
                title="Select Dropdown"
                description="Custom styled select with a raised appearance and dropdown arrow icon."
                code={`// Select Dropdown with Custom Arrow
<div className="relative w-64">
  <select
    className="w-full px-4 py-3 rounded-xl outline-none appearance-none cursor-pointer"
    style={{
      background: '#e8eef5',
      boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
      color: '#1e3a5f',
    }}
  >
    <option>Select an option</option>
    <option>Option 1</option>
    <option>Option 2</option>
    <option>Option 3</option>
  </select>
  <ChevronDown
    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
    style={{ color: '#98afc2' }}
  />
</div>`}
              >
                <div className="relative w-64">
                  <select
                    className="w-full px-4 py-3 rounded-xl outline-none appearance-none cursor-pointer"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.raised.sm,
                      color: theme.textPrimary,
                    }}
                  >
                    <option>Select an option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                    style={{ color: theme.textMuted }}
                  />
                </div>
              </ComponentCard>

              <ComponentCard
                title="Checkboxes"
                description="Custom neumorphic checkboxes that toggle between raised (unchecked) and gradient-filled (checked) states."
                code={`const [checked, setChecked] = useState(false);

// Neumorphic Checkbox
<label className="flex items-center gap-3 cursor-pointer">
  <div
    onClick={() => setChecked(!checked)}
    className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
    style={checked
      ? {
          background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
          boxShadow: '2px 2px 4px #c4c9cf, -2px -2px 4px #ffffff'
        }
      : {
          background: '#e8eef5',
          boxShadow: 'inset 2px 2px 4px #c4c9cf, inset -2px -2px 4px #ffffff'
        }
    }
  >
    {checked && <Check className="w-4 h-4 text-white" />}
  </div>
  <span style={{ color: '#3d5a80' }}>Label text</span>
</label>`}
              >
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setChecked(!checked)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                      style={
                        checked
                          ? { background: gradients.primary, boxShadow: shadows.raised.xs }
                          : { background: theme.bg, boxShadow: shadows.inset.xs }
                      }
                    >
                      {checked && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span style={{ color: theme.textSecondary }}>Checked</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      className="w-6 h-6 rounded-lg"
                      style={{ background: theme.bg, boxShadow: shadows.inset.xs }}
                    />
                    <span style={{ color: theme.textSecondary }}>Unchecked</span>
                  </label>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Radio Buttons"
                description="Neumorphic radio buttons with a centered dot indicator for the selected state."
                code={`const [radioValue, setRadioValue] = useState('option1');

// Radio Button
<label className="flex items-center gap-3 cursor-pointer">
  <div
    onClick={() => setRadioValue('option1')}
    className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
    style={radioValue === 'option1'
      ? {
          background: '#e8eef5',
          boxShadow: '2px 2px 4px #c4c9cf, -2px -2px 4px #ffffff',
          border: '2px solid #2064d8',
        }
      : {
          background: '#e8eef5',
          boxShadow: 'inset 2px 2px 4px #c4c9cf, inset -2px -2px 4px #ffffff'
        }
    }
  >
    {radioValue === 'option1' && (
      <div
        className="w-3 h-3 rounded-full"
        style={{ background: 'linear-gradient(145deg, #2064d8, #1a4fa8)' }}
      />
    )}
  </div>
  <span style={{ color: '#3d5a80' }}>Option 1</span>
</label>`}
              >
                <div className="flex flex-wrap gap-6">
                  {['option1', 'option2', 'option3'].map((option, i) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => setRadioValue(option)}
                        className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                        style={
                          radioValue === option
                            ? {
                                background: theme.bg,
                                boxShadow: shadows.raised.xs,
                                border: `2px solid ${theme.primary}`,
                              }
                            : { background: theme.bg, boxShadow: shadows.inset.xs }
                        }
                      >
                        {radioValue === option && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ background: gradients.primary }}
                          />
                        )}
                      </div>
                      <span style={{ color: theme.textSecondary }}>Option {i + 1}</span>
                    </label>
                  ))}
                </div>
              </ComponentCard>

              <ComponentCard
                title="Toggle Switches"
                description="Smooth animated toggle switches with sliding knob. The track changes from inset to gradient when active."
                code={`const [toggle, setToggle] = useState(false);

// Toggle Switch
<label className="flex items-center gap-3 cursor-pointer">
  <div
    onClick={() => setToggle(!toggle)}
    className="w-14 h-8 rounded-full p-1 transition-all duration-300"
    style={{
      background: toggle
        ? 'linear-gradient(145deg, #2064d8, #1a4fa8)'
        : '#e8eef5',
      boxShadow: toggle
        ? '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff'
        : 'inset 3px 3px 6px #c4c9cf, inset -3px -3px 6px #ffffff',
    }}
  >
    <div
      className="w-6 h-6 rounded-full transition-all duration-300"
      style={{
        background: '#e8eef5',
        boxShadow: '2px 2px 4px #c4c9cf, -2px -2px 4px #ffffff',
        transform: toggle ? 'translateX(24px)' : 'translateX(0)',
      }}
    />
  </div>
  <span style={{ color: '#3d5a80' }}>{toggle ? 'On' : 'Off'}</span>
</label>`}
              >
                <div className="flex flex-wrap gap-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setToggle(!toggle)}
                      className="w-14 h-8 rounded-full p-1 transition-all duration-300"
                      style={{
                        background: toggle ? gradients.primary : theme.bg,
                        boxShadow: toggle ? shadows.raised.sm : shadows.inset.sm,
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-full transition-all duration-300"
                        style={{
                          background: theme.bg,
                          boxShadow: shadows.raised.xs,
                          transform: toggle ? 'translateX(24px)' : 'translateX(0)',
                        }}
                      />
                    </div>
                    <span style={{ color: theme.textSecondary }}>{toggle ? 'On' : 'Off'}</span>
                  </label>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Range Slider"
                description="Custom range slider with gradient fill and draggable knob. Uses a hidden native input for accessibility."
                code={`const [sliderValue, setSliderValue] = useState(60);

// Range Slider
<div>
  <div className="flex justify-between mb-2">
    <label className="text-sm font-medium" style={{ color: '#3d5a80' }}>
      Volume
    </label>
    <span className="text-sm font-medium" style={{ color: '#2064d8' }}>
      {sliderValue}%
    </span>
  </div>
  <div
    className="relative h-3 rounded-full"
    style={{
      background: '#e8eef5',
      boxShadow: 'inset 2px 2px 4px #c4c9cf, inset -2px -2px 4px #ffffff'
    }}
  >
    {/* Filled track */}
    <div
      className="absolute h-full rounded-full"
      style={{
        background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
        width: \`\${sliderValue}%\`
      }}
    />
    {/* Hidden input for accessibility */}
    <input
      type="range"
      min="0"
      max="100"
      value={sliderValue}
      onChange={(e) => setSliderValue(Number(e.target.value))}
      className="absolute w-full h-full opacity-0 cursor-pointer"
    />
    {/* Slider knob */}
    <div
      className="absolute w-6 h-6 rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2"
      style={{
        background: '#e8eef5',
        boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
        left: \`\${sliderValue}%\`,
        border: '2px solid #2064d8',
      }}
    />
  </div>
</div>`}
              >
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                      Volume
                    </label>
                    <span className="text-sm font-medium" style={{ color: theme.primary }}>
                      {sliderValue}%
                    </span>
                  </div>
                  <div
                    className="relative h-3 rounded-full"
                    style={{ background: theme.bg, boxShadow: shadows.inset.xs }}
                  >
                    <div
                      className="absolute h-full rounded-full"
                      style={{ background: gradients.primary, width: `${sliderValue}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderValue}
                      onChange={e => setSliderValue(Number(e.target.value))}
                      className="absolute w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                      className="absolute w-6 h-6 rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2"
                      style={{
                        background: theme.bg,
                        boxShadow: shadows.raised.sm,
                        left: `${sliderValue}%`,
                        border: `2px solid ${theme.primary}`,
                      }}
                    />
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="File Upload">
                <div
                  className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer"
                  style={{ borderColor: theme.textMuted, background: theme.bg }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: theme.bg, boxShadow: shadows.raised.md }}
                  >
                    <Upload className="w-8 h-8" style={{ color: theme.primary }} />
                  </div>
                  <p className="font-medium mb-1" style={{ color: theme.textPrimary }}>
                    Drop files here or click to upload
                  </p>
                  <p className="text-sm" style={{ color: theme.textMuted }}>
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Shared Form Components (Shadcn)"
                description="Standard Input, Select, Checkbox, and Switch components."
                code={`import { Input } from '@/components/ui/input';
import { Select, ... } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';

<Input placeholder="Standard Input" />
<Textarea placeholder="Standard Textarea" />

<Select>
  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms</Label>
</div>

<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Airplane Mode</Label>
</div>

<RadioGroup defaultValue="option-one">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-one" id="option-one" />
    <Label htmlFor="option-one">Option One</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-two" id="option-two" />
    <Label htmlFor="option-two">Option Two</Label>
  </div>
</RadioGroup>

<PasswordStrengthMeter password="password123" />`}
              >
                <div className="grid gap-6 max-w-sm">
                  <div className="grid gap-2">
                    <Label>Input</Label>
                    <Input placeholder="Standard Input" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Textarea</Label>
                    <Textarea placeholder="Standard Textarea" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Select</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Option 1</SelectItem>
                        <SelectItem value="2">Option 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">Accept terms</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="airplane-mode" />
                    <Label htmlFor="airplane-mode">Airplane Mode</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label>Radio Group</Label>
                    <RadioGroup defaultValue="option-one">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option-one" id="option-one" />
                        <Label htmlFor="option-one">Option One</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option-two" id="option-two" />
                        <Label htmlFor="option-two">Option Two</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="grid gap-2">
                    <Label>Password Strength</Label>
                    <PasswordStrengthMeter password="password123" />
                  </div>
                </div>
              </ComponentCard>
            </div>
          )}

          {/* CARDS SECTION */}
          {activeSection === 'cards' && (
            <div>
              <SectionTitle title="Cards" subtitle="Various card styles for content display" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div
                  className="p-6 rounded-2xl"
                  style={{ background: theme.bg, boxShadow: shadows.raised.lg }}
                >
                  <h3 className="font-semibold mb-2" style={{ color: theme.textPrimary }}>
                    Raised Card
                  </h3>
                  <p className="text-sm" style={{ color: theme.textTertiary }}>
                    Standard elevated card with shadows.
                  </p>
                </div>
                <div
                  className="p-6 rounded-2xl"
                  style={{ background: theme.bg, boxShadow: shadows.inset.md }}
                >
                  <h3 className="font-semibold mb-2" style={{ color: theme.textPrimary }}>
                    Inset Card
                  </h3>
                  <p className="text-sm" style={{ color: theme.textTertiary }}>
                    Pressed/sunken appearance card.
                  </p>
                </div>
                <div
                  className="p-6 rounded-2xl border-2"
                  style={{ background: theme.bg, borderColor: theme.shadowDark }}
                >
                  <h3 className="font-semibold mb-2" style={{ color: theme.textPrimary }}>
                    Flat Card
                  </h3>
                  <p className="text-sm" style={{ color: theme.textTertiary }}>
                    Simple bordered card, no shadows.
                  </p>
                </div>
              </div>

              <ComponentCard
                title="Stats Cards"
                description="Compact statistics cards with icon, value, label, and trend indicator."
                code={`// Stats Card Component
<div
  className="p-4 rounded-xl"
  style={{
    background: '#e8eef5',
    boxShadow: '4px 4px 8px #c4c9cf, -4px -4px 8px #ffffff'
  }}
>
  <div className="flex items-center justify-between mb-3">
    {/* Icon container */}
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center"
      style={{
        background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
        boxShadow: '2px 2px 4px #c4c9cf, -2px -2px 4px #ffffff'
      }}
    >
      <DollarSign className="w-5 h-5 text-white" />
    </div>
    {/* Trend indicator */}
    <span
      className="text-xs font-medium"
      style={{ color: '#21d8aa' }} // Green for positive, red for negative
    >
      +12%
    </span>
  </div>
  <p className="text-xs mb-1" style={{ color: '#98afc2' }}>
    Revenue
  </p>
  <p className="text-xl font-bold" style={{ color: '#1e3a5f' }}>
    $24,500
  </p>
</div>`}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      icon: DollarSign,
                      label: 'Revenue',
                      value: '$24,500',
                      trend: '+12%',
                      gradient: gradients.primary,
                    },
                    {
                      icon: Users,
                      label: 'Users',
                      value: '1,234',
                      trend: '+8%',
                      gradient: gradients.secondary,
                    },
                    {
                      icon: ShoppingCart,
                      label: 'Orders',
                      value: '456',
                      trend: '-3%',
                      gradient: gradients.warning,
                    },
                    {
                      icon: TrendingUp,
                      label: 'Growth',
                      value: '23%',
                      trend: '+5%',
                      gradient: gradients.danger,
                    },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={i}
                        className="p-4 rounded-xl"
                        style={{ background: theme.bg, boxShadow: shadows.raised.md }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: stat.gradient, boxShadow: shadows.raised.xs }}
                          >
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span
                            className="text-xs font-medium"
                            style={{
                              color: stat.trend.includes('+') ? theme.secondary : theme.danger,
                            }}
                          >
                            {stat.trend}
                          </span>
                        </div>
                        <p className="text-xs mb-1" style={{ color: theme.textMuted }}>
                          {stat.label}
                        </p>
                        <p className="text-xl font-bold" style={{ color: theme.textPrimary }}>
                          {stat.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </ComponentCard>

              <ComponentCard
                title="Profile Card"
                description="User profile cards with avatar, name, role, and action buttons."
                code={`// Profile Card
<div
  className="w-64 p-6 rounded-2xl text-center"
  style={{
    background: '#e8eef5',
    boxShadow: '6px 6px 12px #c4c9cf, -6px -6px 12px #ffffff'
  }}
>
  {/* Avatar */}
  <div
    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white"
    style={{
      background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
      boxShadow: '4px 4px 8px #c4c9cf, -4px -4px 8px #ffffff'
    }}
  >
    JD
  </div>
  <h3 className="font-semibold text-lg mb-1" style={{ color: '#1e3a5f' }}>
    John Doe
  </h3>
  <p className="text-sm mb-4" style={{ color: '#98afc2' }}>
    Product Designer
  </p>
  {/* Action buttons */}
  <div className="flex justify-center gap-3">
    <button
      className="px-4 py-2 rounded-lg text-sm font-medium text-white"
      style={{
        background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
        boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff'
      }}
    >
      Follow
    </button>
    <button
      className="px-4 py-2 rounded-lg text-sm font-medium"
      style={{
        background: '#e8eef5',
        boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
        color: '#3d5a80',
      }}
    >
      Message
    </button>
  </div>
</div>`}
              >
                <div className="flex flex-wrap gap-6">
                  <div
                    className="w-64 p-6 rounded-2xl text-center"
                    style={{ background: theme.bg, boxShadow: shadows.raised.lg }}
                  >
                    <div
                      className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white"
                      style={{ background: gradients.primary, boxShadow: shadows.raised.md }}
                    >
                      JD
                    </div>
                    <h3 className="font-semibold text-lg mb-1" style={{ color: theme.textPrimary }}>
                      John Doe
                    </h3>
                    <p className="text-sm mb-4" style={{ color: theme.textMuted }}>
                      Product Designer
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                        style={{ background: gradients.primary, boxShadow: shadows.raised.sm }}
                      >
                        Follow
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                        style={{
                          background: theme.bg,
                          boxShadow: shadows.raised.sm,
                          color: theme.textSecondary,
                        }}
                      >
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Pricing Cards">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: 'Basic',
                      price: '$9',
                      features: ['5 Projects', '10GB Storage', 'Email Support'],
                    },
                    {
                      name: 'Pro',
                      price: '$29',
                      features: ['Unlimited Projects', '100GB Storage', 'Priority Support'],
                      featured: true,
                    },
                    {
                      name: 'Enterprise',
                      price: '$99',
                      features: ['Everything in Pro', 'Dedicated Server', '24/7 Support'],
                    },
                  ].map((plan, i) => (
                    <div
                      key={i}
                      className={`p-6 rounded-2xl ${plan.featured ? 'ring-2' : ''}`}
                      style={{
                        background: theme.bg,
                        boxShadow: shadows.raised.lg,
                        ringColor: plan.featured ? theme.primary : undefined,
                      }}
                    >
                      {plan.featured && (
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-4"
                          style={{ background: gradients.primary }}
                        >
                          Popular
                        </span>
                      )}
                      <h3
                        className="text-lg font-semibold mb-2"
                        style={{ color: theme.textPrimary }}
                      >
                        {plan.name}
                      </h3>
                      <p className="text-3xl font-bold mb-4" style={{ color: theme.primary }}>
                        {plan.price}
                        <span className="text-sm font-normal" style={{ color: theme.textMuted }}>
                          /mo
                        </span>
                      </p>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, fi) => (
                          <li
                            key={fi}
                            className="flex items-center gap-2 text-sm"
                            style={{ color: theme.textSecondary }}
                          >
                            <Check className="w-4 h-4" style={{ color: theme.secondary }} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <button
                        className="w-full py-2.5 rounded-xl font-medium"
                        style={{
                          background: plan.featured ? gradients.primary : theme.bg,
                          boxShadow: shadows.raised.md,
                          color: plan.featured ? 'white' : theme.textSecondary,
                        }}
                      >
                        Choose Plan
                      </button>
                    </div>
                  ))}
                </div>
              </ComponentCard>

              <ComponentCard
                title="Shared Card Component (Shadcn)"
                description="Standard Card component."
                code={`import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

<Card className="w-[350px]">
  <CardHeader>
    <CardTitle>Create project</CardTitle>
    <CardDescription>Deploy your new project in one-click.</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Deploy</Button>
  </CardFooter>
</Card>`}
              >
                <div className="flex justify-center">
                  <Card className="w-[350px]">
                    <CardHeader>
                      <CardTitle>Create project</CardTitle>
                      <CardDescription>Deploy your new project in one-click.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" placeholder="Name of your project" />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <Label htmlFor="framework">Framework</Label>
                          <Select>
                            <SelectTrigger id="framework">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectItem value="next">Next.js</SelectItem>
                              <SelectItem value="sveltekit">SvelteKit</SelectItem>
                              <SelectItem value="astro">Astro</SelectItem>
                              <SelectItem value="nuxt">Nuxt.js</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">Cancel</Button>
                      <Button>Deploy</Button>
                    </CardFooter>
                  </Card>
                </div>
              </ComponentCard>
            </div>
          )}

          {/* ALERTS SECTION */}
          {activeSection === 'alerts' && (
            <div>
              <SectionTitle
                title="Alerts & Notifications"
                subtitle="Alert boxes and toast notifications"
              />

              <ComponentCard
                title="Alert Boxes"
                description="Neumorphic alert boxes with colored left border and icon indicator for different status types."
                code={`// Alert Box with Left Border
<div
  className="flex items-start gap-4 p-4 rounded-xl"
  style={{
    background: '#e8eef5',
    boxShadow: '4px 4px 8px #c4c9cf, -4px -4px 8px #ffffff',
    borderLeft: '4px solid #2064d8', // primary=blue, secondary=green, warning=yellow, danger=red
  }}
>
  {/* Icon container with transparent background */}
  <div
    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
    style={{ background: '#2064d820' }} // 20% opacity of the color
  >
    <Info className="w-5 h-5" style={{ color: '#2064d8' }} />
  </div>
  <div className="flex-1">
    <h4 className="font-semibold mb-1" style={{ color: '#1e3a5f' }}>
      Information
    </h4>
    <p className="text-sm" style={{ color: '#6b8299' }}>
      This is an informational alert message.
    </p>
  </div>
  {/* Dismiss button */}
  <button>
    <X className="w-5 h-5" style={{ color: '#98afc2' }} />
  </button>
</div>

// Alert variants:
// Info: borderLeft: '4px solid #2064d8', icon color: '#2064d8'
// Success: borderLeft: '4px solid #21d8aa', icon color: '#21d8aa'
// Warning: borderLeft: '4px solid #ffb020', icon color: '#ffb020'
// Error: borderLeft: '4px solid #ff4d6a', icon color: '#ff4d6a'`}
              >
                <div className="space-y-4">
                  {[
                    {
                      icon: Info,
                      title: 'Information',
                      desc: 'This is an informational alert.',
                      color: theme.primary,
                    },
                    {
                      icon: CheckCircle,
                      title: 'Success',
                      desc: 'Your action was completed successfully!',
                      color: theme.secondary,
                    },
                    {
                      icon: AlertTriangle,
                      title: 'Warning',
                      desc: 'Please review this important warning.',
                      color: theme.warning,
                    },
                    {
                      icon: XCircle,
                      title: 'Error',
                      desc: 'Something went wrong. Please try again.',
                      color: theme.danger,
                    },
                  ].map((alert, i) => {
                    const Icon = alert.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-4 p-4 rounded-xl"
                        style={{
                          background: theme.bg,
                          boxShadow: shadows.raised.md,
                          borderLeft: `4px solid ${alert.color}`,
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${alert.color}20` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: alert.color }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1" style={{ color: theme.textPrimary }}>
                            {alert.title}
                          </h4>
                          <p className="text-sm" style={{ color: theme.textTertiary }}>
                            {alert.desc}
                          </p>
                        </div>
                        <button>
                          <X className="w-5 h-5" style={{ color: theme.textMuted }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </ComponentCard>

              <ComponentCard
                title="Toast Notifications"
                description="Compact toast messages for quick feedback. Shows status icon with message."
                code={`// Success Toast
<div
  className="flex items-center gap-3 px-4 py-3 rounded-xl min-w-56"
  style={{
    background: '#e8eef5',
    boxShadow: '6px 6px 12px #c4c9cf, -6px -6px 12px #ffffff'
  }}
>
  <div
    className="w-8 h-8 rounded-full flex items-center justify-center"
    style={{ background: 'linear-gradient(145deg, #21d8aa, #00a67a)' }}
  >
    <Check className="w-4 h-4 text-white" />
  </div>
  <span className="font-medium text-sm" style={{ color: '#1e3a5f' }}>
    Saved successfully!
  </span>
</div>

// Error Toast
<div
  className="flex items-center gap-3 px-4 py-3 rounded-xl min-w-56"
  style={{
    background: '#e8eef5',
    boxShadow: '6px 6px 12px #c4c9cf, -6px -6px 12px #ffffff'
  }}
>
  <div
    className="w-8 h-8 rounded-full flex items-center justify-center"
    style={{ background: 'linear-gradient(145deg, #ff4d6a, #e6325a)' }}
  >
    <X className="w-4 h-4 text-white" />
  </div>
  <span className="font-medium text-sm" style={{ color: '#1e3a5f' }}>
    Error occurred!
  </span>
</div>`}
              >
                <div className="flex flex-wrap gap-4">
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl min-w-56"
                    style={{ background: theme.bg, boxShadow: shadows.raised.lg }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: gradients.secondary }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-sm" style={{ color: theme.textPrimary }}>
                      Saved successfully!
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl min-w-56"
                    style={{ background: theme.bg, boxShadow: shadows.raised.lg }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: gradients.danger }}
                    >
                      <X className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-sm" style={{ color: theme.textPrimary }}>
                      Error occurred!
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl min-w-56"
                    style={{ background: theme.bg, boxShadow: shadows.raised.lg }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: gradients.primary }}
                    >
                      <Loader className="w-4 h-4 text-white animate-spin" />
                    </div>
                    <span className="font-medium text-sm" style={{ color: theme.textPrimary }}>
                      Processing...
                    </span>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Filled Notifications">
                <div className="space-y-3">
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg text-white"
                    style={{ background: gradients.primary }}
                  >
                    <Info className="w-5 h-5" /> This is an info notification
                  </div>
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg text-white"
                    style={{ background: gradients.secondary }}
                  >
                    <CheckCircle className="w-5 h-5" /> This is a success notification
                  </div>
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg text-white"
                    style={{ background: gradients.warning }}
                  >
                    <AlertTriangle className="w-5 h-5" /> This is a warning notification
                  </div>
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg text-white"
                    style={{ background: gradients.danger }}
                  >
                    <XCircle className="w-5 h-5" /> This is an error notification
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Shared Alert Component (Shadcn)"
                description="Standard Alert component."
                code={`import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

<Alert>
  <Terminal className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the cli.
  </AlertDescription>
</Alert>`}
              >
                <Alert>
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Heads up!</AlertTitle>
                  <AlertDescription>
                    You can add components to your app using the cli.
                  </AlertDescription>
                </Alert>
              </ComponentCard>
            </div>
          )}

          {/* BADGES SECTION */}
          {activeSection === 'badges' && (
            <div>
              <SectionTitle title="Badges & Tags" subtitle="Labels, badges, and tag components" />

              <ComponentCard
                title="Solid Badges"
                description="Gradient-filled badges with rounded pill shape. Great for status indicators and labels."
                code={`// Solid Gradient Badge
<span
  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
  style={{ background: 'linear-gradient(145deg, #2064d8, #1a4fa8)' }}
>
  Primary
</span>

// Success Badge
<span
  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
  style={{ background: 'linear-gradient(145deg, #21d8aa, #00a67a)' }}
>
  Success
</span>

// Neumorphic Badge (no gradient)
<span
  className="px-3 py-1 rounded-full text-xs font-semibold"
  style={{
    background: '#e8eef5',
    boxShadow: '2px 2px 4px #c4c9cf, -2px -2px 4px #ffffff',
    color: '#3d5a80',
  }}
>
  Default
</span>`}
              >
                <div className="flex flex-wrap gap-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: gradients.primary }}
                  >
                    Primary
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: gradients.secondary }}
                  >
                    Secondary
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: gradients.danger }}
                  >
                    Danger
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: gradients.warning }}
                  >
                    Warning
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.raised.xs,
                      color: theme.textSecondary,
                    }}
                  >
                    Default
                  </span>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Soft Badges"
                description="Badges with transparent background (20% opacity) and colored text. Lighter visual weight."
                code={`// Soft Badge with transparent background
<span
  className="px-3 py-1 rounded-full text-xs font-semibold"
  style={{
    background: '#2064d820', // 20% opacity of primary color
    color: '#2064d8',
  }}
>
  Primary
</span>

// Success Soft Badge
<span
  className="px-3 py-1 rounded-full text-xs font-semibold"
  style={{
    background: '#21d8aa20',
    color: '#21d8aa',
  }}
>
  Success
</span>`}
              >
                <div className="flex flex-wrap gap-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: `${theme.primary}20`, color: theme.primary }}
                  >
                    Primary
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: `${theme.secondary}20`, color: theme.secondary }}
                  >
                    Success
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: `${theme.danger}20`, color: theme.danger }}
                  >
                    Danger
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: `${theme.warning}20`, color: theme.warning }}
                  >
                    Warning
                  </span>
                </div>
              </ComponentCard>

              <ComponentCard title="Neumorphic Badges">
                <div className="flex flex-wrap gap-3">
                  <span
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.raised.sm,
                      color: theme.primary,
                    }}
                  >
                    Raised
                  </span>
                  <span
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.inset.xs,
                      color: theme.secondary,
                    }}
                  >
                    Inset
                  </span>
                </div>
              </ComponentCard>

              <ComponentCard title="Badges with Icons">
                <div className="flex flex-wrap gap-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: gradients.secondary }}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: gradients.primary }}
                  >
                    <Star className="w-3.5 h-3.5" /> Featured
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: gradients.danger }}
                  >
                    <Zap className="w-3.5 h-3.5" /> Hot
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: gradients.warning }}
                  >
                    <Clock className="w-3.5 h-3.5" /> Pending
                  </span>
                </div>
              </ComponentCard>

              <ComponentCard title="Status Dots">
                <div className="flex flex-wrap gap-6">
                  <span
                    className="inline-flex items-center gap-2 text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: theme.secondary }}
                    ></span>
                    Online
                  </span>
                  <span
                    className="inline-flex items-center gap-2 text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: theme.warning }}
                    ></span>
                    Away
                  </span>
                  <span
                    className="inline-flex items-center gap-2 text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: theme.danger }}
                    ></span>
                    Busy
                  </span>
                  <span
                    className="inline-flex items-center gap-2 text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: theme.textMuted }}
                    ></span>
                    Offline
                  </span>
                </div>
              </ComponentCard>

              <ComponentCard title="Tags">
                <div className="flex flex-wrap gap-2">
                  {['React', 'JavaScript', 'TypeScript', 'Node.js'].map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                      style={{
                        background: theme.bg,
                        boxShadow: shadows.raised.sm,
                        color: theme.textSecondary,
                      }}
                    >
                      {tag}
                      <X
                        className="w-3.5 h-3.5 cursor-pointer"
                        style={{ color: theme.textMuted }}
                      />
                    </span>
                  ))}
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.inset.xs,
                      color: theme.primary,
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Shared Badge Component (Shadcn)"
                description="Standard Badge component."
                code={`import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>`}
              >
                <div className="flex gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </ComponentCard>
            </div>
          )}

          {/* NAVIGATION SECTION */}
          {activeSection === 'navigation' && (
            <div>
              <SectionTitle
                title="Navigation"
                subtitle="Sidebar, tabs, breadcrumbs, and pagination"
              />

              <ComponentCard
                title="Collapsible Sidebar"
                code={`// Collapsible Sidebar Component Demo
function CollapsibleSidebarDemo({ theme, shadows, gradients }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <aside
      className="flex flex-col transition-all duration-300 ease-in-out"
      style={{
        width: isCollapsed ? '72px' : '280px',
        background: theme.bg,
        boxShadow: shadows.raised.lg,
      }}
    >
      {/* Header / Logo */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.shadowDark }}>
         {/* Logo content... */}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-0 top-16 translate-x-1/2 w-6 h-6 rounded-full..."
      >
        <ChevronRight />
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {/* Menu items... */}
      </nav>
    </aside>
  );
}`}
              >
                <p className="text-sm mb-4" style={{ color: theme.textTertiary }}>
                  A fully responsive collapsible sidebar with nested submenus, badges, and user
                  profile section. Click the arrow button on the edge to collapse/expand.
                </p>
                <div className="relative">
                  <CollapsibleSidebarDemo theme={theme} shadows={shadows} gradients={gradients} />
                </div>
              </ComponentCard>

              <ComponentCard
                title="Tabs"
                description="Neumorphic tab navigation with raised inactive tabs and gradient-filled active tab."
                code={`const [activeTab, setActiveTab] = useState(0);
const tabs = ['Overview', 'Analytics', 'Reports', 'Settings'];

// Tab Navigation
<div className="flex gap-2">
  {tabs.map((tab, i) => (
    <button
      key={i}
      onClick={() => setActiveTab(i)}
      className="px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
      style={activeTab === i
        ? {
            background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
            boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
            color: 'white',
          }
        : {
            background: '#e8eef5',
            boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
            color: '#3d5a80',
          }
      }
    >
      {tab}
    </button>
  ))}
</div>`}
              >
                <div className="space-y-6">
                  <div className="flex gap-2">
                    {['Overview', 'Analytics', 'Reports', 'Settings'].map((tab, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveTab(i)}
                        className="px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
                        style={
                          activeTab === i
                            ? {
                                background: gradients.primary,
                                boxShadow: shadows.raised.sm,
                                color: 'white',
                              }
                            : {
                                background: theme.bg,
                                boxShadow: shadows.raised.sm,
                                color: theme.textSecondary,
                              }
                        }
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Breadcrumbs"
                description="Simple navigation breadcrumbs with links separated by chevron icons."
                code={`// Breadcrumb Navigation
<nav className="flex items-center gap-2 text-sm">
  <a href="/home" style={{ color: '#2064d8' }}>
    Home
  </a>
  <ChevronRight className="w-4 h-4" style={{ color: '#98afc2' }} />
  <a href="/products" style={{ color: '#2064d8' }}>
    Products
  </a>
  <ChevronRight className="w-4 h-4" style={{ color: '#98afc2' }} />
  <span style={{ color: '#3d5a80' }}>Electronics</span>
</nav>`}
              >
                <nav className="flex items-center gap-2 text-sm">
                  <a href="#" style={{ color: theme.primary }}>
                    Home
                  </a>
                  <ChevronRight className="w-4 h-4" style={{ color: theme.textMuted }} />
                  <a href="#" style={{ color: theme.primary }}>
                    Products
                  </a>
                  <ChevronRight className="w-4 h-4" style={{ color: theme.textMuted }} />
                  <span style={{ color: theme.textSecondary }}>Electronics</span>
                </nav>
              </ComponentCard>

              <ComponentCard
                title="Pagination"
                description="Page navigation with raised number buttons. Active page has gradient background."
                code={`const [currentPage, setCurrentPage] = useState(2);
const pages = [1, 2, 3, '...', 10];

// Pagination Controls
<div className="flex items-center gap-2">
  {/* Previous button */}
  <button
    className="w-10 h-10 rounded-xl flex items-center justify-center"
    style={{
      background: '#e8eef5',
      boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
      color: '#3d5a80',
    }}
  >
    <ChevronLeft className="w-5 h-5" />
  </button>

  {/* Page numbers */}
  {pages.map((page, i) => (
    <button
      key={i}
      onClick={() => typeof page === 'number' && setCurrentPage(page)}
      className="w-10 h-10 rounded-xl flex items-center justify-center font-medium text-sm"
      style={page === currentPage
        ? {
            background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
            boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
            color: 'white',
          }
        : {
            background: '#e8eef5',
            boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
            color: '#3d5a80',
          }
      }
    >
      {page}
    </button>
  ))}

  {/* Next button */}
  <button
    className="w-10 h-10 rounded-xl flex items-center justify-center"
    style={{
      background: '#e8eef5',
      boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
      color: '#3d5a80',
    }}
  >
    <ChevronRight className="w-5 h-5" />
  </button>
</div>`}
              >
                <div className="flex items-center gap-2">
                  <button
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.raised.sm,
                      color: theme.textSecondary,
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {[1, 2, 3, '...', 10].map((page, i) => (
                    <button
                      key={i}
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-medium text-sm"
                      style={
                        page === 2
                          ? {
                              background: gradients.primary,
                              boxShadow: shadows.raised.sm,
                              color: 'white',
                            }
                          : {
                              background: theme.bg,
                              boxShadow: shadows.raised.sm,
                              color: theme.textSecondary,
                            }
                      }
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.raised.sm,
                      color: theme.textSecondary,
                    }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Shared Navigation Components (Shadcn)"
                description="Standard Breadcrumb, Tabs, and Dropdown Menu components."
                code={`import { Breadcrumb, ... } from '@/components/ui/breadcrumb';
import { Tabs, ... } from '@/components/ui/tabs';
import { DropdownMenu, ... } from '@/components/ui/dropdown-menu';

// Breadcrumb
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current Page</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>

// Tabs
<Tabs defaultValue="account" className="w-[400px]">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Make changes to your account here.</TabsContent>
  <TabsContent value="password">Change your password here.</TabsContent>
</Tabs>

// Dropdown Menu
<DropdownMenu>
  <DropdownMenuTrigger><Button>Open Menu</Button></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
              >
                <div className="flex flex-col gap-8">
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Breadcrumb</h4>
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/components">Components</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium">Tabs</h4>
                    <Tabs defaultValue="account" className="w-[400px]">
                      <TabsList>
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                      </TabsList>
                      <TabsContent value="account">Make changes to your account here.</TabsContent>
                      <TabsContent value="password">Change your password here.</TabsContent>
                    </Tabs>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium">Dropdown Menu</h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Open Menu</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem>Team</DropdownMenuItem>
                        <DropdownMenuItem>Subscription</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </ComponentCard>
            </div>
          )}

          {/* TABLES SECTION */}
          {activeSection === 'tables' && (
            <div>
              <SectionTitle title="Tables" subtitle="Data tables with various styles" />

              <ComponentCard
                title="Basic Table"
                description="Neumorphic data table with inset container, hover states, and action buttons."
                code={`const tableData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', status: 'Inactive' },
];

// Neumorphic Table
<div
  className="rounded-xl overflow-hidden"
  style={{
    background: '#e8eef5',
    boxShadow: 'inset 3px 3px 6px #c4c9cf, inset -3px -3px 6px #ffffff'
  }}
>
  <table className="w-full">
    <thead>
      <tr style={{ borderBottom: '2px solid #c4c9cf' }}>
        <th className="text-left px-4 py-3 font-semibold text-sm" style={{ color: '#1e3a5f' }}>
          Name
        </th>
        <th className="text-left px-4 py-3 font-semibold text-sm" style={{ color: '#1e3a5f' }}>
          Status
        </th>
        <th className="text-left px-4 py-3 font-semibold text-sm" style={{ color: '#1e3a5f' }}>
          Actions
        </th>
      </tr>
    </thead>
    <tbody>
      {tableData.map((row) => (
        <tr key={row.id} style={{ borderBottom: '1px solid #c4c9cf' }}>
          <td className="px-4 py-3 text-sm" style={{ color: '#3d5a80' }}>
            {row.name}
          </td>
          <td className="px-4 py-3">
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                background: row.status === 'Active' ? '#21d8aa20' : '#ff4d6a20',
                color: row.status === 'Active' ? '#21d8aa' : '#ff4d6a',
              }}
            >
              {row.status}
            </span>
          </td>
          <td className="px-4 py-3">
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: '#e8eef5',
                boxShadow: '2px 2px 4px #c4c9cf, -2px -2px 4px #ffffff'
              }}
            >
              <Edit className="w-4 h-4" style={{ color: '#2064d8' }} />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>`}
              >
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ background: theme.bg, boxShadow: shadows.inset.sm }}
                >
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${theme.shadowDark}` }}>
                        <th
                          className="text-left px-4 py-3 font-semibold text-sm"
                          style={{ color: theme.textPrimary }}
                        >
                          Name
                        </th>
                        <th
                          className="text-left px-4 py-3 font-semibold text-sm"
                          style={{ color: theme.textPrimary }}
                        >
                          Email
                        </th>
                        <th
                          className="text-left px-4 py-3 font-semibold text-sm"
                          style={{ color: theme.textPrimary }}
                        >
                          Role
                        </th>
                        <th
                          className="text-left px-4 py-3 font-semibold text-sm"
                          style={{ color: theme.textPrimary }}
                        >
                          Status
                        </th>
                        <th
                          className="text-left px-4 py-3 font-semibold text-sm"
                          style={{ color: theme.textPrimary }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, i) => (
                        <tr
                          key={row.id}
                          style={{
                            borderBottom:
                              i < tableData.length - 1 ? `1px solid ${theme.shadowDark}` : 'none',
                          }}
                        >
                          <td className="px-4 py-3 text-sm" style={{ color: theme.textSecondary }}>
                            {row.name}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: theme.textTertiary }}>
                            {row.email}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: theme.textSecondary }}>
                            {row.role}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                background:
                                  row.status === 'Active'
                                    ? `${theme.secondary}20`
                                    : `${theme.danger}20`,
                                color: row.status === 'Active' ? theme.secondary : theme.danger,
                              }}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: theme.bg, boxShadow: shadows.raised.xs }}
                              >
                                <Edit className="w-4 h-4" style={{ color: theme.primary }} />
                              </button>
                              <button
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: theme.bg, boxShadow: shadows.raised.xs }}
                              >
                                <Trash2 className="w-4 h-4" style={{ color: theme.danger }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Shared Table Component (Shadcn)"
                description="Standard Table component."
                code={`import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>`}
              >
                <Table>
                  <TableCaption>A list of your recent invoices.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Invoice</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">INV001</TableCell>
                      <TableCell>Paid</TableCell>
                      <TableCell>Credit Card</TableCell>
                      <TableCell className="text-right">$250.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">INV002</TableCell>
                      <TableCell>Pending</TableCell>
                      <TableCell>PayPal</TableCell>
                      <TableCell className="text-right">$150.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </ComponentCard>
            </div>
          )}

          {/* CHARTS SECTION */}
          {activeSection === 'charts' && (
            <div>
              <SectionTitle title="Charts & Graphs" subtitle="Data visualization components" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ComponentCard title="Line Chart">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.shadowDark} />
                        <XAxis dataKey="name" stroke={theme.textMuted} fontSize={12} />
                        <YAxis stroke={theme.textMuted} fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: theme.bg,
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: shadows.raised.md,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={theme.primary}
                          strokeWidth={3}
                          dot={{ fill: theme.primary }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value2"
                          stroke={theme.secondary}
                          strokeWidth={3}
                          dot={{ fill: theme.secondary }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ComponentCard>

                <ComponentCard title="Area Chart">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.shadowDark} />
                        <XAxis dataKey="name" stroke={theme.textMuted} fontSize={12} />
                        <YAxis stroke={theme.textMuted} fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: theme.bg,
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: shadows.raised.md,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={theme.secondary}
                          fill={`${theme.secondary}40`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </ComponentCard>

                <ComponentCard title="Bar Chart">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.shadowDark} />
                        <XAxis dataKey="name" stroke={theme.textMuted} fontSize={12} />
                        <YAxis stroke={theme.textMuted} fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: theme.bg,
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: shadows.raised.md,
                          }}
                        />
                        <Bar dataKey="value" fill={theme.primary} radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ComponentCard>

                <ComponentCard title="Pie Chart">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: theme.bg,
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: shadows.raised.md,
                          }}
                        />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </ComponentCard>
              </div>
            </div>
          )}

          {/* PROGRESS SECTION */}
          {activeSection === 'progress' && (
            <div>
              <SectionTitle
                title="Progress"
                subtitle="Progress bars, spinners, and loading indicators"
              />

              <ComponentCard
                title="Progress Bars"
                description="Neumorphic progress bars with inset track and gradient-filled indicator."
                code={`// Progress Bar with Label
<div>
  <div className="flex justify-between mb-2">
    <span className="text-sm font-medium" style={{ color: '#3d5a80' }}>
      Progress
    </span>
    <span className="text-sm" style={{ color: '#2064d8' }}>
      60%
    </span>
  </div>
  {/* Inset track */}
  <div
    className="h-3 rounded-full overflow-hidden"
    style={{
      background: '#e8eef5',
      boxShadow: 'inset 2px 2px 4px #c4c9cf, inset -2px -2px 4px #ffffff'
    }}
  >
    {/* Gradient fill */}
    <div
      className="h-full rounded-full"
      style={{
        background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
        width: '60%'
      }}
    />
  </div>
</div>

// Variants:
// Primary: linear-gradient(145deg, #2064d8, #1a4fa8)
// Success: linear-gradient(145deg, #21d8aa, #00a67a)
// Warning: linear-gradient(145deg, #ffb020, #e69500)`}
              >
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                        Primary
                      </span>
                      <span className="text-sm" style={{ color: theme.primary }}>
                        60%
                      </span>
                    </div>
                    <div
                      className="h-3 rounded-full overflow-hidden"
                      style={{ background: theme.bg, boxShadow: shadows.inset.xs }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ background: gradients.primary, width: '60%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                        Success
                      </span>
                      <span className="text-sm" style={{ color: theme.secondary }}>
                        80%
                      </span>
                    </div>
                    <div
                      className="h-3 rounded-full overflow-hidden"
                      style={{ background: theme.bg, boxShadow: shadows.inset.xs }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ background: gradients.secondary, width: '80%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                        Warning
                      </span>
                      <span className="text-sm" style={{ color: theme.warning }}>
                        45%
                      </span>
                    </div>
                    <div
                      className="h-3 rounded-full overflow-hidden"
                      style={{ background: theme.bg, boxShadow: shadows.inset.xs }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ background: gradients.warning, width: '45%' }}
                      />
                    </div>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Circular Progress">
                <div className="flex flex-wrap gap-8">
                  {[
                    { value: 75, color: theme.primary },
                    { value: 50, color: theme.secondary },
                    { value: 25, color: theme.warning },
                  ].map((item, i) => (
                    <div key={i} className="relative" style={{ width: 80, height: 80 }}>
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          fill="none"
                          strokeWidth="8"
                          stroke={theme.shadowDark}
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          fill="none"
                          strokeWidth="8"
                          stroke={item.color}
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 32}`}
                          strokeDashoffset={`${2 * Math.PI * 32 * (1 - item.value / 100)}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                          {item.value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ComponentCard>

              <ComponentCard title="Spinners & Loaders">
                <div className="flex flex-wrap items-center gap-8">
                  <div className="text-center">
                    <Loader
                      className="w-8 h-8 animate-spin mx-auto mb-2"
                      style={{ color: theme.primary }}
                    />
                    <span className="text-xs" style={{ color: theme.textMuted }}>
                      Spinner
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="flex gap-1.5 mb-2">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full animate-bounce"
                          style={{ background: theme.primary, animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs" style={{ color: theme.textMuted }}>
                      Dots
                    </span>
                  </div>
                  <div className="text-center">
                    <div
                      className="w-8 h-8 rounded-full animate-pulse mx-auto mb-2"
                      style={{ background: theme.secondary }}
                    />
                    <span className="text-xs" style={{ color: theme.textMuted }}>
                      Pulse
                    </span>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Skeleton Loaders">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full animate-pulse"
                      style={{ background: theme.shadowDark }}
                    />
                    <div className="flex-1 space-y-2">
                      <div
                        className="h-4 rounded-lg animate-pulse w-3/4"
                        style={{ background: theme.shadowDark }}
                      />
                      <div
                        className="h-3 rounded-lg animate-pulse w-1/2"
                        style={{ background: theme.shadowDark }}
                      />
                    </div>
                  </div>
                  <div
                    className="h-24 rounded-xl animate-pulse"
                    style={{ background: theme.shadowDark }}
                  />
                </div>
              </ComponentCard>

              <ComponentCard
                title="Shared Progress Components (Shadcn)"
                description="Standard Skeleton and Loading Spinner components."
                code={`import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Skeleton
<div className="flex items-center space-x-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
</div>

// Loading Spinner
<LoadingSpinner />
<LoadingSpinner size={32} className="text-primary" />`}
              >
                <div className="flex flex-col gap-8">
                  <div>
                    <h4 className="mb-4 text-sm font-medium">Skeleton</h4>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-4 text-sm font-medium">Loading Spinner</h4>
                    <div className="flex gap-4 items-center">
                      <LoadingSpinner />
                      <LoadingSpinner size={32} className="text-primary" />
                    </div>
                  </div>
                </div>
              </ComponentCard>
            </div>
          )}

          {/* AVATARS SECTION */}
          {activeSection === 'avatars' && (
            <div>
              <SectionTitle title="Avatars" subtitle="User avatars and profile pictures" />

              <ComponentCard
                title="Avatar Sizes"
                description="Neumorphic avatars with gradient background and raised shadow effect."
                code={`// Avatar Component
<div
  className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white"
  style={{
    background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
    boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff'
  }}
>
  JD
</div>

// Avatar with Status Indicator
<div className="relative inline-block">
  <div
    className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white"
    style={{
      background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
      boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff'
    }}
  >
    JD
  </div>
  {/* Status dot */}
  <div
    className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2"
    style={{
      background: '#21d8aa', // online=green, away=yellow, busy=red
      borderColor: '#e8eef5'
    }}
  />
</div>

// Avatar Group (overlapping)
<div className="flex -space-x-3">
  {['JD', 'AB', '+3'].map((initials, i) => (
    <div
      key={i}
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white border-2"
      style={{
        background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
        borderColor: '#e8eef5',
        boxShadow: '2px 2px 4px #c4c9cf, -2px -2px 4px #ffffff',
      }}
    >
      {initials}
    </div>
  ))}
</div>`}
              >
                <div className="flex flex-wrap items-end gap-4">
                  {[
                    { size: 'w-8 h-8', label: 'XS' },
                    { size: 'w-10 h-10', label: 'SM' },
                    { size: 'w-12 h-12', label: 'MD' },
                    { size: 'w-14 h-14', label: 'LG' },
                    { size: 'w-16 h-16', label: 'XL' },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <div
                        className={`${item.size} rounded-full flex items-center justify-center font-semibold text-white mb-1`}
                        style={{ background: gradients.primary, boxShadow: shadows.raised.sm }}
                      >
                        {item.label.charAt(0)}
                      </div>
                      <span className="text-xs" style={{ color: theme.textMuted }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </ComponentCard>

              <ComponentCard title="Avatar Shapes">
                <div className="flex flex-wrap gap-6">
                  <div className="text-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold text-white mb-2"
                      style={{ background: gradients.primary, boxShadow: shadows.raised.md }}
                    >
                      JD
                    </div>
                    <span className="text-xs" style={{ color: theme.textMuted }}>
                      Circle
                    </span>
                  </div>
                  <div className="text-center">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-semibold text-white mb-2"
                      style={{ background: gradients.secondary, boxShadow: shadows.raised.md }}
                    >
                      AB
                    </div>
                    <span className="text-xs" style={{ color: theme.textMuted }}>
                      Rounded
                    </span>
                  </div>
                  <div className="text-center">
                    <div
                      className="w-14 h-14 rounded-lg flex items-center justify-center text-lg font-semibold text-white mb-2"
                      style={{ background: gradients.warning, boxShadow: shadows.raised.md }}
                    >
                      CD
                    </div>
                    <span className="text-xs" style={{ color: theme.textMuted }}>
                      Square
                    </span>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Avatar with Status">
                <div className="flex flex-wrap gap-6">
                  {[
                    { status: theme.secondary, label: 'Online' },
                    { status: theme.warning, label: 'Away' },
                    { status: theme.danger, label: 'Busy' },
                    { status: theme.textMuted, label: 'Offline' },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <div className="relative inline-block mb-2">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white"
                          style={{ background: gradients.primary, boxShadow: shadows.raised.sm }}
                        >
                          U{i + 1}
                        </div>
                        <div
                          className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2"
                          style={{ background: item.status, borderColor: theme.bg }}
                        />
                      </div>
                      <span className="text-xs block" style={{ color: theme.textMuted }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </ComponentCard>

              <ComponentCard title="Avatar Group">
                <div className="flex -space-x-3">
                  {['JD', 'AB', 'CD', 'EF', '+3'].map((initials, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white border-2"
                      style={{
                        background: i === 4 ? theme.textMuted : gradients.primary,
                        borderColor: theme.bg,
                        boxShadow: shadows.raised.xs,
                      }}
                    >
                      {initials}
                    </div>
                  ))}
                </div>
              </ComponentCard>

              <ComponentCard
                title="Shared Avatar Component (Shadcn)"
                description="Standard Avatar component."
                code={`import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>`}
              >
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </div>
              </ComponentCard>
            </div>
          )}

          {/* MISC SECTION */}
          {activeSection === 'misc' && (
            <div>
              <SectionTitle title="Miscellaneous" subtitle="Other useful components" />

              <ComponentCard
                title="Accordion"
                description="Expandable sections with smooth transitions. Only one item open at a time."
                code={`const [accordionOpen, setAccordionOpen] = useState(-1);

const items = [
  { title: 'What is Neumorphism?', content: 'Neumorphism is...' },
  { title: 'How to use?', content: 'Copy the component code...' },
];

// Accordion Component
<div className="space-y-3">
  {items.map((item, i) => (
    <div
      key={i}
      className="rounded-xl overflow-hidden"
      style={{
        background: '#e8eef5',
        boxShadow: '4px 4px 8px #c4c9cf, -4px -4px 8px #ffffff'
      }}
    >
      <button
        onClick={() => setAccordionOpen(accordionOpen === i ? -1 : i)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-medium" style={{ color: '#1e3a5f' }}>
          {item.title}
        </span>
        <ChevronDown
          className={\`w-5 h-5 transition-transform \${accordionOpen === i ? 'rotate-180' : ''}\`}
          style={{ color: '#98afc2' }}
        />
      </button>
      {accordionOpen === i && (
        <div className="px-4 pb-4" style={{ color: '#6b8299' }}>
          {item.content}
        </div>
      )}
    </div>
  ))}
</div>`}
              >
                <div className="space-y-3">
                  {[
                    {
                      title: 'What is Neumorphism?',
                      content:
                        'Neumorphism is a design style combining flat design with skeuomorphism, using soft shadows.',
                    },
                    {
                      title: 'How to use these components?',
                      content:
                        'Copy the component code and customize the theme colors to match your brand.',
                    },
                    {
                      title: 'Is it accessible?',
                      content: 'Yes! All components are built with accessibility in mind.',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden"
                      style={{ background: theme.bg, boxShadow: shadows.raised.md }}
                    >
                      <button
                        onClick={() => setAccordionOpen(accordionOpen === i ? -1 : i)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <span className="font-medium" style={{ color: theme.textPrimary }}>
                          {item.title}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${accordionOpen === i ? 'rotate-180' : ''}`}
                          style={{ color: theme.textMuted }}
                        />
                      </button>
                      {accordionOpen === i && (
                        <div className="px-4 pb-4" style={{ color: theme.textTertiary }}>
                          {item.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ComponentCard>

              <ComponentCard title="Rating">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className="w-6 h-6 cursor-pointer"
                        style={{
                          color: star <= 4 ? theme.warning : theme.textMuted,
                          fill: star <= 4 ? theme.warning : 'none',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ color: theme.textSecondary }}>4.0 out of 5</span>
                </div>
              </ComponentCard>

              <ComponentCard title="Stepper">
                <div className="flex items-center justify-between max-w-xl">
                  {[
                    { step: 1, label: 'Account', done: true },
                    { step: 2, label: 'Profile', done: true },
                    { step: 3, label: 'Review', current: true },
                    { step: 4, label: 'Complete' },
                  ].map((item, i, arr) => (
                    <div key={i} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                          style={
                            item.done
                              ? {
                                  background: gradients.secondary,
                                  color: 'white',
                                  boxShadow: shadows.raised.sm,
                                }
                              : item.current
                                ? {
                                    background: gradients.primary,
                                    color: 'white',
                                    boxShadow: shadows.raised.sm,
                                  }
                                : {
                                    background: theme.bg,
                                    color: theme.textMuted,
                                    boxShadow: shadows.inset.sm,
                                  }
                          }
                        >
                          {item.done ? <Check className="w-5 h-5" /> : item.step}
                        </div>
                        <span
                          className="text-xs mt-2"
                          style={{ color: item.current ? theme.primary : theme.textMuted }}
                        >
                          {item.label}
                        </span>
                      </div>
                      {i < arr.length - 1 && (
                        <div
                          className="w-12 h-1 mx-2 rounded-full"
                          style={{ background: item.done ? theme.secondary : theme.shadowDark }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </ComponentCard>

              <ComponentCard title="Empty State">
                <div
                  className="p-12 rounded-2xl text-center"
                  style={{ background: theme.bg, boxShadow: shadows.inset.md }}
                >
                  <div
                    className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: theme.bg, boxShadow: shadows.raised.md }}
                  >
                    <Folder className="w-10 h-10" style={{ color: theme.textMuted }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>
                    No Items Found
                  </h3>
                  <p className="mb-6" style={{ color: theme.textTertiary }}>
                    Get started by creating your first item.
                  </p>
                  <button
                    className="px-6 py-3 rounded-xl font-medium text-white inline-flex items-center gap-2"
                    style={{ background: gradients.primary, boxShadow: shadows.raised.md }}
                  >
                    <Plus className="w-5 h-5" /> Create New
                  </button>
                </div>
              </ComponentCard>

              <ComponentCard title="Timeline">
                <div className="relative pl-8">
                  <div
                    className="absolute left-3 top-2 bottom-2 w-0.5"
                    style={{ background: theme.shadowDark }}
                  />
                  {[
                    { title: 'Order Placed', time: '2 hours ago' },
                    { title: 'Order Confirmed', time: '1 hour ago' },
                    { title: 'Shipped', time: '30 mins ago' },
                    { title: 'Delivered', time: 'Just now' },
                  ].map((event, i) => (
                    <div key={i} className="relative mb-6 last:mb-0">
                      <div
                        className="absolute -left-5 top-1.5 w-3 h-3 rounded-full"
                        style={{ background: i === 3 ? theme.secondary : theme.primary }}
                      />
                      <h4 className="font-medium" style={{ color: theme.textPrimary }}>
                        {event.title}
                      </h4>
                      <p className="text-sm" style={{ color: theme.textMuted }}>
                        {event.time}
                      </p>
                    </div>
                  ))}
                </div>
              </ComponentCard>

              <ComponentCard
                title="Shared Misc Components (Shadcn)"
                description="Standard Separator, ScrollArea, ThemeToggle and Sonner components."
                code={`import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from 'sonner';

// Separator
<div>
  <div className="space-y-1">
    <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
    <p className="text-sm text-muted-foreground">
      An open-source UI component library.
    </p>
  </div>
  <Separator className="my-4" />
</div>

// Scroll Area
<ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
  Jokester began sneaking into the castle in the middle of the night...
</ScrollArea>

// Theme Toggle
<ThemeToggle />

// Sonner Toast
<Button variant="outline" onClick={() => toast("Event has been created")}>
  Show Toast
</Button>`}
              >
                <div className="flex flex-col gap-8">
                  <div>
                    <h4 className="mb-4 text-sm font-medium">Separator</h4>
                    <div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
                        <p className="text-sm text-muted-foreground">
                          An open-source UI component library.
                        </p>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex h-5 items-center space-x-4 text-sm">
                        <div>Blog</div>
                        <Separator orientation="vertical" />
                        <div>Docs</div>
                        <Separator orientation="vertical" />
                        <div>Source</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-4 text-sm font-medium">Scroll Area</h4>
                    <ScrollArea className="h-[150px] w-[350px] rounded-md border p-4 bg-white dark:bg-black">
                      {Array.from({ length: 50 }).map((_, i, arr) => (
                        <div key={i} className="text-sm">
                          Item {arr.length - i}
                        </div>
                      ))}
                    </ScrollArea>
                  </div>

                  <div>
                    <h4 className="mb-4 text-sm font-medium">Theme Toggle</h4>
                    <ThemeToggle />
                  </div>

                  <div>
                    <h4 className="mb-4 text-sm font-medium">Sonner Toast</h4>
                    <Button
                      variant="outline"
                      onClick={() =>
                        toast('Event has been created', {
                          description: 'Sunday, December 03, 2023 at 9:00 AM',
                          action: {
                            label: 'Undo',
                            onClick: () => console.log('Undo'),
                          },
                        })
                      }
                    >
                      Show Toast
                    </Button>
                  </div>

                  <div>
                    <h4 className="mb-4 text-sm font-medium">Step Wizard</h4>
                    <StepWizard
                      steps={[
                        { id: 1, title: 'Step 1' },
                        { id: 2, title: 'Step 2' },
                        { id: 3, title: 'Step 3' },
                      ]}
                      currentStep={2}
                    />
                  </div>

                  <div>
                    <h4 className="mb-4 text-sm font-medium">Social Login Buttons</h4>
                    <SocialLoginButtons />
                  </div>
                </div>
              </ComponentCard>
            </div>
          )}

          {/* MODALS SECTION */}
          {activeSection === 'modals' && (
            <div>
              <SectionTitle
                title="Modals & Dialogs"
                subtitle="Various modal types for different use cases"
              />

              <ComponentCard title="Modal Triggers">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setModalType('default');
                      setShowModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl font-medium text-white"
                    style={{ background: gradients.primary, boxShadow: shadows.raised.md }}
                  >
                    Default Modal
                  </button>
                  <button
                    onClick={() => {
                      setModalType('confirm');
                      setShowModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl font-medium text-white"
                    style={{ background: gradients.danger, boxShadow: shadows.raised.md }}
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => {
                      setModalType('success');
                      setShowModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl font-medium text-white"
                    style={{ background: gradients.secondary, boxShadow: shadows.raised.md }}
                  >
                    Success Modal
                  </button>
                  <button
                    onClick={() => {
                      setModalType('form');
                      setShowModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl font-medium"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.raised.md,
                      color: theme.textSecondary,
                    }}
                  >
                    Form Modal
                  </button>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Inline Modal Preview"
                description="Neumorphic modal dialogs with raised card appearance, header, content, and action buttons."
                code={`const [showModal, setShowModal] = useState(false);

// Modal Component
{showModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div
      className="p-6 rounded-2xl w-full max-w-md"
      style={{
        background: '#e8eef5',
        boxShadow: '6px 6px 12px #c4c9cf, -6px -6px 12px #ffffff'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: '#1e3a5f' }}>
          Modal Title
        </h3>
        <button
          onClick={() => setShowModal(false)}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: '#e8eef5',
            boxShadow: '2px 2px 4px #c4c9cf, -2px -2px 4px #ffffff'
          }}
        >
          <X className="w-5 h-5" style={{ color: '#98afc2' }} />
        </button>
      </div>

      {/* Content */}
      <p className="mb-4 text-sm" style={{ color: '#6b8299' }}>
        Modal content goes here.
      </p>

      {/* Footer */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 rounded-xl font-medium"
          style={{
            background: '#e8eef5',
            boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
            color: '#3d5a80',
          }}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 rounded-xl font-medium text-white"
          style={{
            background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
            boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff'
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}`}
              >
                <div
                  className="p-6 rounded-2xl"
                  style={{ background: theme.bg, boxShadow: shadows.raised.lg }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
                      Subscribe to Newsletter
                    </h3>
                    <button
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: theme.bg, boxShadow: shadows.raised.xs }}
                    >
                      <X className="w-5 h-5" style={{ color: theme.textMuted }} />
                    </button>
                  </div>
                  <p className="mb-4 text-sm" style={{ color: theme.textTertiary }}>
                    Get the latest updates and exclusive offers directly in your inbox.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-2.5 rounded-xl outline-none text-sm"
                      style={{
                        background: theme.bg,
                        boxShadow: shadows.inset.sm,
                        color: theme.textPrimary,
                      }}
                    />
                    <button
                      className="px-4 py-2.5 rounded-xl font-medium text-white"
                      style={{ background: gradients.primary, boxShadow: shadows.raised.sm }}
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Alert Dialog Preview">
                <div
                  className="p-6 rounded-2xl text-center max-w-sm"
                  style={{ background: theme.bg, boxShadow: shadows.raised.lg }}
                >
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: `${theme.danger}20` }}
                  >
                    <AlertTriangle className="w-8 h-8" style={{ color: theme.danger }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>
                    Delete Item?
                  </h3>
                  <p className="mb-6 text-sm" style={{ color: theme.textTertiary }}>
                    This action cannot be undone. Are you sure you want to delete this item?
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      className="px-4 py-2 rounded-xl font-medium"
                      style={{
                        background: theme.bg,
                        boxShadow: shadows.raised.sm,
                        color: theme.textSecondary,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 rounded-xl font-medium text-white"
                      style={{ background: gradients.danger, boxShadow: shadows.raised.sm }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Shared Modal Components (Shadcn)"
                description="Standard Dialog, Alert Dialog, and Sheet components."
                code={`import { Dialog, ... } from '@/components/ui/dialog';
import { AlertDialog, ... } from '@/components/ui/alert-dialog';
import { Sheet, ... } from '@/components/ui/sheet';

// Dialog
<Dialog>
  <DialogTrigger><Button>Open Dialog</Button></DialogTrigger>
  <DialogContent>...</DialogContent>
</Dialog>

// Alert Dialog
<AlertDialog>
  <AlertDialogTrigger><Button>Open Alert</Button></AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

// Sheet (Side Drawer)
<Sheet>
  <SheetTrigger><Button>Open Sheet</Button></SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Edit profile</SheetTitle>
      <SheetDescription>Make changes to your profile here.</SheetDescription>
    </SheetHeader>
    <div className="grid gap-4 py-4">...</div>
  </SheetContent>
</Sheet>`}
              >
                <div className="flex flex-wrap gap-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Open Dialog</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                          Make changes to your profile here. Click save when you&apos;re done.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">Open Alert Dialog</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">Open Sheet</Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Edit profile</SheetTitle>
                        <SheetDescription>
                          Make changes to your profile here. Click save when you&apos;re done.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="username" className="text-right">
                            Username
                          </Label>
                          <Input id="username" defaultValue="@peduarte" className="col-span-3" />
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </ComponentCard>
            </div>
          )}

          {/* TOOLTIPS SECTION */}
          {activeSection === 'tooltips' && (
            <div>
              <SectionTitle
                title="Tooltips & Popovers"
                subtitle="Contextual information on hover"
              />

              <ComponentCard title="Tooltip Positions">
                <div className="flex flex-wrap gap-8 justify-center py-8">
                  {[
                    { position: 'top', label: 'Top' },
                    { position: 'right', label: 'Right' },
                    { position: 'bottom', label: 'Bottom' },
                    { position: 'left', label: 'Left' },
                  ].map(item => (
                    <div key={item.position} className="relative">
                      <button
                        onMouseEnter={() => setTooltipVisible(item.position)}
                        onMouseLeave={() => setTooltipVisible(null)}
                        className="px-4 py-2.5 rounded-xl font-medium"
                        style={{
                          background: theme.bg,
                          boxShadow: shadows.raised.md,
                          color: theme.textSecondary,
                        }}
                      >
                        {item.label}
                      </button>
                      {tooltipVisible === item.position && (
                        <div
                          className={`absolute px-3 py-2 rounded-lg text-sm whitespace-nowrap z-10 ${
                            item.position === 'top'
                              ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
                              : item.position === 'bottom'
                                ? 'top-full left-1/2 -translate-x-1/2 mt-2'
                                : item.position === 'left'
                                  ? 'right-full top-1/2 -translate-y-1/2 mr-2'
                                  : 'left-full top-1/2 -translate-y-1/2 ml-2'
                          }`}
                          style={{
                            background: theme.textPrimary,
                            color: theme.bg,
                            boxShadow: shadows.raised.md,
                          }}
                        >
                          Tooltip on {item.label}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ComponentCard>

              <ComponentCard title="Tooltip Styles">
                <div className="flex flex-wrap gap-4">
                  <div className="relative group">
                    <button
                      className="px-4 py-2.5 rounded-xl font-medium text-white"
                      style={{ background: gradients.primary, boxShadow: shadows.raised.md }}
                    >
                      Primary Tooltip
                    </button>
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      style={{ background: theme.primary }}
                    >
                      Primary style tooltip
                    </div>
                  </div>
                  <div className="relative group">
                    <button
                      className="px-4 py-2.5 rounded-xl font-medium text-white"
                      style={{ background: gradients.secondary, boxShadow: shadows.raised.md }}
                    >
                      Success Tooltip
                    </button>
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      style={{ background: theme.secondary }}
                    >
                      Success! Action completed
                    </div>
                  </div>
                  <div className="relative group">
                    <button
                      className="px-4 py-2.5 rounded-xl font-medium text-white"
                      style={{ background: gradients.warning, boxShadow: shadows.raised.md }}
                    >
                      Warning Tooltip
                    </button>
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      style={{ background: theme.warning }}
                    >
                      Warning: Check this
                    </div>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Popover">
                <div className="relative inline-block">
                  <button
                    className="px-4 py-2.5 rounded-xl font-medium flex items-center gap-2"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.raised.md,
                      color: theme.textSecondary,
                    }}
                  >
                    <Info className="w-4 h-4" /> Click for Info
                  </button>
                  <div
                    className="absolute top-full left-0 mt-2 p-4 rounded-xl w-64"
                    style={{ background: theme.bg, boxShadow: shadows.raised.lg }}
                  >
                    <h4 className="font-semibold mb-2" style={{ color: theme.textPrimary }}>
                      Popover Title
                    </h4>
                    <p className="text-sm" style={{ color: theme.textTertiary }}>
                      This is a popover with more detailed content that can include links, buttons,
                      or other elements.
                    </p>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Shared Tooltip Component (Shadcn)"
                description="Standard Tooltip and Popover components."
                code={`import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover</TooltipTrigger>
    <TooltipContent>
      <p>Add to library</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>Place content for the popover here.</PopoverContent>
</Popover>`}
              >
                <div className="flex gap-4">
                  <TooltipProvider>
                    <UiTooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline">Hover me</Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add to library</p>
                      </TooltipContent>
                    </UiTooltip>
                  </TooltipProvider>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">Open Popover</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">Dimensions</h4>
                          <p className="text-sm text-muted-foreground">
                            Set the dimensions for the layer.
                          </p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </ComponentCard>
            </div>
          )}

          {/* ICON BOXES SECTION */}
          {activeSection === 'iconboxes' && (
            <div>
              <SectionTitle title="Icon Boxes" subtitle="Feature boxes with icons" />

              <ComponentCard title="Icon Box Grid">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: Target,
                      title: 'Strategic Planning',
                      desc: 'Define your goals and create actionable plans.',
                      gradient: gradients.primary,
                    },
                    {
                      icon: Layers,
                      title: 'Scalable Solutions',
                      desc: 'Build systems that grow with your business.',
                      gradient: gradients.secondary,
                    },
                    {
                      icon: Zap,
                      title: 'Fast Performance',
                      desc: 'Optimized for speed and efficiency.',
                      gradient: gradients.warning,
                    },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className="p-6 rounded-2xl text-center"
                        style={{ background: theme.bg, boxShadow: shadows.raised.lg }}
                      >
                        <div
                          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                          style={{ background: item.gradient, boxShadow: shadows.raised.md }}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3
                          className="font-semibold text-lg mb-2"
                          style={{ color: theme.textPrimary }}
                        >
                          {item.title}
                        </h3>
                        <p className="text-sm" style={{ color: theme.textTertiary }}>
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </ComponentCard>

              <ComponentCard title="Icon Box with Link">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: Briefcase,
                      title: 'Business Solutions',
                      desc: 'Enterprise-grade tools for your team.',
                    },
                    {
                      icon: MessageSquare,
                      title: '24/7 Support',
                      desc: 'We are here to help you anytime.',
                    },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-4 p-5 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                        style={{ background: theme.bg, boxShadow: shadows.raised.md }}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${theme.primary}20` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: theme.primary }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1" style={{ color: theme.textPrimary }}>
                            {item.title}
                          </h4>
                          <p className="text-sm mb-2" style={{ color: theme.textTertiary }}>
                            {item.desc}
                          </p>
                          <span
                            className="text-sm font-medium flex items-center gap-1"
                            style={{ color: theme.primary }}
                          >
                            Learn more <ArrowUpRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ComponentCard>

              <ComponentCard title="Side Icon Boxes">
                <div className="space-y-4">
                  {[
                    { icon: Check, title: 'Easy Integration', color: theme.secondary },
                    { icon: Lock, title: 'Secure by Default', color: theme.primary },
                    { icon: RefreshCw, title: 'Auto Updates', color: theme.warning },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 rounded-xl"
                        style={{ background: theme.bg, boxShadow: shadows.raised.sm }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: `${item.color}20` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: item.color }} />
                        </div>
                        <span className="font-medium" style={{ color: theme.textPrimary }}>
                          {item.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ComponentCard>
            </div>
          )}

          {/* COUNTERS SECTION */}
          {activeSection === 'counters' && (
            <div>
              <SectionTitle title="Counters & Stats" subtitle="Animated statistics display" />

              <ComponentCard title="Stats Grid">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: '10K+', label: 'Users', icon: Users, color: theme.primary },
                    { value: '$2.5M', label: 'Revenue', icon: DollarSign, color: theme.secondary },
                    { value: '99.9%', label: 'Uptime', icon: Activity, color: theme.warning },
                    { value: '50+', label: 'Countries', icon: Globe, color: theme.danger },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={i}
                        className="p-5 rounded-xl text-center"
                        style={{ background: theme.bg, boxShadow: shadows.raised.md }}
                      >
                        <div
                          className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                          style={{ background: `${stat.color}20` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: stat.color }} />
                        </div>
                        <p className="text-2xl font-bold mb-1" style={{ color: theme.textPrimary }}>
                          {stat.value}
                        </p>
                        <p className="text-sm" style={{ color: theme.textMuted }}>
                          {stat.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </ComponentCard>

              <ComponentCard title="Large Counter Display">
                <div className="flex flex-wrap justify-center gap-8">
                  {[
                    { value: '1,234', label: 'Projects Completed' },
                    { value: '567', label: 'Happy Clients' },
                    { value: '89', label: 'Team Members' },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <p className="text-5xl font-bold mb-2" style={{ color: theme.primary }}>
                        {item.value}
                      </p>
                      <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </ComponentCard>

              <ComponentCard title="Counter Cards">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      title: 'Total Sales',
                      value: '$45,231',
                      change: '+20.1%',
                      up: true,
                      icon: Wallet,
                    },
                    {
                      title: 'New Orders',
                      value: '2,340',
                      change: '+12.5%',
                      up: true,
                      icon: ShoppingCart,
                    },
                    {
                      title: 'Refunds',
                      value: '$1,234',
                      change: '-3.2%',
                      up: false,
                      icon: ArrowDown,
                    },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className="p-5 rounded-xl"
                        style={{ background: theme.bg, boxShadow: shadows.raised.md }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium" style={{ color: theme.textMuted }}>
                            {item.title}
                          </span>
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: theme.bg, boxShadow: shadows.raised.xs }}
                          >
                            <Icon className="w-4 h-4" style={{ color: theme.textTertiary }} />
                          </div>
                        </div>
                        <p className="text-2xl font-bold mb-1" style={{ color: theme.textPrimary }}>
                          {item.value}
                        </p>
                        <span
                          className="text-sm font-medium"
                          style={{ color: item.up ? theme.secondary : theme.danger }}
                        >
                          {item.change} from last month
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ComponentCard>
            </div>
          )}

          {/* E-COMMERCE SECTION */}
          {activeSection === 'ecommerce' && (
            <div>
              <SectionTitle
                title="E-Commerce"
                subtitle="Product cards, cart, and checkout components"
              />

              <ComponentCard title="Product Cards">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: 'Wireless Headphones',
                      price: '$89.99',
                      oldPrice: '$129.99',
                      rating: 4.5,
                      image: '🎧',
                    },
                    {
                      name: 'Smart Watch Pro',
                      price: '$199.99',
                      oldPrice: null,
                      rating: 4.8,
                      image: '⌚',
                    },
                    {
                      name: 'Laptop Stand',
                      price: '$49.99',
                      oldPrice: '$69.99',
                      rating: 4.2,
                      image: '💻',
                    },
                  ].map((product, i) => (
                    <div
                      key={i}
                      className="rounded-2xl overflow-hidden"
                      style={{ background: theme.bg, boxShadow: shadows.raised.lg }}
                    >
                      <div
                        className="h-40 flex items-center justify-center text-6xl"
                        style={{ background: theme.bg, boxShadow: shadows.inset.sm }}
                      >
                        {product.image}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-2" style={{ color: theme.textPrimary }}>
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className="w-4 h-4"
                              style={{
                                color: star <= product.rating ? theme.warning : theme.textMuted,
                                fill: star <= product.rating ? theme.warning : 'none',
                              }}
                            />
                          ))}
                          <span className="text-xs ml-1" style={{ color: theme.textMuted }}>
                            ({product.rating})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold" style={{ color: theme.primary }}>
                              {product.price}
                            </span>
                            {product.oldPrice && (
                              <span
                                className="text-sm line-through"
                                style={{ color: theme.textMuted }}
                              >
                                {product.oldPrice}
                              </span>
                            )}
                          </div>
                          <button
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: gradients.primary, boxShadow: shadows.raised.sm }}
                          >
                            <ShoppingCart className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ComponentCard>

              <ComponentCard title="Shopping Cart">
                <div
                  className="rounded-xl p-4"
                  style={{ background: theme.bg, boxShadow: shadows.raised.md }}
                >
                  {cartItems.map((item, i) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 py-4 ${
                        i < cartItems.length - 1 ? 'border-b' : ''
                      }`}
                      style={{ borderColor: theme.shadowDark }}
                    >
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                        style={{ background: theme.bg, boxShadow: shadows.inset.xs }}
                      >
                        {item.image}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium" style={{ color: theme.textPrimary }}>
                          {item.name}
                        </h4>
                        <p className="text-sm" style={{ color: theme.textMuted }}>
                          Qty: {item.qty}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: theme.primary }}>
                          ${(item.price * item.qty).toFixed(2)}
                        </p>
                        <button
                          className="text-sm flex items-center gap-1"
                          style={{ color: theme.danger }}
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: theme.shadowDark }}>
                    <div className="flex justify-between mb-2">
                      <span style={{ color: theme.textSecondary }}>Subtotal</span>
                      <span className="font-medium" style={{ color: theme.textPrimary }}>
                        $489.97
                      </span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span style={{ color: theme.textSecondary }}>Shipping</span>
                      <span className="font-medium" style={{ color: theme.secondary }}>
                        Free
                      </span>
                    </div>
                    <div
                      className="flex justify-between text-lg font-bold"
                      style={{ color: theme.textPrimary }}
                    >
                      <span>Total</span>
                      <span style={{ color: theme.primary }}>$489.97</span>
                    </div>
                  </div>
                  <button
                    className="w-full mt-4 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2"
                    style={{ background: gradients.primary, boxShadow: shadows.raised.md }}
                  >
                    Proceed to Checkout <ChevronsRight className="w-5 h-5" />
                  </button>
                </div>
              </ComponentCard>

              <ComponentCard title="Price Tags">
                <div className="flex flex-wrap gap-4">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{ background: theme.bg, boxShadow: shadows.raised.sm }}
                  >
                    <Tag className="w-4 h-4" style={{ color: theme.primary }} />
                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                      $99.99
                    </span>
                  </div>
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{ background: `${theme.danger}20` }}
                  >
                    <Percent className="w-4 h-4" style={{ color: theme.danger }} />
                    <span className="font-medium" style={{ color: theme.danger }}>
                      30% OFF
                    </span>
                  </div>
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white"
                    style={{ background: gradients.secondary }}
                  >
                    <Check className="w-4 h-4" />
                    <span className="font-medium">Free Shipping</span>
                  </div>
                </div>
              </ComponentCard>
            </div>
          )}

          {/* APP COMPONENTS SECTION */}
          {activeSection === 'app-components' && (
            <div>
              <SectionTitle
                title="Application Components"
                subtitle="Reusable high-level components used across the application"
              />

              <ComponentCard
                title="Currency Component"
                description="Displays formatted currency with symbol."
                code={`import { Currency } from '@/components';

<Currency value={1234.56} currencyCode="USD" />`}
              >
                <div className="flex gap-4">
                  <Currency value={1234.56} currencyCode="USD" />
                  <Currency value={9876.54} currencyCode="EUR" />
                </div>
              </ComponentCard>

              <ComponentCard
                title="Message Component"
                description="Displays a message box (e.g., error, info)."
                code={`import { Message } from '@/components';

<Message type="danger" message="This is an error message." />
<Message type="success" message="Operation successful!" />`}
              >
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-red-100 text-red-700 border border-red-200">
                    This is an error message.
                  </div>
                  <div className="p-4 rounded-lg bg-green-100 text-green-700 border border-green-200">
                    Operation successful!
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard
                title="Loader Component"
                description="Application-wide loading spinner."
                code={`import { Loader } from '@/components';

<Loader />`}
              >
                <AppLoader />
              </ComponentCard>
            </div>
          )}

          {/* TYPOGRAPHY SECTION */}
          {activeSection === 'typography' && (
            <div>
              <SectionTitle title="Typography" subtitle="Text styles and formatting" />

              <ComponentCard title="Headings">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold" style={{ color: theme.textPrimary }}>
                    Heading 1 - Bold 36px
                  </h1>
                  <h2 className="text-3xl font-bold" style={{ color: theme.textPrimary }}>
                    Heading 2 - Bold 30px
                  </h2>
                  <h3 className="text-2xl font-semibold" style={{ color: theme.textPrimary }}>
                    Heading 3 - Semibold 24px
                  </h3>
                  <h4 className="text-xl font-semibold" style={{ color: theme.textPrimary }}>
                    Heading 4 - Semibold 20px
                  </h4>
                  <h5 className="text-lg font-medium" style={{ color: theme.textPrimary }}>
                    Heading 5 - Medium 18px
                  </h5>
                  <h6 className="text-base font-medium" style={{ color: theme.textPrimary }}>
                    Heading 6 - Medium 16px
                  </h6>
                </div>
              </ComponentCard>

              <ComponentCard title="Display Headings">
                <div className="space-y-6">
                  <p className="text-6xl font-bold" style={{ color: theme.textPrimary }}>
                    Display 1
                  </p>
                  <p className="text-5xl font-bold" style={{ color: theme.textPrimary }}>
                    Display 2
                  </p>
                  <p className="text-4xl font-bold" style={{ color: theme.textSecondary }}>
                    Display 3
                  </p>
                </div>
              </ComponentCard>

              <ComponentCard title="Paragraphs">
                <div className="space-y-4 max-w-2xl">
                  <p className="text-lg leading-relaxed" style={{ color: theme.textPrimary }}>
                    <strong>Lead Paragraph:</strong> This is a lead paragraph with larger text.
                    Perfect for introductions and important callouts that need emphasis.
                  </p>
                  <p style={{ color: theme.textSecondary }}>
                    <strong>Body Text:</strong> This is regular body text. Lorem ipsum dolor sit
                    amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
                  </p>
                  <p className="text-sm" style={{ color: theme.textTertiary }}>
                    <strong>Small Text:</strong> This is smaller text, useful for captions,
                    footnotes, or secondary information that doesn&apos;t need as much prominence.
                  </p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    <strong>Extra Small:</strong> The smallest text size for legal text, timestamps.
                  </p>
                </div>
              </ComponentCard>

              <ComponentCard title="Text Colors">
                <div className="space-y-2">
                  <p className="font-medium" style={{ color: theme.textPrimary }}>
                    Primary Text Color
                  </p>
                  <p className="font-medium" style={{ color: theme.textSecondary }}>
                    Secondary Text Color
                  </p>
                  <p className="font-medium" style={{ color: theme.textTertiary }}>
                    Tertiary Text Color
                  </p>
                  <p className="font-medium" style={{ color: theme.textMuted }}>
                    Muted Text Color
                  </p>
                  <p className="font-medium" style={{ color: theme.primary }}>
                    Primary Brand Color
                  </p>
                  <p className="font-medium" style={{ color: theme.secondary }}>
                    Success/Secondary Color
                  </p>
                  <p className="font-medium" style={{ color: theme.danger }}>
                    Danger/Error Color
                  </p>
                  <p className="font-medium" style={{ color: theme.warning }}>
                    Warning Color
                  </p>
                </div>
              </ComponentCard>

              <ComponentCard title="Blockquote">
                <blockquote
                  className="pl-4 py-2 border-l-4 italic"
                  style={{ borderColor: theme.primary, color: theme.textSecondary }}
                >
                  <p className="mb-2">
                    &ldquo;Design is not just what it looks like and feels like. Design is how it
                    works.&rdquo;
                  </p>
                  <footer className="text-sm" style={{ color: theme.textMuted }}>
                    — Steve Jobs
                  </footer>
                </blockquote>
              </ComponentCard>

              <ComponentCard title="Lists">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      Unordered List
                    </h4>
                    <ul className="space-y-2">
                      {['First item', 'Second item', 'Third item', 'Fourth item'].map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2"
                          style={{ color: theme.textSecondary }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: theme.primary }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3" style={{ color: theme.textPrimary }}>
                      Ordered List
                    </h4>
                    <ol className="space-y-2">
                      {['First step', 'Second step', 'Third step', 'Fourth step'].map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3"
                          style={{ color: theme.textSecondary }}
                        >
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: gradients.primary }}
                          >
                            {i + 1}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Code & Inline Text">
                <div className="space-y-4">
                  <p style={{ color: theme.textSecondary }}>
                    Use{' '}
                    <code
                      className="px-2 py-1 rounded-lg text-sm"
                      style={{
                        background: theme.bg,
                        boxShadow: shadows.inset.xs,
                        color: theme.danger,
                      }}
                    >
                      inline code
                    </code>{' '}
                    for code snippets.
                  </p>
                  <p style={{ color: theme.textSecondary }}>
                    This text has <strong>bold</strong>, <em>italic</em>, and <u>underlined</u>{' '}
                    styles.
                  </p>
                  <p style={{ color: theme.textSecondary }}>
                    Here is a{' '}
                    <a href="#" style={{ color: theme.primary }}>
                      text link
                    </a>{' '}
                    example.
                  </p>
                  <div
                    className="p-4 rounded-xl font-mono text-sm overflow-x-auto"
                    style={{
                      background: theme.bg,
                      boxShadow: shadows.inset.sm,
                      color: theme.textSecondary,
                    }}
                  >
                    <pre>{`const greeting = "Hello, World!";
console.log(greeting);`}</pre>
                  </div>
                </div>
              </ComponentCard>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="max-w-md w-full p-6 rounded-2xl"
            style={{ background: theme.bg, boxShadow: shadows.raised.xl }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
                Modal Dialog
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: theme.bg, boxShadow: shadows.raised.xs }}
              >
                <X className="w-5 h-5" style={{ color: theme.textMuted }} />
              </button>
            </div>
            <p className="mb-6" style={{ color: theme.textTertiary }}>
              This is a modal dialog content.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl font-medium"
                style={{
                  background: theme.bg,
                  boxShadow: shadows.raised.sm,
                  color: theme.textSecondary,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
