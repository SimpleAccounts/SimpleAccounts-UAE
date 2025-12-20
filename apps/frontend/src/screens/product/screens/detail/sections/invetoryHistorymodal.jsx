import React, { useState, useEffect, useRef, useMemo } from 'react';
import { connect } from 'react-redux';
import {
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	CardHeader,
	ModalBody,
	ModalFooter,
	ButtonGroup,
	CardBody,
	Modal,
} from 'reactstrap';
import dayjs from '@/utils/date';
import { data } from '../../../../Language/index';
import LocalizedStrings from 'react-localization';
import '../style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';
import { Currency } from 'components';
import { DataTable } from '@/components/ui/data-table';
import { mkConfig, generateCsv, download } from 'export-to-csv';

const mapStateToProps = (state) => {
	return {
		contact_list: state.request_for_quotation.contact_list,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {};
};

const strings = new LocalizedStrings(data);

const InventoryHistoryModal = ({
	openModal,
	closeModal,
	id,
	inventory_history_list,
	universal_currency_list,
}) => {
	const [language] = useState(window['localStorage'].getItem('language'));
	const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState([]);

	const pdfExportComponent = useRef(null);

	useEffect(() => {
		strings.setLanguage(language);
	}, [language]);

	const renderUnitCost = (value) => {
		return value ? (
			<Currency
				value={value}
				currencySymbol={
					universal_currency_list &&
					universal_currency_list[0] &&
					universal_currency_list[0].currencyIsoCode
						? universal_currency_list[0].currencyIsoCode
						: 'AED'
				}
			/>
		) : (
			''
		);
	};

	const renderunitSellingPrice = (value) => {
		return value ? (
			<Currency
				value={value}
				currencySymbol={
					universal_currency_list &&
					universal_currency_list[0] &&
					universal_currency_list[0].currencyIsoCode
						? universal_currency_list[0].currencyIsoCode
						: 'AED'
				}
			/>
		) : (
			''
		);
	};

	const renderDate = (value) => {
		return dayjs(value).format('DD/MM/YYYY');
	};

    const handleExportCSV = () => {
        if (inventory_history_list && inventory_history_list.length > 0) {
            const csvConfig = mkConfig({ useKeysAsHeaders: true, filename: 'Inventory History' });
            const csv = generateCsv(csvConfig)(inventory_history_list);
            download(csvConfig)(csv);
        }
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'supplierName',
            header: `${strings.Supplier} / ${strings.Customer}`,
        },
        {
            accessorKey: 'date',
            header: strings.Date,
            cell: ({ getValue }) => renderDate(getValue()),
        },
        {
            accessorKey: 'transactionType',
            header: strings.TransactionType,
        },
        {
            accessorKey: 'invoiceNumber',
            header: strings.InvoiceNumber,
        },
        {
            accessorKey: 'quantitySold',
            header: 'Quantity Sold',
            cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
        },
        {
            accessorKey: 'unitCost',
            header: strings.UnitCost,
            cell: ({ getValue }) => <div className="text-right">{renderUnitCost(getValue())}</div>,
        },
        {
            accessorKey: 'unitSellingPrice',
            header: strings.UnitSellingPrice,
            cell: ({ getValue }) => <div className="text-right">{renderunitSellingPrice(getValue())}</div>,
        },
    ], [universal_currency_list]);

	return (
		<div className="contact-modal-screen">
			<Modal isOpen={openModal} className="modal-success contact-modal">
				<ModalBody style={{ padding: '15px 0px 0px 0px' }}>
					<div className="view-invoice-screen" style={{ padding: ' 0px 1px' }}>
						<div className="animated fadeIn">
							<Row>
								<Col lg={12} className="mx-auto">
									<div
										className="pull-right mb-1"
										style={{ display: 'inline-flex', marginRight: '20px' }}
									>
										<Button
											type="button"
											className=" print-btn-cont"
											style={{ color: 'black' }}
											onClick={() => {
												closeModal(false);
											}}
										>
											X
										</Button>
									</div>
									<div>
										<PDFExport
											ref={pdfExportComponent}
											scale={0.8}
											paperSize="A4"
										>
											<CardHeader>
												<Row>
													<Col lg={12}>
														<div className="h4 mb-0 d-flex align-items-center">
															<i className="fa fa-history fa-2x" />
															<span className="ml-2">
																{strings.InventoryHistory}
															</span>
														</div>
													</Col>
												</Row>
											</CardHeader>
											<CardBody id="section-to-print" style={{}}>
												<PDFExport
													ref={pdfExportComponent}
													scale={0.8}
													paperSize="A4"
												>
													<div>
														<Form name="simpleForm">
															<div className="flex-wrap d-flex justify-content-end">
																<FormGroup>
																	<ButtonGroup className="mr-3">
																		<Button
																			color="primary"
																			className="btn-square"
																			onClick={handleExportCSV}
																		>
																			<i className="fa glyphicon glyphicon-export fa-download mr-1" />
																			{strings.Export}
																		</Button>
																	</ButtonGroup>
																</FormGroup>
															</div>
														</Form>
													</div>

													{inventory_history_list &&
													inventory_history_list.length > 0 ? (
														inventory_history_list.map((item, index) => {
															if (index === 0) {
																return (
																	<table key={index}>
																		<tbody>
																			<tr style={{ background: '#f7f7f7' }}>
																				<td colSpan="9">
																					<b style={{ fontWeight: '600' }}>
																						<div>
																							<h5> {strings.ProductCode} : </h5>
																						</div>
																					</b>
																				</td>
																				<td colSpan="9">
																					<b style={{ fontWeight: '600' }}>
																						<div>
																							<h5>
																								{Object.values(
																									item['productCode'],
																								)}{' '}
																							</h5>
																						</div>
																					</b>
																				</td>
																			</tr>
																			<tr style={{ background: '#f7f7f7' }}>
																				<td colSpan="9">
																					<b style={{ fontWeight: '600' }}>
																						<div>
																							<h5>
																								{strings.ProductName}:{' '}
																							</h5>
																						</div>
																					</b>
																				</td>
																				<td colSpan="9">
																					<b style={{ fontWeight: '600' }}>
																						<div>
																							<h5>
																								{Object.values(
																									item['productname'],
																								)}{' '}
																							</h5>
																						</div>
																					</b>
																				</td>
																			</tr>
																		</tbody>
																	</table>
																);
															}
															return null;
														})
													) : (
														' '
													)}

													<br />
													<br />
													<div>
                                                        <DataTable
                                                            data={inventory_history_list || []}
                                                            columns={columns}
                                                            manualPagination={false}
                                                            pagination={pagination}
                                                            onPaginationChange={setPagination}
                                                            manualSorting={false}
                                                            sorting={sorting}
                                                            onSortingChange={setSorting}
                                                        />
													</div>
												</PDFExport>
											</CardBody>
										</PDFExport>
									</div>
								</Col>
							</Row>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button
						color="secondary"
						className="btn-square"
						onClick={() => {
							closeModal(false);
						}}
					>
						<i className="fa fa-ban"></i> {strings.Cancel}
					</Button>
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(InventoryHistoryModal);
