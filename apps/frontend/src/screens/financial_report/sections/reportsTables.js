import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as FinancialReportActions from "../actions";
import "./style.scss";
import { data } from "screens/Language";
import LocalizedStrings from "react-localization";
import { ReportsColumnList } from "utils";
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Table,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

const mapStateToProps = (state) => {
  return {};
};
const mapDispatchToProps = (dispatch) => {
  return {
    financialReportActions: bindActionCreators(
      FinancialReportActions,
      dispatch
    ),
  };
};
let strings = new LocalizedStrings(data);

class ReportTables extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window["localStorage"].getItem("language"),
      loading: true,
      columnConfigs: [],
      sortedRows: [],
      dropdownOpen: "",
    };
  }

  componentDidMount = () => {
    this.getColumnConfigs();
  };

  getColumnConfigs = () => {
    const { id } = this.props;
    const postData = {
      id: id,
    };
    this.props.financialReportActions
      .getColumnConfigs(postData)
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            columnConfigs: res.data,
            loading: false,
          });
        }
      })
      .catch((err) => {
        this.setState({ loading: false });
      });
  };

  updateColumnConfigs = (json) => {
    debugger;
    const { id, reportName } = this.props;
    const postData = {
      id: id,
      reportName: reportName,
      columnNames: JSON.stringify(json),
    };
    this.props.financialReportActions
      .updateColumnConfigs(postData)
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            columnConfigs: res.data,
            loading: false,
          });
          this.getColumnConfigs();
        }
      })
      .catch((err) => {
        this.setState({ loading: false });
      });
  };

  customSort = (rows, sortModel) => {
    if (sortModel.length === 0) {
      return rows;
    }

    const sortedRows = [...rows];
    const { field, sort } = sortModel[0];

    const totalRow = sortedRows.find((row) => row.isTotalRow);
    const totalRow2 = sortedRows.find((row) => row.isTotalRow2);
    const otherRows = sortedRows.filter(
      (row) => !row.isTotalRow && !row.isTotalRow2
    );

    otherRows.sort((a, b) => {
      if (a[field] < b[field]) {
        return sort === "asc" ? -1 : 1;
      }
      if (a[field] > b[field]) {
        return sort === "asc" ? 1 : -1;
      }
      return 0;
    });

    if (totalRow) {
      otherRows.push(totalRow);
    }
    if (totalRow2) {
      otherRows.push(totalRow2);
    }
    return otherRows;
  };

  handleSortModelChange = (field, sort) => {
    const sortedRows = this.customSort(this.props.reportDataList, [
      { field, sort },
    ]);
    this.setState({ sortedRows });
  };

  renderHeader = () => {
    const { reportName } = this.props;
    const { columnConfigs } = this.state;
    const columns = ReportsColumnList.List[reportName];

    return (
      <thead className="table-header-bg">
        <tr>
          {columns.map(
            (col) =>
              columnConfigs[col.field] !== false && (
                <th key={col.field}>
                  <div className="d-flex justify-content-between">
                    <div
                      onClick={() =>
                        this.handleSortModelChange(col.field, "asc")
                      }
                    >
                      {col.headerName}
                    </div>
                    {this.renderColumnDropdown(col.field)}
                  </div>
                </th>
              )
          )}
        </tr>
      </thead>
    );
  };
  renderColumnDropdown = (column) => {
    const { columnConfigs, dropdownOpen } = this.state;
    const columnFields = Object.keys(columnConfigs);

    const toggleColumn = (field) => {
      const newColumnConfigs = {
        ...columnConfigs,
        [field]: !columnConfigs[field],
      };
      this.updateColumnConfigs(newColumnConfigs);
    };

    const hideAllColumns = () => {
      const newConfigs = {};
      columnFields.forEach((field) => {
        newConfigs[field] = false;
      });
      this.updateColumnConfigs(newConfigs);
      // this.setState({ columnConfigs: newConfigs });
    };

    const showAllColumns = () => {
      const newConfigs = {};
      columnFields.forEach((field) => {
        newConfigs[field] = true;
      });
      this.updateColumnConfigs(newConfigs);
    };

    return (
      <Dropdown
        isOpen={dropdownOpen === column}
        toggle={() =>
          this.setState({ dropdownOpen: dropdownOpen ? null : column })
        }
      >
        <DropdownToggle
          style={{
            background: "transparent",
            border: "none",
            opacity: "0.6",
            color: "#000",
            boxShadow: "none",
          }}
        >
          <i className="fa fa-ellipsis-v" />
        </DropdownToggle>
        <DropdownMenu>
          <div className="column-dropdown p-2">
            <input
              type="text"
              placeholder="Find column"
              className="form-control mb-2"
              onChange={(e) =>
                this.setState({ columnSearch: e.target.value.toLowerCase() })
              }
            />
            <div className="column-list">
              {columnFields
                .filter((field) =>
                  field.toLowerCase().includes(this.state.columnSearch || "")
                )
                .map((field) => {
                  const columnData = this.getHeaderName(field);
                  if (!columnData) return "";
                  return (
                    <div
                      key={field}
                      className={`d-flex align-items-center`}
                      style={
                        columnData.hideable === false ? { opacity: "50%" } : {}
                      }
                    >
                      <input
                        type="checkbox"
                        checked={columnConfigs[field]}
                        onChange={() => {
                          if (columnData.hideable !== false)
                            toggleColumn(field);
                        }}
                        className={`mt-0`}
                      />
                      <span className="ml-2">{columnData.headerName}</span>
                    </div>
                  );
                })}
            </div>
            <DropdownItem divider />
            <div className="d-flex justify-content-between">
              <button className="btn btn-link p-0" onClick={hideAllColumns}>
                HIDE ALL
              </button>
              <button className="btn btn-link p-0" onClick={showAllColumns}>
                SHOW ALL
              </button>
            </div>
          </div>
        </DropdownMenu>
      </Dropdown>
    );
  };

  getHeaderName = (field) => {
    const { reportName } = this.props;
    const columns = ReportsColumnList.List[reportName];
    if (columns) {
      const column = columns.find((obj) => obj.field === field);
      if (column) {
        return column;
      }
    }
    return null;
  };

  renderRows = () => {
    const { sortedRows } = this.state;
    const { reportDataList, reportName } = this.props;
    const columns = ReportsColumnList.List[reportName];
    const rows = sortedRows.length ? sortedRows : reportDataList;

    return (
      <tbody className=" table-bordered table-hover">
        {rows.map((row) => (
          <tr key={row.id} className={row.isTotalRow ? "total-row" : ""}>
            {columns.map(
              (col) =>
                this.state.columnConfigs[col.field] !== false && (
                  <td key={col.field}>
                    {" "}
                    {col.renderCell
                      ? col.renderCell({ row, value: row[col.field] })
                      : row[col.field]}
                  </td>
                )
            )}
          </tr>
        ))}
      </tbody>
    );
  };

  render() {
    strings.setLanguage(this.state.language);
    const { reportDataList, rowHeight } = this.props;

    return (
      <div id="tbl_exporttable_to_xls" className="table-wrapper">
        {reportDataList && (
          <Table responsive className="table-bordered">
            {this.renderHeader()}
            {this.renderRows()}
          </Table>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReportTables);
