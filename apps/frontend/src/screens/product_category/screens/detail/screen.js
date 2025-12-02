import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
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
  Col
} from 'reactstrap'
import { LeavePage, Loader, ConfirmDeleteModal} from 'components'
import { CommonActions } from 'services/global'
import * as Yup from 'yup';
import 'react-toastify/dist/ReactToastify.css'
import './style.scss'
import * as DetailProductCategoryAction from './actions'
import { Formik } from 'formik';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import * as ProductCategoryActions from '../../actions';

// const mapStateToProps = (state) => {
//   return ({

//   })
// }

const mapStateToProps = (state) => {
	return {
		product_category_list: state.product_category.product_category_list,
	};
};
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
    detailProductCategoryAction: bindActionCreators(DetailProductCategoryAction, dispatch),
    productCategoryActions: bindActionCreators(
			ProductCategoryActions,
			dispatch,
		),
  })
}
let strings = new LocalizedStrings(data);
class DetailProductCategory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window['localStorage'].getItem('language'),
      initValue: {},
      loading: true,
      dialog: null,
      current_product_category_id: null,
      disabled: false,
      disabled1:false,
      loadingMsg:"Loading",
			disableLeavePage:false,
      isAssociatedWithProduct:false,
    }
    this.regExAlpha = /^[a-zA-Z ]+$/;
    this.regExBoth = /^[a-zA-Z0-9\s,'-/()]+$/;
    this.regExSpaceBoth = /[a-zA-Z0-9 ]+$/;
  }

  componentDidMount = () => {
    this.props.productCategoryActions.getProductCategoryList().then((res) => {
			if (res.status === 200) {
				this.setState({
					product_category_list: res.data.data,
				});
			}
		});
    if (this.props.location.state && this.props.location.state.id) {
      this.props.detailProductCategoryAction.getProductCategoryById(this.props.location.state.id).then((res) => {
        if (res.status === 200) {
          this.setState({
            loading: false,
            current_product_category_id: this.props.location.state.id,
            productCategoryCode:res.data.productCategoryCode,
            initValue: {
              id:res.data.id ? res.data.id : '',
              productCategoryCode: res.data.productCategoryCode ? res.data.productCategoryCode : '',
              productCategoryName: res.data.productCategoryName ? res.data.productCategoryName : ''
            }
          })
          this.getAssociatedProductWithCategory(this.props.location.state.id);
        }

      }).catch((err) => {
        this.setState({loading: false})
        this.props.history.push('/admin/master/product-category')
      })
    } else {
      this.props.history.push('/admin/master/product-category')
    }
  }
  getAssociatedProductWithCategory = (category_id) =>{
    this.props.detailProductCategoryAction.getProductBy().then((res) => {
      if (res.status === 200) {
        res.data.data.map(product => {
          if(product.productCategoryId === category_id){
            this.setState({isAssociatedWithProduct : true,});
            return true;
          }
        })
        
      }
    }).catch((err) => {
      console.log(err);
    })

  }
  // Create or Edit VAT
  handleSubmit = (data) => {
    this.setState({ disabled: true });
    const { id, productCategoryName, productCategoryCode } = data;
    const postData = {
      id,
      productCategoryName: productCategoryName ? productCategoryName : '',
      productCategoryCode: productCategoryCode ? productCategoryCode : ''
    }
    this.setState({ loading:true, disableLeavePage:true, loadingMsg:"Updating Product Category..."});
    this.props.detailProductCategoryAction.updateProductCategory(postData).then((res) => {
      if (res.status === 200) {
        this.setState({ disabled: false });
        this.props.commonActions.tostifyAlert(
          'success',
           res.data ? res.data.message : 'Product Category Updated Successfully'
           )
        this.props.history.push('/admin/master/product-category')
        this.setState({ loading:false,});
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert(
        'error',
        err.data ? err.data.message : 'Product Category Updated Unsuccessfully'
         )
    })
  }

  deleteProductCategory = () => {
    const message1 =
			<text>
			<b>Delete Product Category?</b>
			</text>
			const message = 'This Product Category will be deleted permanently and cannot be recovered. ';
    this.setState({
      dialog: <ConfirmDeleteModal
        isOpen={true}
        okHandler={this.removeProductCategory}
        cancelHandler={this.removeDialog}
        message={message}
        message1={message1}
      />
    })
  }

  removeProductCategory = () => {
    this.setState({ disabled1: true });
    const {current_product_category_id} = this.state
    this.setState({ loading:true, loadingMsg:"Deleting Product Category..."});
    this.props.detailProductCategoryAction.deleteProductCategory(current_product_category_id).then((res) => {
      if (res.status === 200) {
        // this.success('Chart Account Deleted Successfully');
        this.props.commonActions.tostifyAlert(
          'success',
           res.data ? res.data.message : 'Product Category Deleted Successfully'
           )
        this.props.history.push('/admin/master/product-category')
        this.setState({ loading:false,});
      }
    }).catch((err) => {
      this.props.commonActions.tostifyAlert(
        'error',
         err.data ? err.data.message : 'Product Category Deleted Unsuccessfully'
         )
    })
  }

  removeDialog = () => {
    this.setState({
      dialog: null
    })
  }

  render() {
    strings.setLanguage(this.state.language);
    const {  loadingMsg } = this.state
    const { loading, initValue,dialog, product_category_list} = this.state
    if (product_category_list) {
			var ProductCategoryList = product_category_list.map((item) => {
				return item.productCategoryCode;
			});
		}
    return (
      loading ==true? <Loader loadingMsg={loadingMsg}/> :
<div>
      <div className="detail-vat-code-screen">
        <div className="animated fadeIn">
          {dialog}
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="nav-icon fas fa-boxes" />
                    <span className="ml-2"> {strings.UpdateProductCategory}</span>
                  </div>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <Loader></Loader>
                  ) : (
                      <Row>
                        <Col lg={6}>
                          <Formik
                            initialValues={initValue}
                            onSubmit={(values) => {
                              this.handleSubmit(values)
                            }}
                          validationSchema={Yup.object().shape({
                            productCategoryName: Yup.string()
                              .required("Product category name is required"),
                              productCategoryCode: Yup.string()
                              .required("Code is required")
                          })}
                          validate={(values) => {
                            let errors = {};
                            if (!values.productCategoryName) {
                              errors.productCategoryName =
                                'Product category name is required';
                            }
                            
                            let check=false;
                            if (
                              product_category_list &&
                              ProductCategoryList.includes(
                                values.productCategoryCode,
                              )
                            ){
                                check=true;
                            }
                     

                              if(check===true
                                && 
                               !(this.state.productCategoryCode===values.productCategoryCode)){
                              errors.productCategoryCode =
                                'Product category code already exists';
                            }
                            
                            if (!values.productCategoryCode ) {
                              errors.productCategoryCode =
                                'Product category code is required';
                            }
                            return errors;
                          }}
                    
                          >
                            {(props) => (
                              <Form onSubmit={props.handleSubmit} name="simpleForm">
                                <FormGroup>
                                  <Label htmlFor="productCategoryCode"><span className="text-danger">* </span>{strings.ProductCategoryCode}</Label>
                                  <Input
                                    type="text"
                                    maxLength='20'
                                    id="productCategoryCode"
                                    name="productCategoryCode"
                                    placeholder={strings.Enter+strings.ProductCategoryCode}
                                    onChange={(option) => { if (option.target.value === '' || this.regExBoth.test(option.target.value)){ props.handleChange('productCategoryCode')(option) }}}
                                    value={props.values.productCategoryCode}
                                    className={
                                      props.errors.productCategoryCode && props.touched.productCategoryCode
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.errors.productCategoryCode && props.touched.productCategoryCode && (
                                    <div className="invalid-feedback">{props.errors.productCategoryCode}</div>
                                  )}
                                </FormGroup>
                                <FormGroup>
                                  <Label htmlFor="productCategoryName"><span className="text-danger">* </span>{strings.ProductCategoryName}</Label>
                                  <Input
                                    type="text" 
                                    maxLength='50'
                                    id="productCategoryName"
                                    name="productCategoryName"
                                    placeholder={strings.Enter+strings.ProductCategoryName}
                                    onChange={(option) => { if (option.target.value === '' || this.regExBoth.test(option.target.value)){ 
                                      props.handleChange('productCategoryName')(option) }}}
                                    value={props.values.productCategoryName}
                                    className={
                                      props.errors.productCategoryName && props.touched.productCategoryName
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  
                                  {props.errors.productCategoryName && props.touched.productCategoryName && (
                                    <div className="invalid-feedback">{props.errors.productCategoryName}</div>
                                  )}
                                </FormGroup>
                                Note: If the product category is associated with the product, it cannot be deleted.
                                <Row>
                                  <Col lg={12} className="mt-5 d-flex flex-wrap align-items-center justify-content-between">
                                    <FormGroup>
                                    {this.state.isAssociatedWithProduct === false &&(
                                      <Button type="button" color="danger" className="btn-square" 	disabled1={this.state.disabled1}
                                        onClick={this.deleteProductCategory}>
                                        <i className="fa fa-trash"></i> {this.state.disabled1
																			? 'Deleting...'
																			: strings.Delete }
                                      </Button>)}
                                    </FormGroup>
                                    <FormGroup className="text-right">
                                      <Button type="submit" 
                                      name="submit" 
                                      color="primary"
                                       className="btn-square mr-3"	disabled={this.state.disabled}
                                       onClick={() => {
                                        //	added validation popup	msg
                                            props.handleBlur();
                                            if(props.errors &&  Object.keys(props.errors).length != 0)
                                            this.props.commonActions.fillManDatoryDetails();
                                    }}
                                       >
                                        <i className="fa fa-dot-circle-o"></i> 	{this.state.disabled
																			? 'Updating...'
																			: strings.Update }

                                      </Button>
                                      <Button
																	type="button"
																	color="secondary"
																	className="btn-square"
																	onClick={() => {
																		this.props.history.push(
																			'/admin/master/product-category',
																		);
																	}}
																>
																	<i className="fa fa-ban mr-1"></i>{strings.Cancel}
																</Button>
                                    </FormGroup>
                                  </Col>
                                </Row>
                              </Form>
                            )}
                          </Formik>
                        </Col>
                      </Row>
                    )}
                </CardBody>
              </Card>
            </Col>
          </Row>
					{loading ? <Loader></Loader> : ''}
        </div>
      </div>
      {this.state.disableLeavePage ?"":<LeavePage/>}
      </div>
    )
  }
}

export default connect(null, mapDispatchToProps)(DetailProductCategory)
