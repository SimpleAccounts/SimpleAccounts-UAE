import React from 'react';

import { UncontrolledTooltip } from 'reactstrap';

import './style.scss';

class TooltipComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	// onToggleTooltip = () => {
	// 	const { isTooltipOpen } = this.props;
	// 	this.setState({ isTooltipOpen: !isTooltipOpen });
	// };

	render() {
		const { msg } = this.props;
		return (
			<div className="tooltip">
				<UncontrolledTooltip placement="top">{msg}</UncontrolledTooltip>
			</div>
		);
	}
}

export default TooltipComponent;
