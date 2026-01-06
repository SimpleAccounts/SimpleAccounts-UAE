/**
 * Migration Components
 *
 * Neumorphic wrapper components for migrating from reactstrap to shadcn/ui.
 * These components provide reactstrap-compatible APIs with neumorphic styling.
 *
 * Usage:
 *   // Replace reactstrap imports with migration imports
 *   // Before:
 *   import { Button, Card, CardBody, Modal, Row, Col } from 'components/migration';
 *
 *   // After:
 *   import {
 *     Button, Card, CardBody, Modal, Row, Col
 *   } from 'components/migration';
 */

// Button
export { NeuButton, NeuButton as Button } from './NeuButton';

// ButtonGroup
export { NeuButtonGroup, NeuButtonGroup as ButtonGroup } from './NeuButtonGroup';

// Card
export {
  NeuCard,
  NeuCard as Card,
  NeuCardHeader,
  NeuCardHeader as CardHeader,
  NeuCardBody,
  NeuCardBody as CardBody,
  NeuCardFooter,
  NeuCardFooter as CardFooter,
  NeuCardTitle,
  NeuCardTitle as CardTitle,
  NeuCardText,
  NeuCardText as CardText,
} from './NeuCard';

// For CardGroup - just a flex container
export const CardGroup = ({ children, className, ...props }) => (
  <div className={`flex flex-wrap gap-4 ${className || ''}`} {...props}>
    {children}
  </div>
);

// Modal
export {
  NeuModal,
  NeuModal as Modal,
  NeuModalHeader,
  NeuModalHeader as ModalHeader,
  NeuModalBody,
  NeuModalBody as ModalBody,
  NeuModalFooter,
  NeuModalFooter as ModalFooter,
} from './NeuModal';

// Table
export { NeuTable, NeuTable as Table, NeuTh, NeuTd } from './NeuTable';

// Input/Form
export {
  NeuInput,
  NeuInput as Input,
  NeuLabel,
  NeuLabel as Label,
  NeuFormGroup,
  NeuFormGroup as FormGroup,
  NeuInputGroup,
  NeuInputGroup as InputGroup,
  NeuInputGroupText,
  NeuInputGroupText as InputGroupText,
} from './NeuInput';

// Form
export { NeuForm, NeuForm as Form } from './NeuForm';

// Dropdown
export {
  NeuDropdown,
  NeuDropdown as Dropdown,
  NeuDropdown as ButtonDropdown,
  NeuDropdownToggle,
  NeuDropdownToggle as DropdownToggle,
  NeuDropdownMenu,
  NeuDropdownMenu as DropdownMenu,
  NeuDropdownItem,
  NeuDropdownItem as DropdownItem,
} from './NeuDropdown';

// Layout (Row, Col, Container)
export {
  NeuRow,
  NeuRow as Row,
  NeuCol,
  NeuCol as Col,
  NeuContainer,
  NeuContainer as Container,
} from './NeuLayout';

// Navigation/Tabs
export {
  NeuNav,
  NeuNav as Nav,
  NeuNavItem,
  NeuNavItem as NavItem,
  NeuNavLink,
  NeuNavLink as NavLink,
  NeuTabContent,
  NeuTabContent as TabContent,
  NeuTabPane,
  NeuTabPane as TabPane,
} from './NeuNav';

// Badge
export { NeuBadge, NeuBadge as Badge } from './NeuBadge';

// Alert
export { NeuAlert, NeuAlert as Alert } from './NeuAlert';

// Tooltip
export {
  NeuTooltipProvider,
  NeuTooltip,
  NeuTooltipTrigger,
  NeuTooltipContent,
  NeuUncontrolledTooltip,
  NeuUncontrolledTooltip as UncontrolledTooltip,
} from './NeuTooltip';
