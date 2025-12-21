import { useState } from 'react';
import {
  Home,
  Users,
  Settings,
  BarChart3,
  Mail,
  Calendar,
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
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Upload,
  Share2,
  Copy,
  Heart,
  Star,
  Bookmark,
  Send,
  MoreHorizontal,
  MoreVertical,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Loader,
  Clock,
  MapPin,
  Phone,
  Globe,
  User,
  Lock,
  CreditCard,
  ShoppingCart,
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  Zap,
  Award,
  Gift,
  Camera,
  Image,
  File,
  FileText,
  Paperclip,
  Link,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sun,
  Moon,
  Cloud,
  Droplet,
  Wind,
  Thermometer,
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

/*
 * SIMPLE ACCOUNTS - NEUMORPHISM UI COMPONENT LIBRARY
 */

const theme = {
  bg: '#e8eef5',
  shadowDark: '#c4c9cf',
  shadowLight: '#ffffff',
  primary: '#1e6eff',
  primaryDark: '#0052cc',
  secondary: '#00c896',
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

function ComponentCard({ title, children, className = '' }) {
  return (
    <div
      className={`p-6 rounded-2xl mb-6 ${className}`}
      style={{ background: theme.bg, boxShadow: shadows.raised.lg }}
    >
      {title && (
        <h3 className="font-semibold mb-4" style={{ color: theme.textPrimary }}>
          {title}
        </h3>
      )}
      {children}
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

export default function ComponentLibrary() {
  const [activeSection, setActiveSection] = useState('buttons');
  const [checked, setChecked] = useState(true);
  const [toggle, setToggle] = useState(true);
  const [radioValue, setRadioValue] = useState('option1');
  const [sliderValue, setSliderValue] = useState(60);
  const [activeTab, setActiveTab] = useState(0);
  const [accordionOpen, setAccordionOpen] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const sections = [
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
          {/* BUTTONS SECTION */}
          {activeSection === 'buttons' && (
            <div>
              <SectionTitle title="Buttons" subtitle="Various button styles and states" />

              <ComponentCard title="Raised Buttons">
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

              <ComponentCard title="Pressed/Inset Buttons">
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
            </div>
          )}

          {/* FORMS SECTION */}
          {activeSection === 'forms' && (
            <div>
              <SectionTitle
                title="Form Elements"
                subtitle="Inputs, checkboxes, toggles, and more"
              />

              <ComponentCard title="Text Inputs">
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

              <ComponentCard title="Select Dropdown">
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

              <ComponentCard title="Checkboxes">
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

              <ComponentCard title="Radio Buttons">
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

              <ComponentCard title="Toggle Switches">
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

              <ComponentCard title="Range Slider">
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

              <ComponentCard title="Stats Cards">
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

              <ComponentCard title="Profile Card">
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
            </div>
          )}

          {/* ALERTS SECTION */}
          {activeSection === 'alerts' && (
            <div>
              <SectionTitle
                title="Alerts & Notifications"
                subtitle="Alert boxes and toast notifications"
              />

              <ComponentCard title="Alert Boxes">
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

              <ComponentCard title="Toast Notifications">
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
            </div>
          )}

          {/* BADGES SECTION */}
          {activeSection === 'badges' && (
            <div>
              <SectionTitle title="Badges & Tags" subtitle="Labels, badges, and tag components" />

              <ComponentCard title="Solid Badges">
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

              <ComponentCard title="Soft Badges">
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
            </div>
          )}

          {/* NAVIGATION SECTION */}
          {activeSection === 'navigation' && (
            <div>
              <SectionTitle title="Navigation" subtitle="Tabs, breadcrumbs, and pagination" />

              <ComponentCard title="Tabs">
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

              <ComponentCard title="Breadcrumbs">
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

              <ComponentCard title="Pagination">
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
            </div>
          )}

          {/* TABLES SECTION */}
          {activeSection === 'tables' && (
            <div>
              <SectionTitle title="Tables" subtitle="Data tables with various styles" />

              <ComponentCard title="Basic Table">
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

              <ComponentCard title="Progress Bars">
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
            </div>
          )}

          {/* AVATARS SECTION */}
          {activeSection === 'avatars' && (
            <div>
              <SectionTitle title="Avatars" subtitle="User avatars and profile pictures" />

              <ComponentCard title="Avatar Sizes">
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
            </div>
          )}

          {/* MISC SECTION */}
          {activeSection === 'misc' && (
            <div>
              <SectionTitle title="Miscellaneous" subtitle="Other useful components" />

              <ComponentCard title="Accordion">
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
