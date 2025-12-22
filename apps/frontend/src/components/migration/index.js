/**
 * Migration Components
 *
 * Neumorphic wrapper components for migrating from reactstrap to shadcn/ui.
 * These components provide reactstrap-compatible APIs with neumorphic styling.
 *
 * Usage:
 *   // Replace reactstrap imports with migration imports
 *   // Before:
 *   import { Button, Card, CardBody, Modal } from 'reactstrap';
 *
 *   // After:
 *   import {
 *     NeuButton as Button,
 *     NeuCard as Card,
 *     NeuCardBody as CardBody,
 *     NeuModal as Modal
 *   } from 'components/migration';
 *
 * Migration Guide:
 * ================
 *
 * 1. Button:
 *    reactstrap:  <Button color="primary" size="sm">Save</Button>
 *    migration:   <NeuButton color="primary" size="sm">Save</NeuButton>
 *
 * 2. Card:
 *    reactstrap:  <Card><CardBody>Content</CardBody></Card>
 *    migration:   <NeuCard><NeuCardBody>Content</NeuCardBody></NeuCard>
 *
 * 3. Modal:
 *    reactstrap:  <Modal isOpen={isOpen} toggle={toggle}>...</Modal>
 *    migration:   <NeuModal isOpen={isOpen} toggle={toggle}>...</NeuModal>
 *
 * 4. Table:
 *    reactstrap:  <Table striped hover>...</Table>
 *    migration:   <NeuTable striped hover>...</NeuTable>
 *
 * 5. Input/Form:
 *    reactstrap:  <FormGroup><Label>Name</Label><Input /></FormGroup>
 *    migration:   <NeuFormGroup><NeuLabel>Name</NeuLabel><NeuInput /></NeuFormGroup>
 *
 * 6. Dropdown:
 *    reactstrap:  <Dropdown isOpen={isOpen} toggle={toggle}>...</Dropdown>
 *    migration:   <NeuDropdown isOpen={isOpen} toggle={toggle}>...</NeuDropdown>
 */

// Button
export { NeuButton } from './NeuButton';

// Card
export {
  NeuCard,
  NeuCardHeader,
  NeuCardBody,
  NeuCardFooter,
  NeuCardTitle,
  NeuCardText,
} from './NeuCard';

// Modal
export { NeuModal, NeuModalHeader, NeuModalBody, NeuModalFooter } from './NeuModal';

// Table
export { NeuTable, NeuTh, NeuTd } from './NeuTable';

// Input/Form
export { NeuInput, NeuLabel, NeuFormGroup, NeuInputGroup, NeuInputGroupText } from './NeuInput';

// Dropdown
export { NeuDropdown, NeuDropdownToggle, NeuDropdownMenu, NeuDropdownItem } from './NeuDropdown';
