import React, { useState, useMemo } from 'react';
import {
	Button,
	Row,
	Col,
	Form,
	Input,
	Modal,
	CardHeader,
	ModalBody,
	ModalFooter,
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { data as languageData } from '../../Language/index';
import LocalizedStrings from 'react-localization';
import { DataTable } from '@/components/ui/data-table';

const strings = new LocalizedStrings(languageData);

// Validation schema
const supplierSchema = z.object({
	firstName: z.string().min(1, 'First Name is Required').optional(),
	vatRegistrationNumber: z.string().min(1, 'Tax Registration Number is Required').optional(),
});

const SupplierModal = ({
	openMultiSupplierProductModal,
	closeMultiSupplierProductModal,
	inventory_list,
}) => {
	const [language] = useState(window['localStorage'].getItem('language'));
    const [selectedRows, setSelectedRows] = useState([]);

	strings.setLanguage(language);

	const {
		handleSubmit,
		formState: { isSubmitting },
	} = useForm({
		resolver: zodResolver(supplierSchema),
		defaultValues: {},
	});

	const renderQuantity = () => {
		return (
			<div>
				<Input type="text" placeholder={strings.Quantity}></Input>
			</div>
		);
	};

	const columns = useMemo(() => [
        {
            accessorKey: 'supplierName',
            header: 'Supplier Name',
        },
        {
            accessorKey: 'stockInHand',
            header: 'Stock in hand',
        },
        {
            accessorKey: 'reOrderLevel',
            header: 'Reorder Level',
        },
        {
            accessorKey: 'quantity', // mapping invoiceDate to quantity
            header: 'Quantity',
            cell: () => renderQuantity(),
        },
    ], []);

	const onSubmit = (values) => {
		// Handle submit logic here
	};

	return (
		<div className="contact-modal-screen">
			<Modal isOpen={openMultiSupplierProductModal} className="modal-success contact-modal">
				<Form name="simpleForm" onSubmit={handleSubmit(onSubmit)} className="create-contact-screen">
					<CardHeader>
						<Row>
							<Col lg={12}>
								<div className="h4 mb-0 d-flex align-items-center">
									<i className="nav-icon fas fa-id-card-alt" />
									<span className="ml-2">Quantity</span>
								</div>
							</Col>
						</Row>
					</CardHeader>
					<ModalBody>
						<h4 className="mb-3 mt-3">Quantity</h4>
						<div style={{ overflowX: 'auto' }}>
                            <DataTable
                                data={inventory_list || []}
                                columns={columns}
                                manualPagination={false}
                                rowSelection={true}
                                onRowSelectionChange={(rows) => setSelectedRows(rows)}
                            />
						</div>
					</ModalBody>
					<ModalFooter>
						<Button color="primary" type="submit" className="btn-square" disabled={isSubmitting}>
							<i className="fa fa-dot-circle-o"></i> Save
						</Button>
						&nbsp;
						<Button
							color="secondary"
							className="btn-square"
							onClick={() => {
								closeMultiSupplierProductModal(false);
							}}
						>
							<i className="fa fa-ban"></i> Cancel
						</Button>
					</ModalFooter>
				</Form>
			</Modal>
		</div>
	);
};

export default SupplierModal;
