import { SET_FANTASY_DATA } from './fantasyData.actions';

const ProviderReducers = (state = [], { type, data }) => {
	switch (type) {
		case SET_FANTASY_DATA:
			return data;

		default:
			return state;
	}
};

export default ProviderReducers;
