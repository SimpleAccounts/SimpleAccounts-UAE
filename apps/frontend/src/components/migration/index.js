/**
 * Migration compatibility layer
 * Re-exports reactstrap components for backwards compatibility
 *
 * This file provides a compatibility layer for components that were
 * previously imported from a custom migration path.
 */

// Re-export all commonly used reactstrap components
export {
  // Layout
  Container,
  Row,
  Col,

  // Cards
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  CardTitle,
  CardText,
  CardGroup,
  CardDeck,
  CardColumns,
  CardImg,
  CardImgOverlay,
  CardSubtitle,
  CardLink,

  // Buttons
  Button,
  ButtonGroup,
  ButtonDropdown,
  ButtonToolbar,

  // Forms
  Form,
  FormGroup,
  FormText,
  FormFeedback,
  Input,
  Label,

  // Dropdowns
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,

  // Modals
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,

  // Navigation
  Nav,
  NavItem,
  NavLink,
  Navbar,
  NavbarBrand,
  NavbarToggler,

  // Tabs
  TabContent,
  TabPane,

  // Tables
  Table,

  // Alerts & Badges
  Alert,
  Badge,

  // Tooltips & Popovers
  Tooltip,
  UncontrolledTooltip,
  Popover,
  PopoverHeader,
  PopoverBody,
  UncontrolledPopover,

  // Progress & Spinners
  Progress,
  Spinner,

  // Collapse
  Collapse,
  UncontrolledCollapse,

  // List
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,

  // Breadcrumb
  Breadcrumb,
  BreadcrumbItem,

  // Pagination
  Pagination,
  PaginationItem,
  PaginationLink,

  // Media
  Media,

  // Carousel
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  CarouselCaption,

  // Other
  Fade,
  InputGroup,
  InputGroupText,
} from 'reactstrap';
