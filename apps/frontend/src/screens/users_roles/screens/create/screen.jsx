import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Form,
  FormGroup,
  Label,
  Row,
  Col,
} from 'reactstrap';
import { LeavePage, Loader } from 'components';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { CommonActions } from 'services/global';
import './style.scss';
import * as roleActions from '../create/actions';
import { data } from '../../../Language/index';
import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings(data);

if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

// Zod validation schema
const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(30, 'Name is too long'),
  description: z.string().optional(),
});

const mapStateToProps = state => {
  return {
    vat_row: state.vat.vat_row,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commonActions: bindActionCreators(CommonActions, dispatch),
    RoleActions: bindActionCreators(roleActions, dispatch),
  };
};

const regCode = /[a-zA-Z0-9 ]+$/;

const CreateRole = ({ commonActions, RoleActions, history }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');
  const [createMore, setCreateMore] = useState(false);
  const [roleList, setRoleList] = useState([]);
  const [roleexist, setRoleexist] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [checked, setChecked] = useState([]);
  const [expanded, setExpanded] = useState(['SelectAll']);
  const [validationForSelect, setValidationForSelect] = useState(0);
  const [disableLeavePage, setDisableLeavePage] = useState(false);

  const form = useForm({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: '',
      description: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    trigger,
  } = form;

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = useCallback(() => {
    RoleActions.getRoleList().then(res => {
      if (res.status === 200) {
        var result = res.data.map(function (el) {
          var o = Object.assign({}, el);
          o.value = el.moduleId;
          o.label = el.moduleName;
          if (el.moduleName === 'Customer Receipts') {
            o.label = 'Invoice Receipts';
          } else if (el.moduleName === 'Supplier Receipts') {
            o.label = 'Purchase Receipts';
          } else {
            o.label = el.moduleName;
          }
          return o;
        });
        list_to_tree(result);
      }
    });
  }, [RoleActions]);

  const list_to_tree = arr => {
    let arrMap = new Map(arr.map(item => [item.moduleId, item]));
    let tree = [];

    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];

      if (item.parentModuleId) {
        let parentItem = arrMap.get(item.parentModuleId);

        if (parentItem) {
          let { children } = parentItem;

          if (children) {
            parentItem.children.push(item);
          } else {
            parentItem.children = [item];
          }
        }
      } else {
        tree.push(item);
      }
    }
    setRoleList(tree);
  };

  const validationCheck = useCallback(
    value => {
      const data = {
        moduleType: 8,
        name: value,
      };
      RoleActions.checkValidation(data).then(response => {
        if (response.data === 'Role Name Already Exists') {
          setRoleexist(true);
          setError('name', {
            type: 'manual',
            message: 'Role name is already exist',
          });
        } else {
          setRoleexist(false);
          clearErrors('name');
        }
      });
    },
    [RoleActions, setError, clearErrors]
  );

  const onCheck = (checked, targetNode) => {
    setChecked(checked);
    if (Array.isArray(checked) && checked.length !== 0) {
      setValidationForSelect(checked[0]);
    } else {
      setValidationForSelect(checked.length);
    }
  };

  const onExpand = expanded => {
    setExpanded(expanded);
  };

  const getvalidation = () => {
    let msg = validationForSelect !== 0 ? '' : 'Note: Please select atleast 1 module';
    return (
      <div>
        <b>{msg}</b>
      </div>
    );
  };

  const onSubmit = data => {
    if (validationForSelect === 0) {
      return;
    }

    if (roleexist) {
      setError('name', {
        type: 'manual',
        message: 'Role name is already exist',
      });
      return;
    }

    setDisabled(true);

    let checkedModules = [...checked];
    let index = checkedModules.indexOf('SelectAll');
    if (index !== -1) {
      checkedModules.splice(index, 1);
    }

    const obj = {
      roleName: data.name,
      roleDescription: data.description,
      moduleListIds: checkedModules,
      isActive: isActive,
    };

    setLoading(true);
    setLoadingMsg('Creating Users Role');

    RoleActions.createRole(obj)
      .then(res => {
        if (res.status === 200) {
          setDisabled(false);
          setLoading(false);
          setDisableLeavePage(true);
          commonActions.tostifyAlert('success', 'New Role Created Successfully!');
          reset();
          setChecked([]);
          setValidationForSelect(0);
          if (createMore) {
            setCreateMore(false);
            setDisableLeavePage(false);
          } else {
            history.push('/admin/settings/user-role');
          }
        }
      })
      .catch(err => {
        setDisabled(false);
        setLoading(false);
        commonActions.tostifyAlert('error', err.data.message);
      });
  };

  const handleNameChange = (e, onChange) => {
    const value = e.target.value;
    if (value === '' || regCode.test(value)) {
      onChange(e);
      if (value) {
        validationCheck(value);
      }
    }
  };

  const handleDescriptionChange = (e, onChange) => {
    const value = e.target.value;
    if (value === '' || regCode.test(value)) {
      onChange(e);
    }
  };

  const handleFormSubmit = async isCreateMore => {
    await trigger();
    const hasErrors = Object.keys(errors).length !== 0;
    if (hasErrors) {
      commonActions.fillManDatoryDetails();
    }
    setCreateMore(isCreateMore);
    handleSubmit(onSubmit)();
  };

  const nodes = [
    {
      value: 'SelectAll',
      label: 'Select All',
      children: roleList,
    },
  ];

  if (loading === true) {
    return <Loader loadingMsg={loadingMsg} />;
  }

  return (
    <div>
      <div className="role-create-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="nav-icon fas fa-users" />
                    <span className="ml-2"> {strings.AddNewRole}</span>
                  </div>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={6}>
                      <Form onSubmit={handleSubmit(onSubmit)} name="simpleForm">
                        <Row>
                          <Col>
                            <FormGroup className="mb-3">
                              <Label htmlFor="active">
                                <span className="text-danger">* </span>
                                {strings.Status}
                              </Label>
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              <FormGroup check inline>
                                <div className="custom-radio custom-control">
                                  <input
                                    className="custom-control-input"
                                    type="radio"
                                    id="inline-radio1"
                                    name="active"
                                    checked={selectedStatus}
                                    value={true}
                                    onChange={e => {
                                      if (e.target.value === 'true') {
                                        setSelectedStatus(true);
                                        setIsActive(true);
                                      }
                                    }}
                                  />
                                  <label className="custom-control-label" htmlFor="inline-radio1">
                                    {strings.Active}
                                  </label>
                                </div>
                              </FormGroup>
                              <FormGroup check inline>
                                <div className="custom-radio custom-control">
                                  <input
                                    className="custom-control-input"
                                    type="radio"
                                    id="inline-radio2"
                                    name="active"
                                    value={false}
                                    checked={!selectedStatus}
                                    onChange={e => {
                                      if (e.target.value === 'false') {
                                        setSelectedStatus(false);
                                        setIsActive(false);
                                      }
                                    }}
                                  />
                                  <label className="custom-control-label" htmlFor="inline-radio2">
                                    {strings.Inactive}
                                  </label>
                                </div>
                              </FormGroup>
                            </FormGroup>
                          </Col>
                        </Row>
                        <FormGroup>
                          <Label htmlFor="name">
                            <span className="text-danger">* </span> {strings.Name}
                          </Label>
                          <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="text"
                                maxLength="30"
                                id="name"
                                placeholder={strings.Enter + strings.Name}
                                {...field}
                                onChange={e => handleNameChange(e, field.onChange)}
                                className={errors.name ? 'is-invalid' : ''}
                              />
                            )}
                          />
                          {errors.name && (
                            <div className="invalid-feedback">{errors.name.message}</div>
                          )}
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="description">{strings.Description}</Label>
                          <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="text"
                                id="description"
                                placeholder={strings.Enter + strings.Description}
                                {...field}
                                onChange={e => handleDescriptionChange(e, field.onChange)}
                                className={errors.description ? 'is-invalid' : ''}
                              />
                            )}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label>
                            <span className="text-danger">* </span> {strings.Modules}
                            {getvalidation()}
                          </Label>
                          <CheckboxTree
                            id="RoleList"
                            name="RoleList"
                            nodes={nodes}
                            checked={checked}
                            expanded={expanded}
                            iconsClass="fa5"
                            checkModel="all"
                            onCheck={onCheck}
                            onExpand={onExpand}
                          />
                        </FormGroup>

                        <FormGroup className="text-right mt-5">
                          <Button
                            type="button"
                            name="submit"
                            color="primary"
                            className="btn-square mr-3"
                            disabled={disabled}
                            onClick={() => handleFormSubmit(false)}
                          >
                            <i className="fa fa-dot-circle-o"></i>{' '}
                            {disabled ? 'Creating...' : strings.Create}
                          </Button>
                          <Button
                            name="button"
                            color="primary"
                            className="btn-square mr-3"
                            disabled={disabled}
                            onClick={() => handleFormSubmit(true)}
                          >
                            <i className="fa fa-refresh"></i>{' '}
                            {disabled ? 'Creating...' : strings.CreateandMore}
                          </Button>
                          <Button
                            type="button"
                            color="secondary"
                            className="btn-square"
                            onClick={() => {
                              history.push('/admin/settings/user-role');
                            }}
                          >
                            <i className="fa fa-ban"></i> {strings.Cancel}
                          </Button>
                        </FormGroup>
                      </Form>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      {!disableLeavePage && <LeavePage />}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateRole);
