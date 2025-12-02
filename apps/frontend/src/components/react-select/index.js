export const customStyles = {
	control: (base, state) => ({
		...base,
		background: '#023950',
		// Overwrittes the different states of border
		borderColor: state.isFocused ? 'yellow' : 'green',
		// Removes weird border around container
		boxShadow: state.isFocused ? null : null,
		'&:hover': {
			// Overwrittes the different states of border
			borderColor: state.isFocused ? 'red' : 'blue',
		},
	}),
};
