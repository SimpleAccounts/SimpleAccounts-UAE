import React, { useState, useEffect, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  ButtonGroup,
  Input,
} from 'reactstrap';
import { Loader, ConfirmDeleteModal } from 'components';
import * as EmployeeActions from './actions';
import { CommonActions } from 'services/global';
import './style.scss';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const EmployeeFinancial = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { employee_list } = useSelector((state) => ({
        employee_list: state.employee.employee_list,
    }));

    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState([]);
    const [filterData, setFilterData] = useState({
        name: '',
        email: ''
    });

    useEffect(() => {
        initializeData();
    }, [pagination, sorting]);

    const initializeData = () => {
        setLoading(true);
        const paginationData = {
            pageNo: pagination.pageIndex,
            pageSize: pagination.pageSize,
        };
        const sortingData = {
            order: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : '',
            sortingCol: sorting.length > 0 ? sorting[0].id : '',
        };
        const postData = { ...filterData, ...paginationData, ...sortingData };
        
        dispatch(EmployeeActions.getEmployeeList(postData))
            .then((res) => {
                if (res.status === 200) {
                    setLoading(false);
                }
            })
            .catch((err) => {
                setLoading(false);
                toast.error(err && err.data ? err.data.message : 'Something Went Wrong');
            });
    };

    const goToDetail = (row) => {
        navigate('/admin/master/employee/detail', { state: { id: row.id } });
    };

    const handleFilterChange = (val, name) => {
        setFilterData(prev => ({ ...prev, [name]: val }));
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
        initializeData();
    };

    const clearAll = () => {
        setFilterData({ name: '', email: '' });
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'fullName',
            header: 'Full Name',
        },
        {
            accessorKey: 'dob',
            header: 'Date Of Birth',
        },
        {
            accessorKey: 'referenceCode',
            header: 'Reference Code',
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'vatRegestationNo',
            header: 'VAT Registration No',
        },
    ], []);

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            <div className="employee-screen">
                <div className="animated fadeIn">
                    <Card>
                        <CardHeader>
                            <Row>
                                <Col lg={12}>
                                    <div className="h4 mb-0 d-flex align-items-center">
                                        <i className="fas fa-object-group" />
                                        <span className="ml-2">Financial</span>
                                    </div>
                                </Col>
                            </Row>
                        </CardHeader>
                        <CardBody>
                            <Row>
                                <Col lg={12}>
                                    <div className="d-flex justify-content-end">
                                        <ButtonGroup size="sm">
                                            <Button
                                                color="primary"
                                                className="btn-square"
                                                onClick={() => navigate(`/admin/payroll/financial/create`)}
                                            >
                                                <i className="fas fa-plus mr-1" />
                                                New Employment
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                    <div className="py-3">
                                        <h5>Filter : </h5>
                                        <form onSubmit={(e) => e.preventDefault()}>
                                            <Row>
                                                <Col lg={3} className="mb-1">
                                                    <Input type="text" placeholder="Name" value={filterData.name} onChange={(e) => handleFilterChange(e.target.value, 'name')} />
                                                </Col>
                                                <Col lg={3} className="mb-2">
                                                    <Input type="text" placeholder="Email" value={filterData.email} onChange={(e) => handleFilterChange(e.target.value, 'email')} />
                                                </Col>
                                                <Col lg={1} className="pl-0 pr-0" style={{ display: "contents" }}>
                                                    <Button type="button" color="primary" className="btn-square mr-1" onClick={handleSearch}>
                                                        <i className="fa fa-search"></i>
                                                    </Button>
                                                    <Button type="button" color="primary" className="btn-square" onClick={clearAll}>
                                                        <i className="fa fa-refresh"></i>
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </form>
                                    </div>
                                    
                                    <div>
                                        <DataTable
                                            data={employee_list?.data || []}
                                            columns={columns}
                                            manualPagination={true}
                                            pageCount={employee_list?.count ? Math.ceil(employee_list.count / pagination.pageSize) : 0}
                                            onPaginationChange={setPagination}
                                            pagination={pagination}
                                            manualSorting={true}
                                            onSortingChange={setSorting}
                                            sorting={sorting}
                                            onRowClick={goToDetail}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default connect()(EmployeeFinancial);
