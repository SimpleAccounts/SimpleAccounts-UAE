import React, { useState, useEffect, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Row,
	Col,
	Form,
	FormGroup,
} from 'reactstrap';
import * as DebitNoteApplyToInvoiceActions from './actions';
import * as DebitNoteActions from '../../actions';
import { Loader, LeavePage, Currency } from 'components';
import 'react-datepicker/dist/react-datepicker.css';
import { CommonActions } from 'services/global';
import './style.scss';
import dayjs from '@/utils/date';
import { data as languageData } from '../../../Language/index';
import LocalizedStrings from 'react-localization';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const strings = new LocalizedStrings(languageData);

const ApplyToSupplierInvoice = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

	const [language] = useState(window['localStorage'].getItem('language'));
	const [selectedRows, setSelectedRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [disabled, setDisabled] = useState(false);
	const [customerCurrency] = useState(location.state?.currency || 'AED');
	const [invoiceList, setInvoiceList] = useState([]);
	const [currentTotal, setCurrentTotal] = useState(location.state?.debitAmount || 0);
	const [cannotSave, setCannotSave] = useState(false);
	const [invoiceNumber, setInvoiceNumber] = useState(location.state?.referenceNumber || '');
	const [creditNoteId, setCreditNoteId] = useState(location.state?.creditNoteId || null);
	const [debitNoteNumber, setDebitNoteNumber] = useState(location.state?.debitNoteNumber || '');

	useEffect(() => {
		strings.setLanguage(language);
		initializeData();
	}, [language]);

	const initializeData = () => {
		if (location.state && location.state.contactId) {
			dispatch(DebitNoteApplyToInvoiceActions.getInvoicesListForCN(location.state.contactId))
				.then((res) => {
					if (res.status === 200) {
						setInvoiceList(res.data);
						setLoading(false);
					}
				});
		} else {
			navigate('/admin/expense/debit-notes');
		}
	};

    const handleRowSelectionChange = (rows) => {
        // Logic to calculate credits taken and currentTotal
        // ... (Similar to original onRowSelect but adapted for batch selection update)
        let total = location.state.debitAmount;
        const updatedInvoices = rows.map(row => {
            let creditTaken = 0;
            if (total > 0) {
                creditTaken = total > row.dueAmount ? row.dueAmount : total;
                total -= creditTaken;
            }
            return { ...row, creditstaken: creditTaken };
        });
        
        setSelectedRows(updatedInvoices);
        setCurrentTotal(total);
        setCannotSave(total < 0);
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'referenceNo',
            header: strings.InvoiceNumber,
        },
        {
            accessorKey: 'date',
            header: strings.InvoiceDate,
            cell: ({ getValue }) => dayjs(getValue()).format('DD-MM-YYYY'),
        },
        {
            accessorKey: 'dueAmount',
            header: strings.InvoiceDueAmount,
            cell: ({ getValue }) => (
                <div className="text-right">
                    <Currency value={getValue()} currencySymbol={customerCurrency} />
                </div>
            ),
        },
        {
            accessorKey: 'creditstaken',
            header: strings.AmountAppliedToTheInvoice,
            cell: ({ row }) => {
                const selected = selectedRows.find(r => r.id === row.original.id);
                return (
                    <div className="text-right">
                        <Currency value={selected?.creditstaken || 0} currencySymbol={customerCurrency} />
                    </div>
                );
            },
        },
    ], [customerCurrency, selectedRows]);

	const onSubmit = (e) => {
        e.preventDefault();
		setDisabled(true);
		const formData = new FormData();
		const ids = selectedRows.map((i) => i.id);
		formData.append('invoiceIds', ids);
		formData.append('creditNoteId', creditNoteId);

		dispatch(DebitNoteApplyToInvoiceActions.refundAgainstInvoices(formData))
			.then((res) => {
				if (res.status === 200) {
					toast.success(strings.AmountAppliedToInvoiceSuccessfully);
					navigate('/admin/expense/debit-notes');
				}
				setDisabled(false);
			})
			.catch(() => {
				setDisabled(false);
				toast.error(strings.AmountAppliedToInvoiceUnsuccessfully);
			});
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<div className="detail-customer-invoice-screen">
			<div className="animated fadeIn">
				<Row>
					<Col lg={12} className="mx-auto">
						<Card>
							<CardHeader>
								<div className="h4 mb-0 d-flex align-items-center">
									<i className="fa fa-credit-card" />
									<span className="ml-2">
										{strings.ApplyDebitsfrom} <u>{debitNoteNumber}</u>
									</span>
								</div>
							</CardHeader>
							<CardBody>
								<Form onSubmit={onSubmit}>
									<Row>
										<Col lg={12} className="h5">
											<span>{strings.DebitAmount}: <Currency value={location.state.debitAmount} currencySymbol={customerCurrency} /></span>
										</Col>
										<Col lg={12} className="mb-1" style={{ fontSize: '12px', color: currentTotal > 0 ? 'Green' : 'red' }}>
											{strings.RemainingDebitAmount}: <Currency value={currentTotal} currencySymbol={customerCurrency} /><br />
										</Col>
										<Col lg={12}>
                                            <DataTable
                                                data={invoiceList || []}
                                                columns={columns}
                                                manualPagination={false}
                                                rowSelection={true}
                                                onRowSelectionChange={handleRowSelectionChange}
                                            />
										</Col>
									</Row>

									<Row className="mt-5">
										<Col lg={12} className="text-right">
											<Button
												type="submit"
												color={selectedRows.length < 1 ? "secondary" : "primary"}
												className="btn-square mr-3"
												disabled={selectedRows.length < 1 || disabled || cannotSave}
											>
												{disabled ? strings.Saving : strings.Save}
											</Button>
											<Button
												color="secondary"
												className="btn-square"
												onClick={() => navigate('/admin/expense/debit-notes')}
											>
												{strings.Cancel}
											</Button>
										</Col>
									</Row>
								</Form>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</div>
		</div>
	);
};

export default connect()(ApplyToSupplierInvoice);
