import Loading from './loading';
import RouteLoading from './loading/RouteLoading';
import Loader from './loader';
import Aside from './aside';
import Header from './header';
import Footer from './footer';
import Message from './message';
// COMMENTED OUT: DateRangePicker2 uses jQuery which slows down page load
// Import it directly in components that need it for lazy loading
// import DateRangePicker2 from './datepicker';
import ConfirmDeleteModal from './confirm_delete_modal';
import ImageUploader from './react-image-upload';
import Tooltip from './tooltip';
import Currency from './currency';
import InvoiceTemplate from './invoice-template';
import * as CustomStyles from './react-select';
import ConfirmLeavePageModal from './confirm_leave_page';
import LeavePage from './navigationPromtForLeavePage';
import { CommonList } from './comman_list_data';
import * as ProductTableCalculation from './product_table_calculatoin';
import SentInvoice from './sent_document';
import CurrencyExchangeRate from './currency_exchangeRate';
import { ZipCodeInput, InvoiceAdditionaNotesInformation, TermDateInput } from './form_control';
import ActionDropdownButtons from './action_dropdown_button';
import ChangeInvoiceStatus from './change_invoice_status';
import DeleteDocument from './delete_record';
import ProductTable from './product_table';
import TotalCalculation from './total_calculation';
import InvoiceViewJournalEntries from './invoice_view_journal_entries';
import { EmployeeModal } from './modals';

export {
  Loading,
  RouteLoading,
  Loader,
  Aside,
  Header,
  Footer,
  Message,
  // DateRangePicker2, // Commented out - import directly where needed
  ConfirmDeleteModal,
  ConfirmLeavePageModal,
  LeavePage,
  ImageUploader,
  CustomStyles,
  Tooltip,
  Currency,
  EmployeeModal,
  InvoiceTemplate,
  CommonList,
  ProductTableCalculation,
  SentInvoice,
  ZipCodeInput,
  CurrencyExchangeRate,
  ActionDropdownButtons,
  ChangeInvoiceStatus,
  DeleteDocument,
  ProductTable,
  TotalCalculation,
  InvoiceAdditionaNotesInformation,
  TermDateInput,
  InvoiceViewJournalEntries,
};
