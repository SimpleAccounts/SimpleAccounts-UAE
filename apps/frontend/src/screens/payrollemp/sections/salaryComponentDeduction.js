import React from 'react';
import {
	Modal,
} from 'reactstrap';
import { SalaryComponentScreen } from '../../salary_component/sections';

class SalaryComponentDeduction extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.selectedData !== nextProps.selectedData  ) {
	
		 return { 
			selectedData :nextProps.selectedData,
			  };
        }
    }
	render() {
		const {
			openSalaryComponentDeduction,
			closeSalaryComponentDeduction,
		} = this.props;
		const { initValue } = this.state;
		return (
			<div className="contact-modal-screen">
				<Modal
					isOpen={openSalaryComponentDeduction}
					className="modal-success contact-modal"
				>
					<SalaryComponentScreen
						getCurrentSalaryComponent={(Data) => {
							this.props.getCurrentSalaryComponent(Data);
						}}
						closeModal={(e) => {
							closeSalaryComponentDeduction(false);
						}}
						isCreated={false}
						ComponentType={'Deduction'}
						salaryStructureModalCard={true}
					/>
				</Modal>
			</div>
		);
	}
}

export default SalaryComponentDeduction;
