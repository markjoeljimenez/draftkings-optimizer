import Fuse from 'fuse.js';
import uniq from 'lodash.uniqby';
import { AnyAction } from 'redux';

import {
	CLEAR_TOGGLE,
	EXCLUDE_PLAYERS,
	GET_PLAYERS_FAILED,
	GET_PLAYERS_SUCCEEDED,
	LOADING_PLAYERS,
	LOCK_PLAYERS,
	NEXT,
	PREVIOUS,
	SET_PLAYER_EXPOSURE,
	SET_PLAYER_PROJECTED_OWNERSHIP,
	VIEW_ALL_PLAYERS,
	VIEW_OPTIMIZED_LINEUPS,
} from './Table.actions';
import {
	OPTIMIZE_PLAYERS_FAILED,
	OPTIMIZE_PLAYERS_SUCCEEDED,
} from '../Optimize/Optimize.actions';
import { IDraftKingsPlayer } from '../../interfaces/IDraftKingsResponse';
import { SEARCH_PLAYERS } from '../Search/Search.actions';
import { RESET_PLAYERS } from '../Dropdown/Dropdown.actions';

interface ILineup {
	players: string[];
	totalFppg: number;
	totalSalary: number;
}

interface ITableState {
	page: number;
	view: 'all' | 'optimized';
	defaultPlayers?: IDraftKingsPlayer[];
	draftGroupId?: string;
	excludedPlayers?: IDraftKingsPlayer[];
	gameType?: string;
	lineups?: ILineup[];
	loading?: boolean;
	lockedPlayers?: IDraftKingsPlayer[];
	optimizedPlayers?: IDraftKingsPlayer[];
	payload?: any;
	playerId?: string;
	players?: IDraftKingsPlayer[];
	searchTerm?: string;
	teams?: string[];
	totalFppg?: number;
	totalSalary?: number;
	value?: string;
}

const DEFAULT_STATE: ITableState = {
	page: 0,
	view: 'all',
};

