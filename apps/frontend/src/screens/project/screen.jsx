import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  ButtonGroup,
  Input,
} from 'components/migration';
import { Loader } from 'components';
import * as ProjectActions from './actions';
import { CSVLink } from '@/components/ui/csv-link';
import './style.scss';
import { DataTable } from '@/components/ui/data-table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Network, Plus, Search, RefreshCw, Download, Trash2 } from 'lucide-react';

const Project = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const csvLink = useRef(null);

  const { project_list } = useSelector(state => ({
    project_list: state.project.project_list,
  }));

  const [loading, setLoading] = useState(true);
  const [selectedRows, _setSelectedRows] = useState([]);
  const [dialog, _setDialog] = useState(null);
  const [filterData, setFilterData] = useState({
    projectName: '',
    vatRegistrationNumber: '',
    expenseBudget: '',
    revenueBudget: '',
  });
  const [csvData, setCsvData] = useState([]);
  const [view, setView] = useState(false);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([]);

  const initializeData = useCallback(() => {
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

    dispatch(ProjectActions.getProjectList(postData))
      .then(res => {
        if (res.status === 200) {
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        toast.error(err && err.data ? err.data.message : 'Something Went Wrong');
      });
  }, [dispatch, pagination, sorting, filterData]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const goToDetail = row => {
    navigate(`/admin/master/project/detail`, { state: { id: row.projectId } });
  };

  const handleFilterChange = (val, name) => {
    setFilterData(prev => ({ ...prev, [name]: val }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    initializeData();
  };

  const clearAll = () => {
    setFilterData({
      projectName: '',
      vatRegistrationNumber: '',
      expenseBudget: '',
      revenueBudget: '',
    });
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const getCsvData = () => {
    if (csvData.length === 0) {
      const obj = { paginationDisable: true };
      dispatch(ProjectActions.getProjectList(obj)).then(res => {
        if (res.status === 200) {
          setCsvData(res.data.data);
          setView(true);
          setTimeout(() => {
            csvLink.current.link.click();
          }, 0);
        }
      });
    } else {
      csvLink.current.link.click();
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'projectName',
        header: 'Project Name',
      },
      {
        accessorKey: 'expenseBudget',
        header: 'Expense Budget',
      },
      {
        accessorKey: 'revenueBudget',
        header: 'Revenue Budget',
      },
    ],
    []
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="product-screen">
        <div className="animated fadeIn">
          {dialog}
          <Card>
            <CardHeader>
              <Row>
                <Col lg={12}>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <Network className="h-4 w-4" />
                    <span className="ml-2">Projects</span>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <div className="d-flex justify-content-end">
                    <ButtonGroup size="sm">
                      <Button color="success" className="btn-square" onClick={getCsvData}>
                        <Download className="h-4 w-4 mr-1" />
                        Export To CSV
                      </Button>
                      {view && (
                        <CSVLink
                          data={csvData}
                          filename={'Project.csv'}
                          className="hidden"
                          ref={csvLink}
                          target="_blank"
                        />
                      )}
                      <Button
                        color="primary"
                        className="btn-square"
                        onClick={() => navigate(`/admin/master/project/create`)}
                      >
                        <Plus className="h-4 w-4" />
                        New Project
                      </Button>
                      <Button
                        type="button"
                        color="warning"
                        className="btn-square"
                        disabled={selectedRows.length === 0}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Bulk Delete
                      </Button>
                    </ButtonGroup>
                  </div>
                  <div className="py-3">
                    <h5>Filter : </h5>
                    <form onSubmit={e => e.preventDefault()}>
                      <Row>
                        <Col lg={2} className="mb-1">
                          <Input
                            type="text"
                            placeholder="Project Name"
                            value={filterData.projectName}
                            onChange={e => handleFilterChange(e.target.value, 'projectName')}
                          />
                        </Col>
                        <Col lg={2} className="mb-1">
                          <Input
                            type="text"
                            placeholder="Expense Budget"
                            value={filterData.expenseBudget}
                            onChange={e => handleFilterChange(e.target.value, 'expenseBudget')}
                          />
                        </Col>
                        <Col lg={2} className="mb-1">
                          <Input
                            type="text"
                            placeholder="Revenue Budget"
                            value={filterData.revenueBudget}
                            onChange={e => handleFilterChange(e.target.value, 'revenueBudget')}
                          />
                        </Col>
                        <Col lg={2} className="mb-1">
                          <Input
                            type="text"
                            placeholder="VAT Number"
                            value={filterData.vatRegistrationNumber}
                            onChange={e =>
                              handleFilterChange(e.target.value, 'vatRegistrationNumber')
                            }
                          />
                        </Col>
                        <Col lg={1} className="pl-0 pr-0">
                          <Button
                            type="button"
                            color="primary"
                            className="btn-square mr-1"
                            onClick={handleSearch}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            color="primary"
                            className="btn-square"
                            onClick={clearAll}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </Col>
                      </Row>
                    </form>
                  </div>

                  <div>
                    <DataTable
                      data={project_list?.data || []}
                      columns={columns}
                      manualPagination={true}
                      pageCount={
                        project_list?.count
                          ? Math.ceil(project_list.count / pagination.pageSize)
                          : 0
                      }
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

export default connect()(Project);
