import { USERS_ROLES } from 'constants/types';

const initState = {
	user_role_list: [],
};

const RoleReducer = (state = initState, action) => {
	const { type, payload } = action;
	switch (type) {
		case USERS_ROLES.USER_ROLE_LIST:
			return {
				...state,
				user_role_list: Object.assign([], payload),
			};

		default:
			return state;
	}
};

export default RoleReducer;
