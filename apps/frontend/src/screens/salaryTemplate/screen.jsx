import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Card, CardHeader, CardBody, Row, Col, Table, Button } from 'reactstrap';
import { Loader } from 'components';
import * as SalaryTemplateActions from './actions';
import { CommonActions } from 'services/global';
import './style.scss';
import { toast } from 'sonner';

const SalaryTemplate = () => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    Fixed: [],
    Variable: [],
    Deduction: [],
  });

  const columnHeader1 = [
    { label: 'Sr.No' },
    { label: 'Component Name' },
    { label: 'Type' },
    { label: 'Options' },
  ];

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    dispatch(SalaryTemplateActions.getSalaryTemplateList())
      .then(res => {
        if (res.status === 200) {
          setData({
            Fixed: res.data.salaryComponentResult.Fixed || [],
            Variable: res.data.salaryComponentResult.Variable || [],
            Deduction: res.data.salaryComponentResult.Deduction || [],
          });
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        toast.error(err && err.data ? err.data.message : 'Something Went Wrong');
      });
  };

  if (loading) {
    return <Loader />;
  }

  const renderTable = (title, items) => (
    <Col lg={8} className="mb-4">
      <h4>{title}</h4>
      <Table bordered hover responsive>
        <thead className="thead-light">
          <tr>
            {columnHeader1.map((column, index) => (
              <th key={index}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.id}</td>
              <td>{item.description}</td>
              <td>{item.formula}</td>
              <td>{item.flatAmount}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Col>
  );

  return (
    <div className="employee-screen">
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            <Row>
              <Col lg={12}>
                <div className="h4 mb-0 d-flex align-items-center">
                  <i className="fas fa-object-group" />
                  <span className="ml-2">Salary Templates</span>
                </div>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <Row>
              {renderTable('Fixed Earnings', data.Fixed)}
              {renderTable('Variable Earnings', data.Variable)}
              {renderTable('Deductions', data.Deduction)}
            </Row>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SalaryTemplate;
