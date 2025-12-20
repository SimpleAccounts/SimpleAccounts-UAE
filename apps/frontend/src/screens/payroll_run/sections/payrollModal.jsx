import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  Table,
} from 'reactstrap';

import { toast } from 'sonner';

import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings(data);

// Validation schema
const payrollModalSchema = z.object({
  noOfDays: z.string().optional(),
  lop: z.number().min(0).optional(),
});

const columnHeader1 = [
  { label: '(+) EARNINGS', value: '(+) EARNINGS', sort: false },
  { label: 'AMOUNT', value: 'AMOUNT', sort: false },
];

const columnHeader2 = [
  { label: '(-) DEDUCTIONS', value: '(-) DEDUCTIONS', sort: false },
  { label: 'AMOUNT', value: 'AMOUNT', sort: false },
];

function PayrollModal({
  openPayrollModal,
  closePayrollModal,
  updateEmployeeSalary,
  selectedData,
  employeename,
  salaryDetailAsNoOfDaysMap,
  netPay,
  noOfDays,
  current_employee,
  lop,
  updateParentLop,
}) {
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');
  const [currentLop, setCurrentLop] = useState(lop || 0);
  const [currentNoOfDays, setCurrentNoOfDays] = useState(noOfDays || 30);
  const [currentNetPay, setCurrentNetPay] = useState(netPay || 0);
  const [currentSelectedData, setCurrentSelectedData] = useState(selectedData || {});

  const regEx = /^[0-9]+$/;

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(payrollModalSchema),
    defaultValues: {
      noOfDays: '',
      lop: 0,
    },
  });

  useEffect(() => {
    strings.setLanguage(language);
  }, [language]);

  // Update state when props change
  useEffect(() => {
    setCurrentLop(lop || 0);
  }, [lop]);

  useEffect(() => {
    setCurrentNoOfDays(noOfDays || 30);
  }, [noOfDays]);

  useEffect(() => {
    setCurrentNetPay(netPay || 0);
  }, [netPay]);

  useEffect(() => {
    setCurrentSelectedData(selectedData || {});
  }, [selectedData]);

  const handleLopChange = value => {
    const lopValue = parseInt(value, 10) || 0;
    const noOfDaysValue = 30 - lopValue;
    setCurrentLop(lopValue);
    setCurrentNoOfDays(noOfDaysValue);
    if (updateParentLop) {
      updateParentLop(lopValue, noOfDaysValue);
    }
  };

  const onSubmit = data => {
    const formData = new FormData();
    formData.append('id', current_employee);
    formData.append('noOfDays', currentNoOfDays);

    updateEmployeeSalary(formData)
      .then(res => {
        if (res.status === 200) {
          closePayrollModal(true);
        }
      })
      .catch(err => {
        toast.error(`${err.data}`, {
          position: 'top-right',
        });
      });
  };

  return (
    <div className="contact-modal-screen">
      <Modal isOpen={openPayrollModal} className="modal-success payroll-modal">
        <Form onSubmit={handleSubmit(onSubmit)} className="create-contact-screen">
          <CardHeader>
            <Row>
              <Col>
                <div>
                  <span className="ml-2">{strings.EmployeeName}:</span>
                  <h4>{employeename}</h4>
                </div>
              </Col>
            </Row>
          </CardHeader>
          <ModalBody>
            <Row>
              <Col>
                <h5 className="mb-2 text-left">{strings.PayableDays}</h5>
              </Col>
              <Col className="text-left">
                <label className="mb-2">30</label>
              </Col>
            </Row>

            <Row>
              <Col>
                <h5 className="mt-2 text-left">{strings.LOPDays}</h5>
              </Col>
              <Col className="text-left">
                <Controller
                  name="lop"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      maxLength="3"
                      id="lop"
                      className={errors.lop ? 'is-invalid' : ''}
                      value={currentLop}
                      onChange={e => {
                        const value = e.target.value;
                        if (value === '' || regEx.test(value)) {
                          field.onChange(value);
                          handleLopChange(value);
                        }
                      }}
                    />
                  )}
                />
              </Col>
            </Row>
            <hr></hr>
            <Row>
              <Col>
                <h5 className="mt-2 text-left">{strings.ActualPayableDays}</h5>
              </Col>
              <Col className="text-left">
                <label className="mt-2">{currentNoOfDays}</label>
              </Col>
            </Row>

            <hr></hr>
            <Table>
              <thead style={{ backgroundColor: '#dfe9f7' }}>
                <tr>
                  {columnHeader1.map((column, index) => (
                    <th key={index}>{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentSelectedData?.salaryDetailAsNoOfDaysMap?.Earnings &&
                  Object.values(currentSelectedData.salaryDetailAsNoOfDaysMap.Earnings).map(
                    (item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>
                          {item.value?.toLocaleString(undefined, { maximumFractionDigits: 2 })
                            ? item.value.toFixed(2)
                            : ' '}
                        </td>
                      </tr>
                    )
                  )}
              </tbody>
            </Table>
            {currentSelectedData?.salaryDetailAsNoOfDaysMap?.Deductions && (
              <Table>
                <thead style={{ backgroundColor: '#dfe9f7' }}>
                  <tr>
                    {columnHeader2.map((column, index) => (
                      <th key={index}>{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.values(currentSelectedData.salaryDetailAsNoOfDaysMap.Deductions).map(
                    (item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.value ? item.value.toFixed(2) : ' '}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </Table>
            )}
            <hr></hr>
            <Row style={{ backgroundColor: '#dfe9f7' }}>
              <Col lg={6}>
                <h5 className="mt-2 text-left">{strings.NetPay}</h5>
              </Col>
              <Col lg={6} className="text-left">
                <h4 className="mt-2">
                  {currentNetPay.toLocaleString(navigator.language, {
                    minimumFractionDigits: 2,
                  })}
                </h4>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" color="primary" className="btn-square mr-3">
              <i className="fa fa-dot-circle-o"></i> {strings.Save}
            </Button>
            &nbsp;
            <Button
              color="secondary"
              className="btn-square"
              onClick={() => {
                closePayrollModal(false);
              }}
            >
              <i className="fa fa-ban"></i> {strings.Cancel}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
}

export default PayrollModal;
