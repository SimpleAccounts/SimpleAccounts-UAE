import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Row, Col } from 'components/migration';
import * as ExpenseDetailsAction from '../detail/actions';
import * as ExpenseActions from '../../actions';
import ReactToPrint from 'react-to-print';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import './style.scss';
import { ExpenseTemplate } from './sections/';
import ActionButtons from 'components/view_actions_buttons';
import { InvoiceViewJournalEntries } from 'components';
import { StatusActionList } from 'utils';
import { FileText, Printer, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ViewExpense = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const expense_detail = useSelector(state => state.expense.expense_detail);
  const profile = useSelector(state => state.auth.profile);

  const [expenseData, setExpenseData] = useState({});
  const [id] = useState(location?.state?.expenseId);
  const [expenseId, setExpenseId] = useState(location?.state?.id);
  const [expenseStatus, setExpenseStatus] = useState('');
  const [actionList, setActionList] = useState([]);
  const [companyData, setCompanyData] = useState({});

  const componentRef = useRef(null);

  useEffect(() => {
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeData = () => {
    dispatch(ExpenseActions.getCompanyDetails()).then(res => {
      if (res.status === 200) {
        setCompanyData(res.data);
      }
    });

    if (location.state && location.state.expenseId) {
      dispatch(ExpenseDetailsAction.getExpenseDetail(location.state.expenseId)).then(res => {
        if (res.status === 200) {
          const data = res.data;
          const status = data.expenseStatus ?? '';
          let statusActionList = StatusActionList.ExpenseStatusActionList;
          if (status && statusActionList && statusActionList.length > 0) {
            const statuslist = statusActionList.find(obj => obj.status === status);
            statusActionList = statuslist ? statuslist.list : [];
          }

          setExpenseData({ id: location.state.expenseId, ...res.data });
          setExpenseId(location.state.expenseId);
          setActionList(statusActionList);
          setExpenseStatus(res.data.expenseStatus);
        }
      });
    }
  };

  return (
    <div className="view-invoice-screen">
      <div className="animated fadeIn">
        <Row>
          <Col lg={12} className="mx-auto">
            <div className="pull-left">
              <ActionButtons
                id={location.state?.expenseId}
                history={{ push: (path, state) => navigate(path, { state }) }}
                URL={'/admin/expense/expense'}
                invoiceData={expenseData}
                postingRefType={'EXPENSE'}
                initializeData={() => {
                  initializeData();
                }}
                actionList={actionList}
                invoiceStatus={expenseStatus}
              />
            </div>
            <div className="pull-right">
              <div className="d-flex align-items-center">
                <ReactToPrint
                  trigger={() => (
                    <Button variant="outline" className="btn-square mr-2">
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  )}
                  content={() => componentRef.current}
                />
                <Button
                  variant="outline"
                  className="btn-square"
                  onClick={() => navigate('/admin/expense/expense')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </Col>
        </Row>
        <div ref={componentRef}>
          <ExpenseTemplate
            expenseData={expenseData}
            companyData={companyData}
            id={id}
            expenseId={expenseId}
          />
        </div>
        <div className="mt-4">
          <InvoiceViewJournalEntries
            id={location.state?.expenseId}
            postingRefType={'EXPENSE'}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewExpense;
