import React from 'react';
import LocalizedStrings from 'react-localization';
import { connect } from 'react-redux';
import {
	Card,
	CardHeader,
	CardBody,
	Row,
	Col,	
} from 'reactstrap';
import { InvoiceTemplate } from 'components'
import Theme1 from 'assets/images/invoice-template/Theme1.png';
import Theme2 from 'assets/images/invoice-template/Theme2.png';
import * as TemplateActions from './actions';
// import { Templates } from './sections';
import { bindActionCreators } from 'redux';
// import 'react-select/dist/react-select.css'
import './style.scss';
import {data}  from '../Language/index'

const mapStateToProps = (state) => {
	return {};
};
const mapDispatchToProps = (dispatch) => {
	return {
		templateActions: bindActionCreators(TemplateActions, dispatch),
	};
};

let strings = new LocalizedStrings(data);
class Template extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			enable1:false,
			enable2:false,
			selectedData:[]
			// activeTab: new Array(2).fill('1'),
		};
	}

	componentDidMount=()=>{		
		this.props.templateActions
		.getTemplateList()
		.then((res) => {
			if (res.status === 200) {
				// this.props.userActions.getCompanyTypeList()
				for(let i=0;i<2;i++)
				{					
					switch(res.data[i].templateId) {
						case 1:
							this.setState({enable1:res.data[i].enable});
						  break;
						case 2:
							this.setState({enable2:res.data[i].enable});
						  break;
						default:
						  // code block
					  }
				}
				this.setState({
					selectedData:res.data,

				});
			}
		})
		.catch((err) => {	
		});		
	}
	
	render() {
		const {selectedData}=this.state;
		strings.setLanguage(this.state.language);
		return (
			<div className="financial-report-screen">
				<div className="animated fadeIn">
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>
									<div className="h4 mb-0 d-flex align-items-center">
										<i className="nav-icon fas fa-palette" />
										<span className="ml-2 " >{strings.MailThemes}</span>
									</div>
								</Col>
							</Row>
						</CardHeader>
					
						<CardBody>
							<InvoiceTemplate templateId="1" enable={this.state.enable1} templateTitle={strings.Theme1} templateImg={Theme1}></InvoiceTemplate>
							<InvoiceTemplate templateId="2" enable={this.state.enable2} templateTitle={strings.Theme2} templateImg={Theme2}></InvoiceTemplate>
						{/* <InvoiceTemplate templateId="3" templateTitle="Horizon" templateImg={horizon}></InvoiceTemplate>
							<InvoiceTemplate templateId="4" templateTitle="Elliot Jay stocks" templateImg={ejs}></InvoiceTemplate>
							<InvoiceTemplate templateId="5" templateTitle="Union" templateImg={union}></InvoiceTemplate>
							<InvoiceTemplate templateId="6" templateTitle="Lola" templateImg={lola}></InvoiceTemplate>
							<InvoiceTemplate templateId="7" templateTitle="Tranquility" templateImg={tranquility}></InvoiceTemplate>
							<InvoiceTemplate templateId="7" templateTitle="Modernist" templateImg={modernist}></InvoiceTemplate> */}						
						</CardBody>
					</Card>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Template);
