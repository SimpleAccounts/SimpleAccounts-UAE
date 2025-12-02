import React from 'react';
import {
	Modal,
} from 'reactstrap';
import { SalaryComponentScreen } from '../../salary_component/sections';
import { toast } from 'react-toastify';
import { data } from '../../Language/index'
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);
class SalaryComponentFixed extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			showDetails: false,
			loading: false,
			initValue: {
				employeeId: '',
				salaryStructure: 1,
				type: '',
				flatAmount: '',
				email: '',
				dob: new Date(),
				description: '',
				formula: '',
				// data: [
				// 	{
				// 		salaryStructure: 1,
				// 		type: '',
				// 		flatAmount: '',
				// 	},
				// ],
			},
			selectDisable: true,
			addNewDisabled: false,
			state_list: [],
			selectedData: {},
		};
		this.formikRef = React.createRef();
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.selectedData !== nextProps.selectedData) {
			return {
				selectedData: nextProps.selectedData,
			};
		}
	}
	render() {
		strings.setLanguage(this.state.language);
		const {
			openSalaryComponentFixed,
			closeSalaryComponentFixed,
		} = this.props;
		const { initValue } = this.state;
		return (
			<div className="contact-modal-screen">
				<Modal
					isOpen={openSalaryComponentFixed}
					className="modal-success contact-modal"
				>
					<SalaryComponentScreen
						getCurrentSalaryComponent={(Data) => {
							this.props.getCurrentSalaryComponent(Data);
						}}
						closeModal={(e) => {
							closeSalaryComponentFixed(false);
						}}
						isCreated={false}
						ComponentType={'Earning'}
						salaryStructureModalCard={true}
					/>
				</Modal>
			</div>
		);
	}
}

export default SalaryComponentFixed;
