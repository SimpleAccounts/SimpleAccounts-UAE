import api from './api';
import authApi from './auth_api';
import authFileUploadApi from './auth_fileupload_api';
import * as selectOptionsFactory from './select_option_factory';
import * as selectOptionsFactoryClickable from './select_option_factory_clickable';
import * as selectCurrencyFactory from './select_currency_factory';
import * as selectInvoiceFactory from './select_invoice_factory';
import * as filterFactory from './filter_factory';
import * as cryptoService from './crypto';
import * as optionFactory from './option_factory';
import * as ReportsColumnList from './reports_column_lists';
import * as ActionMessagesList from './action_messages';
import * as InputValidation from './input_validation';
import * as DropdownLists from './dropdown_lists';
import * as Lists from './lists';
import * as renderList from './render_lists';
import * as StatusActionList from './status_action_list';
// NOTE: ExcelExport removed from barrel export to enable lazy loading
// Import directly from 'utils/excelExport' when needed to avoid loading 1.4MB exceljs on initial page load
//import * as InvoiceList from './invoice_list';

// Custom styles for react-select to match shadcn/ui
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '40px',
    paddingLeft: 0,
    paddingRight: 0,
    borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--input))',
    backgroundColor: 'hsl(var(--background))',
    boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring))' : 'none',
    '&:hover': {
      borderColor: 'hsl(var(--ring))',
    },
  }),
  menu: base => ({
    ...base,
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
    zIndex: 9999,
  }),
  menuList: base => ({
    ...base,
    backgroundColor: 'hsl(var(--background))',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'hsl(var(--primary))'
      : state.isFocused
        ? 'hsl(var(--accent))'
        : 'transparent',
    color: state.isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
    cursor: 'pointer',
  }),
  valueContainer: (base, state) => ({
    ...base,
    paddingLeft: '16px',
    paddingRight: '8px',
    paddingTop: '2px',
    paddingBottom: '2px',
  }),
  singleValue: (base, state) => ({
    ...base,
    color: 'hsl(var(--foreground))',
    marginLeft: 0,
    marginRight: 0,
    paddingLeft: 0,
    paddingRight: 0,
    position: 'relative',
    left: 0,
    maxWidth: 'calc(100% - 8px)',
    overflow: 'visible',
    textOverflow: 'clip',
  }),
  input: base => ({
    ...base,
    color: 'hsl(var(--foreground))',
    margin: 0,
    paddingLeft: '2px',
  }),
  placeholder: base => ({
    ...base,
    color: 'hsl(var(--muted-foreground))',
  }),
  noOptionsMessage: base => ({
    ...base,
    color: 'hsl(var(--muted-foreground))',
  }),
  loadingMessage: base => ({
    ...base,
    color: 'hsl(var(--muted-foreground))',
  }),
  multiValue: base => ({
    ...base,
    backgroundColor: 'hsl(var(--accent))',
  }),
  multiValueLabel: base => ({
    ...base,
    color: 'hsl(var(--accent-foreground))',
  }),
  multiValueRemove: base => ({
    ...base,
    color: 'hsl(var(--accent-foreground))',
    '&:hover': {
      backgroundColor: 'hsl(var(--destructive))',
      color: 'hsl(var(--destructive-foreground))',
    },
  }),
  indicatorSeparator: base => ({
    ...base,
    backgroundColor: 'hsl(var(--border))',
  }),
  dropdownIndicator: base => ({
    ...base,
    color: 'hsl(var(--muted-foreground))',
    '&:hover': {
      color: 'hsl(var(--foreground))',
    },
  }),
  clearIndicator: base => ({
    ...base,
    color: 'hsl(var(--muted-foreground))',
    '&:hover': {
      color: 'hsl(var(--foreground))',
    },
  }),
};

export {
  api,
  authApi,
  selectOptionsFactory,
  authFileUploadApi,
  selectOptionsFactoryClickable,
  filterFactory,
  cryptoService,
  selectCurrencyFactory,
  selectInvoiceFactory,
  optionFactory,
  ActionMessagesList,
  ReportsColumnList,
  InputValidation,
  DropdownLists,
  Lists,
  renderList,
  StatusActionList,
  selectStyles,
};
