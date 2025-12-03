import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {

	Container,

	Row,
} from 'reactstrap';

import { AuthActions, CommonActions } from 'services/global';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './style.scss';
import config from 'constants/config';



const mapStateToProps = (state) => {
	return {
		version: state.common.version,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class LogIn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isPasswordShown: false,
			initValue: {
				username: '',
				password: '',
			},
			alert: null,
			openForgotPasswordModal: false,
			companyCount: 1,
			loading: false,
		};
	}

	componentDidMount = () => {
		this.getInitialData();
	};

	getInitialData = () => {
		this.props.authActions.getCompanyCount().then((response) => {
			//console.log(response.data);
			if (response.data < 1) {
				this.props.history.push('/register');
			}
			this.setState({ companyCount: response.data }, () => {});
		});
	};

	handleChange = (key, val) => {
		this.setState({
			[key]: val,
		});
	};

	// togglePasswordVisiblity = () => {
	// 	this.setState({
	// 		passwordShown: !this.state.passwordShown,
	// 	});
	// };

	togglePasswordVisiblity = () => {
		const { isPasswordShown } = this.state;
		this.setState({ isPasswordShown: !isPasswordShown });
	  };

	handleSubmit = (data, resetForm) => {
		this.setState({ loading: true });
		const { username, password } = data;
		let obj = {
			username,
			password,
		};
		this.props.authActions
			.logIn(obj)
			.then((res) => {
				toast.success('Log in Succesfully', {
					position: toast.POSITION.TOP_RIGHT,
				});

				this.props.history.push(config.DASHBOARD?config.BASE_ROUTE:config.SECONDARY_BASE_ROUTE);
				this.setState({ loading: false });
			})
			.catch((err) => {
				this.setState({ loading: false });
				toast.error(
					err && err.data
						? 'Log in failed. '
						: 'Something Went Wrong',
					{
						position: toast.POSITION.TOP_RIGHT,
					},
				);
			});
	};

	openForgotPasswordModal = () => {
		this.setState({ openForgotPasswordModal: true });
	};

	closeForgotPasswordModal = (res) => {
		this.setState({ openForgotPasswordModal: false });
	};

	render() {

		return (
			<div className="log-in-screen">
				<ToastContainer 	
				 position="top-right"
				 autoClose={1700}									
				closeOnClick
            	draggable/>
				<div className="animated fadeIn ">
				<div className="main-banner_container col-md-12 flex">
													{/* <img src={login_bg} alt="login_bg" className="login_bg" /> */}
													{/* <img src={login_banner} alt="login_banner" className="login_banner"/> */}
												</div>
					<div className="app flex-row align-items-center ">
						<Container style={{marginLeft:'700px',marginBottom:'500px'}}>
					<div>
							<Row style={{marginLeft:'130px'}}>
  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="70" viewBox="0 0 100 68">
    <g id="large">
      <path fill="#2064d8" stroke="#2064d8" d="M55.8 38.5l6.2-1.2c0-1.8-.1-3.5-.4-5.3l-6.3-.2c-.5-2-1.2-4-2.1-6l4.8-4c-.9-1.6-1.9-3-3-4.4l-5.6 3c-1.3-1.6-3-3-4.7-4.1l2-6A30 30 0 0 0 42 8l-3.3 5.4c-2-.7-4.2-1-6.2-1.2L31.3 6c-1.8 0-3.5.1-5.3.4l-.2 6.3c-2 .5-4 1.2-6 2.1l-4-4.8c-1.6.9-3 1.9-4.4 3l3 5.6c-1.6 1.3-3 3-4.1 4.7l-6-2A32.5 32.5 0 0 0 2 26l5.4 3.3c-.7 2-1 4.2-1.2 6.2L0 36.7c0 1.8.1 3.5.4 5.3l6.3.2c.5 2 1.2 4 2.1 6l-4.8 4c.9 1.6 1.9 3 3 4.4l5.6-3c1.4 1.6 3 3 4.7 4.1l-2 6A30.5 30.5 0 0 0 20 66l3.4-5.4c2 .7 4 1 6.1 1.2l1.2 6.2c1.8 0 3.5-.1 5.3-.4l.2-6.3c2-.5 4-1.2 6-2.1l4 4.8c1.6-.9 3-1.9 4.4-3l-3-5.6c1.6-1.3 3-3 4.1-4.7l6 2A32 32 0 0 0 60 48l-5.4-3.3c.7-2 1-4.2 1.2-6.2zm-13.5 4a12.5 12.5 0 1 1-22.6-11 12.5 12.5 0 0 1 22.6 11z"/>
      <animateTransform attributeName="transform" begin="0s" dur="3s" from="0 31 37" repeatCount="indefinite" to="360 31 37" type="rotate"/>
    </g>
    <g id="small">
      <path fill="#2064d8" stroke="#2064d8" d="M93 19.3l6-3c-.4-1.6-1-3.2-1.7-4.8L90.8 13c-.9-1.4-2-2.7-3.4-3.8l2.1-6.3A21.8 21.8 0 0 0 85 .7l-3.6 5.5c-1.7-.4-3.4-.5-5.1-.3l-3-5.9c-1.6.4-3.2 1-4.7 1.7L70 8c-1.5 1-2.8 2-3.9 3.5L60 9.4a20.6 20.6 0 0 0-2.2 4.6l5.5 3.6a15 15 0 0 0-.3 5.1l-5.9 3c.4 1.6 1 3.2 1.7 4.7L65 29c1 1.5 2.1 2.8 3.5 3.9l-2.1 6.3a21 21 0 0 0 4.5 2.2l3.6-5.6c1.7.4 3.5.5 5.2.3l2.9 5.9c1.6-.4 3.2-1 4.8-1.7L86 34c1.4-1 2.7-2.1 3.8-3.5l6.3 2.1a21.5 21.5 0 0 0 2.2-4.5l-5.6-3.6c.4-1.7.5-3.5.3-5.1zM84.5 24a7 7 0 1 1-12.8-6.2 7 7 0 0 1 12.8 6.2z"/>
      <animateTransform attributeName="transform" begin="0s" dur="2s" from="0 78 21" repeatCount="indefinite" to="-360 78 21" type="rotate"/>
    </g>
  </svg>
  </Row>
  <Row>
  <h1>Under Construction</h1></Row>
  <Row> <h2>Sorry for the inconvenience.</h2></Row>

  </div>
						</Container>
					</div>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(LogIn);
