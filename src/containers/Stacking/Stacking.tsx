import clsx from 'clsx';
import { createRef, MouseEvent, useRef } from 'react';
import { connect } from 'react-redux';

import NumberOfPlayersToStack from './Stacking.team.players';
import FromTeams from './Stacking.team.teams';
import FromPositions from './Stacking.team.positions';
import Spacing from './Stacking.team.spacing';
import MaxExposure from './Stacking.team.maxExposure';
import MaxExposurePerTeam from './Stacking.team.maxExposurePerTeam';

import Positions from './Stacking.position.positions';
import OptionalPositions from './Stacking.position.optionalPositions';

import { resetSettings, setActiveTab, STACKING_TYPE } from './Stacking.actions';

export const TABS = [
	{
		id: STACKING_TYPE.TEAM,
		name: 'Team Stacking',
		children: (
			<>
				<div>
					<NumberOfPlayersToStack />
				</div>
				<div className="mt-8">
					<FromTeams />
				</div>
				<div className="mt-8">
					<FromPositions />
				</div>
				<div className="mt-8">
					<Spacing />
				</div>
				<div className="mt-8">
					<MaxExposure />
				</div>
				<div className="mt-8">
					<MaxExposurePerTeam />
				</div>
			</>
		),
	},
	{
		id: STACKING_TYPE.POSITION,
		name: 'Position Stacking',
		children: (
			<>
				<div>
					<Positions />
				</div>
				<div className="mt-8">
					<OptionalPositions />
				</div>
			</>
		),
	},
];

interface IStackingContainerProps {
	activeTab: string;
	resetSettingsAction(): void;
	setActiveTabAction(activeTab: string): void;
}

const StackingContainer = ({
	activeTab,
	resetSettingsAction,
	setActiveTabAction,
}: IStackingContainerProps) => {
	const forms = useRef<(HTMLFormElement | null)[]>([]);

	function handleTabClick(e: MouseEvent<HTMLButtonElement>) {
		const { value } = e.currentTarget;

		setActiveTabAction(value);
	}

	function handleResetSettings(e: MouseEvent<HTMLButtonElement>) {
		forms.current.forEach((form) => {
			if (form) {
				form.reset();
			}
		});

		resetSettingsAction();
	}

	return (
		<div className="container mx-auto px-8 my-8">
			<div className="flex justify-between">
				<nav>
					<ul className="flex" role="tablist">
						{TABS.map(({ id, name }) => (
							<li
								role="tab"
								aria-selected={activeTab === id}
								aria-controls={`panel-${name}`}
								key={id}
							>
								<button
									className={clsx(
										'py-2 px-4 font-black text-blue-600',
										activeTab === id
											? 'border-b-2 border-blue-900 text-blue-900'
											: ''
									)}
									type="button"
									onClick={handleTabClick}
									value={id}
								>
									{name}
								</button>
							</li>
						))}
					</ul>
				</nav>
				<button
					className="py-2 px-5 bg-blue-200 rounded text-blue-900 font-black hover:bg-blue-800 hover:text-white"
					type="button"
					onClick={handleResetSettings}
				>
					Reset Settings
				</button>
			</div>

			{TABS.map(({ id, children }, i) => (
				<div
					className="my-8"
					role="tabpanel"
					aria-labelledby={`panel-${id}`}
					hidden={activeTab !== id}
					key={id}
				>
					<form ref={(ref) => forms.current.push(ref)}>
						{children}
					</form>
				</div>
			))}
		</div>
	);
};

const mapStateToProps = ({ stacking }) => ({
	activeTab: stacking.activeTab,
});

const mapDispatchToProps = (dispatch) => ({
	resetSettingsAction: () => dispatch(resetSettings()),
	setActiveTabAction: (activeTab) => dispatch(setActiveTab(activeTab)),
});

export default connect(mapStateToProps, mapDispatchToProps, null, {
	forwardRef: true,
})(StackingContainer);
