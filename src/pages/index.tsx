import { connect } from 'react-redux';

import { initializeStore } from '../store';

import Bar from '../containers/Bar/Bar';
import Tabs from '../containers/Tabs/Tabs';
import Dropdown from '../containers/Dropdown/Dropdown';
import GameListing from '../components/gameListing';
import Rules from '../containers/Rules/Rules';
import Table from '../containers/Table/Table';

import { SET_SPORTS } from '../containers/Sports/Sports.actions';
import { ISports } from '../interfaces/ISports';
import Loading from '../components/loading';
import { SET_FANTASY_DATA } from '../containers/FantasyData/fantasyData.actions';

const API = process.env.ENDPOINT;

const App = ({ activeTab, providers, sport, loading, players }: any) => (
	<Loading loading={loading.isLoading} message={loading.message}>
		{/* <div className="border-b border-gray-300 bg-gray-100">
				<div className="container mx-auto p-8">
					<h2 className="text-xs uppercase font-black">
						Today&apos;s games
					</h2>
					<GameListing />
				</div>
			</div> */}
		{/* {sport ? (
			<div className="border-b border-gray-300">
				<div className="container mx-auto p-8">
					<Dropdown />
					<Bar />
				</div>
			</div>
		) : (
			<div className="container mx-auto p-8">
				<p>First select a sport</p>
			</div>
		)} */}
		{providers && sport && players?.length ? (
			<>
				<div>
					<div className="container mx-auto p-8">
						<Bar />
					</div>
				</div>
				<div className="border-b border-gray-300">
					<div className="container mx-auto px-8">
						<Tabs />
					</div>
				</div>
			</>
		) : (
			<></>
		)}
		<div
			className="mb-8"
			role="tabpanel"
			aria-labelledby="panel-players"
			hidden={activeTab !== 'players'}
		>
			<Table />
		</div>
		<div
			className="mb-8"
			role="tabpanel"
			aria-labelledby="panel-settings"
			hidden={activeTab !== 'settings'}
		>
			<Rules />
		</div>
	</Loading>
);

export const getServerSideProps = async () => {
	if (!API) {
		return null;
	}

	const reduxStore = initializeStore();
	const { dispatch } = reduxStore;

	const response = await fetch(API);
	const data = await response.json();

	dispatch({
		type: SET_FANTASY_DATA,
		data,
	});

	// const sports: ISports[] = await response.json();

	// dispatch({
	// 	type: SET_SPORTS,
	// 	sports,
	// });

	// dispatch({
	// 	type: FETCH_CONTESTS,
	// 	sport: sports[0].sportId,
	// });

	return { props: { initialReduxState: reduxStore.getState() } };
};

const mapStateToProps = ({ tabs, sports, dropdown, providers, table }) => ({
	activeTab: tabs.activeTab,
	players: table.players,
	providers,
	sport: sports.sport,
	loading: {
		isLoading: dropdown.loading,
		message: dropdown.message,
	},
});

export default connect(mapStateToProps)(App);