const TableReducer = (
	state = DEFAULT_STATE,
	{
		type,
		players,
		draftGroupId,
		lineups,
		searchTerm,
		payload,
		playerId,
		value,
		// teamIds,
		gameType,
		view,
	}: AnyAction
) => {
	switch (type) {
		case LOADING_PLAYERS:
			return {
				...state,
				loading: true,
			};

		case GET_PLAYERS_SUCCEEDED: {
			const teams =
				players && uniq(players, 'team').map(({ team }) => team);
			const positions =
				players &&
				uniq(
					uniq(players, 'position')
						.map(({ position }) => position)
						.map((pos: string) => pos.split('/'))
						.flat()
				);

			return {
				...state,
				defaultPlayers: players,
				players,
				draftGroupId,
				loading: false,
				error: undefined,
				teams,
				positions,
				gameType,
			};
		}

		case GET_PLAYERS_FAILED:
			return state;

		// case OPTIMIZE_PLAYERS_SUCCEEDED: {
		// 	const transformedLineups = lineups?.map((lineup) => ({
		// 		...lineup,
		// 		players: lineup.players.map((player) =>
		// 			state.defaultPlayers?.find(
		// 				(_player) => _player.id === parseInt(player)
		// 			)
		// 		),
		// 	}));

		// 	const lineup = transformedLineups?.[0];

		// 	return {
		// 		...state,
		// 		page: 0,
		// 		defaultLineups: lineups,
		// 		optimizedPlayers: lineup?.players,
		// 		players: lineup?.players,
		// 		totalFppg: lineup?.totalFppg,
		// 		totalSalary: lineup?.totalSalary,
		// 		lineups: transformedLineups,
		// 		view: 'optimized',
		// 		loading: false,
		// 	};
		// }

		// case OPTIMIZE_PLAYERS_FAILED:
		// 	return {
		// 		...state,
		// 		loading: false,
		// 	};

		// case PREVIOUS: {
		// 	const index = state.page - 1 <= 0 ? 0 : state.page - 1;

		// 	if (!state.lineups) {
		// 		return state;
		// 	}

		// 	const lineup = state.lineups[index];

		// 	return {
		// 		...state,
		// 		page: index,
		// 		optimizedPlayers: lineup.players,
		// 		players: lineup.players,
		// 		totalFppg: lineup.totalFppg,
		// 		totalSalary: lineup.totalSalary,
		// 	};
		// }

		// case NEXT: {
		// 	const index =
		// 		state.lineups && state.page + 1 >= state.lineups?.length
		// 			? state.page
		// 			: state.page + 1;

		// 	if (!state.lineups) {
		// 		return state;
		// 	}

		// 	const lineup = state.lineups[index];

		// 	return {
		// 		...state,
		// 		page: index,
		// 		optimizedPlayers: lineup.players,
		// 		players: lineup.players,
		// 		totalFppg: lineup.totalFppg,
		// 		totalSalary: lineup.totalSalary,
		// 	};
		// }

		// case SEARCH_PLAYERS: {
		// 	if (!searchTerm) {
		// 		return {
		// 			...state,
		// 			players: state.optimizedPlayers?.length
		// 				? state.optimizedPlayers
		// 				: state.defaultPlayers,
		// 		};
		// 	}

		// 	if (!state.players || !state.defaultPlayers) {
		// 		return state;
		// 	}

		// 	const fuse = new Fuse(
		// 		state.optimizedPlayers?.length
		// 			? state.optimizedPlayers
		// 			: state.defaultPlayers,
		// 		{
		// 			includeScore: true,
		// 			threshold: 0.2,
		// 			keys: ['first_name', 'last_name', 'team'],
		// 		}
		// 	);

		// 	const result = fuse.search(searchTerm);

		// 	return {
		// 		...state,
		// 		players: result.map((player) => player.item),
		// 	};
		// }

		case LOCK_PLAYERS: {
			const player = state.players?.find(
				(_player) => _player.id === parseInt(payload.value)
			);

			// Remove player from excludedPlayers
			const excludedPlayers = state.excludedPlayers?.filter(
				(_player) => _player.id !== parseInt(payload.value)
			);

			if (!state.lockedPlayers) {
				return {
					...state,
					excludedPlayers: excludedPlayers?.length
						? excludedPlayers
						: undefined,
					lockedPlayers: [player],
				};
			}

			return {
				...state,
				excludedPlayers: excludedPlayers?.length
					? excludedPlayers
					: undefined,
				lockedPlayers: payload.checked
					? uniq([...state.lockedPlayers, player])
					: state.lockedPlayers.filter(
							(_player) => _player.id !== parseInt(payload.value)
					  ),
			};
		}

		case EXCLUDE_PLAYERS: {
			const player = state.players?.find(
				(_player) => _player.id === parseInt(payload.value)
			);

			// Remove player from lockedPlayers
			const lockedPlayers = state.lockedPlayers?.filter(
				(_player) => _player.id !== parseInt(payload.value)
			);

			if (!state.excludedPlayers) {
				return {
					...state,
					lockedPlayers: lockedPlayers?.length
						? lockedPlayers
						: undefined,
					excludedPlayers: [player],
				};
			}

			return {
				...state,
				lockedPlayers: lockedPlayers?.length
					? lockedPlayers
					: undefined,
				excludedPlayers: payload.checked
					? uniq([...state.excludedPlayers, player])
					: state.excludedPlayers.filter(
							(_player) => _player.id !== parseInt(payload.value)
					  ),
			};
		}

		case CLEAR_TOGGLE: {
			// Remove player from lockedPlayers
			const lockedPlayers = state.lockedPlayers?.filter(
				(_player) => _player.id !== parseInt(payload.value)
			);

			// Remove player from excludedPlayers
			const excludedPlayers = state.excludedPlayers?.filter(
				(_player) => _player.id !== parseInt(payload.value)
			);

			return {
				...state,
				lockedPlayers,
				excludedPlayers,
			};
		}

		// case SET_PLAYER_EXPOSURE: {
		// 	if (!playerId || !state.defaultPlayers) {
		// 		return state;
		// 	}

		// 	const player = state.defaultPlayers?.find(
		// 		(_player) => _player.id === parseInt(playerId)
		// 	);

		// 	if (player) {
		// 		player.min_exposure = value ? parseFloat(value) : undefined;

		// 		return {
		// 			...state,
		// 			defaultPlayers: uniq([...state.defaultPlayers, player]),
		// 		};
		// 	}

		// 	return state;
		// }

		// case SET_PLAYER_PROJECTED_OWNERSHIP: {
		// 	if (!playerId || !state.defaultPlayers) {
		// 		return state;
		// 	}

		// 	const player = state.defaultPlayers?.find(
		// 		(_player) => _player.id === parseInt(playerId)
		// 	);

		// 	if (player) {
		// 		player.projected_ownership = value
		// 			? parseFloat(value)
		// 			: undefined;

		// 		return {
		// 			...state,
		// 			defaultPlayers: uniq([...state.defaultPlayers, player]),
		// 		};
		// 	}

		// 	return state;
		// }

		// case VIEW_ALL_PLAYERS:
		// 	return {
		// 		...state,
		// 		players: state.defaultPlayers,
		// 		view: 'all',
		// 	};

		// case VIEW_OPTIMIZED_LINEUPS:
		// 	return {
		// 		...state,
		// 		players: state.optimizedPlayers,
		// 		view: 'optimized',
		// 	};

		// case RESET_PLAYERS:
		// 	return {
		// 		...state,
		// 		contests: undefined,
		// 		defaultPlayers: undefined,
		// 		draftGroupId: undefined,
		// 		lineups: undefined,
		// 		lockedPlayers: undefined,
		// 		excludedPlayers: undefined,
		// 		optimizedPlayers: undefined,
		// 		page: 0,
		// 		players: undefined,
		// 		teams: undefined,
		// 		totalFppg: undefined,
		// 		totalSalary: undefined,
		// 	};

		default:
			return state;
	}
};

export default TableReducer;
