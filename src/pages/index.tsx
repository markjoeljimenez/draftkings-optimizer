import React, { useState, useEffect } from 'react';
// import Downshift from 'downshift';
import uniqBy from 'lodash.uniqby';
import fetch from 'node-fetch';
import Fuse from 'fuse.js';

import { transformPlayers } from '../scripts/utilities/transformPlayers';
import sort from '../scripts/utilities/sort';
import { IContest, IGroup, IResponse, ILineup } from '../interfaces/IApp';
import {
	IDraftKingsResponse,
	IDraftKingsPlayer,
} from '../interfaces/IDraftKingsResponse';

import Layout from '../layouts/default';
import Panel from '../templates/panel';
import Table from '../components/table/table';
import Filter from '../components/filter/filter';

interface IContestResponse {
	contests: IContest[];
	groups: IGroup[];
}

export interface IFilterValue {
	category?: string;
	value?: string;
}

const API = process.env.ENDPOINT;
const options = {
	includeScore: true,
	threshold: 0.2,
};

const Index = ({ data }: { data: IResponse }) => {
	const [draftGroupId, setDraftGroupId] = useState<number | null>(null);

	// const [contests, setContests] = useState<IContest[]>();
	// const [isLoadingContests, setLoadingContests] = useState(true);

	// const [players, setPlayers] = useState<IDraftKingsPlayer[] | null>(null);
	// const [lockedPlayers, setLockedPlayers] = useState<number[]>([]);
	// const [excludedPlayers, setExcludedPlayers] = useState<number[]>([]);

	const [optimizedLineups, setOptimizedLineups] = useState<ILineup[] | null>(
		data.lineups
	);
	const [currentSort, setCurrentSort] = useState<string | null>();
	const [ascending, setAscending] = useState(false);

	// const [isError, setIsError] = useState(false);
	// const [errorMessage, setErrorMessage] = useState<string | null>('');

	// Filtering
	const [filters, setFilters] = useState<IFilterValue[]>([]);

	// Get players
	// useEffect(() => {
	// 	if (!draftGroupId) {
	// 		return;
	// 	}

	// 	(async () => {
	// 		try {
	// 			const response = await get(`${API}/players?id=${draftGroupId}`);
	// 			const data = (await response.json()) as IDraftKingsResponse;

	// 			if (data.players.length > 0) {
	// 				setPlayers(transformPlayers(data.players));
	// 			} else {
	// 				setErrorMessage('No players found');
	// 				setIsError(true);
	// 			}
	// 		} catch (e) {
	// 			console.error(
	// 				`A problem occured when trying to retrieve API: ${e}`
	// 			);
	// 		}
	// 	})();
	// }, [draftGroupId]);

	//
	const onContestChange = (draftSelection: IContest) => {
		if (!draftSelection) {
			return;
		}

		// Clear optimized lineups
		setOptimizedLineups(null);

		if (draftSelection) {
			setDraftGroupId(draftSelection.draft_group_id);
		}
	};

	// Request from API once contest is chosen
	// const optimizeLineups = async (
	// 	e: React.FormEvent<HTMLFormElement>,
	// 	OPTIMIZE = 'optimize'
	// ) => {
	// 	e.preventDefault();

	// 	// @TODO: Uncomment this when NBA season is back
	// 	// if (!draftGroupId) {
	// 	//     return;
	// 	// }

	// 	const URL = `${API}/${OPTIMIZE}`;

	// 	const BODY = {
	// 		locked: lockedPlayers.length > 0 ? lockedPlayers : null,
	// 		excluded: excludedPlayers.length > 0 ? excludedPlayers : null,
	// 	};

	// 	try {
	// 		const response = await post(URL, BODY);
	// 		const data = (await response.json()) as IResponse;

	// 		if (data.success) {
	// 			setOptimizedLineups(data);
	// 			setIsError(data.success);
	// 		} else {
	// 			setIsError(!data.success);
	// 			setErrorMessage(data.message);
	// 		}
	// 	} catch (e) {
	// 		console.error(
	// 			`A problem occured when trying to retrieve API: ${e}`
	// 		);
	// 	}
	// };

	const handleSort = (e: React.MouseEvent<HTMLButtonElement>) => {
		if (e.currentTarget instanceof HTMLButtonElement) {
			const value = e.currentTarget.getAttribute('data-sort');

			setAscending(!ascending);

			if (optimizedLineups) {
				setOptimizedLineups(
					sort(optimizedLineups, ascending, currentSort!, value!)
				);

				setCurrentSort(value);
			}
		}
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (optimizedLineups) {
			const fuse = new Fuse(data.lineups[0].players, {
				...options,
				keys: ['first_name', 'last_name', 'team'],
			});

			const result = fuse.search(e.currentTarget.value);

			let transformedSearch = [
				{
					...data.lineups[0],
					players: e.currentTarget.value
						? result.map((player) => player.item)
						: data.lineups[0].players,
				},
			];

			// If sort has been previously set, we should sort the transformedSearch automatically
			if (currentSort) {
				transformedSearch = sort(
					transformedSearch,
					!ascending,
					currentSort
				);
			}

			setOptimizedLineups(transformedSearch);
		}
	};

	/**
	 * Set filters
	 * @param position IFilterValue
	 * @param team IFilterValue
	 */
	const submitFilters = (position: IFilterValue, team: IFilterValue) => {
		setFilters(
			uniqBy(
				[...filters, position, team]
					.filter((item) => item.value !== '')
					.sort((a, b) => a.category!.localeCompare(b.category!)),
				'value'
			)
		);
	};

	// Filter players
	useEffect(() => {
		if (!filters.length) {
			return;
		}

		const players = filters
			.map((filter) => {
				const fuse = new Fuse(data.lineups[0].players, {
					...options,
					keys: [
						filter.category === 'position'
							? 'position.name'
							: 'team',
					],
				});

				return fuse.search(filter.value!).map((player) => player.item);
			})
			.reduce((a, b) => uniqBy([...a, ...b]));

		setOptimizedLineups([
			{
				...optimizedLineups![0],
				players,
			},
		]);
	}, [filters]);

	const handleRemoveFromFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
		const value = e.currentTarget.innerText;

		const transformedFilters = filters.map((filter) => filter.value);

		const players = data.lineups[0].players.filter(
			(player) =>
				!transformedFilters.includes(player.position.name) ||
				!transformedFilters.includes(player.team)
		);

		setFilters(filters.filter((item) => item.value !== value));
		setOptimizedLineups([
			{
				...optimizedLineups![0],
				players,
			},
		]);
	};

	return (
		<Layout>
			<Panel heading="Optimize">
				<div className="form">
					{/* <div className="form__row row">
                        <div className="form__col form__col--inline col">
                            <Downshift
                                onChange={selection =>
                                    onContestChange(selection)
                                }
                                itemToString={item => (item ? item.name : '')}
                            >
                                {({
                                    getToggleButtonProps,
                                    getMenuProps,
                                    getInputProps,
                                    getItemProps,
                                    inputValue,
                                    isOpen,
                                    clearSelection,
                                    selectedItem,
                                    highlightedIndex,
                                }) => (
                                    <div
                                        className={`input-dropdown ${
                                            isLoadingContests
                                                ? 'input-dropdown--disabled'
                                                : ''
                                        }`}
                                    >
                                        <label
                                            className="form__label u-hidden"
                                            htmlFor="select-contest"
                                        >
                                            Search contest by ID or name
                                        </label>
                                        <input
                                            className="input-dropdown__input"
                                            {...getInputProps({
                                                placeholder: isLoadingContests
                                                    ? 'Grabbing contests...'
                                                    : 'Search contest by ID or name',
                                                disabled: isLoadingContests,
                                            })}
                                        />
                                        {inputValue ? (
                                            <button
                                                className="input-dropdown__button"
                                                onClick={() => {
                                                    clearSelection();
                                                    setDraftGroupId(null);
                                                    setIsError(false);
                                                    setErrorMessage('');
                                                }}
                                                aria-label="clear selection"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    width="24"
                                                    height="24"
                                                >
                                                    <g data-name="Layer 2">
                                                        <g data-name="close">
                                                            <rect
                                                                width="24"
                                                                height="24"
                                                                transform="rotate(180 12 12)"
                                                                opacity="0"
                                                            />
                                                            <path d="M13.41 12l4.3-4.29a1 1 0 1 0-1.42-1.42L12 10.59l-4.29-4.3a1 1 0 0 0-1.42 1.42l4.3 4.29-4.3 4.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l4.29-4.3 4.29 4.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42z" />
                                                        </g>
                                                    </g>
                                                </svg>
                                                Clear selection
                                            </button>
                                        ) : (
                                            <button
                                                className="input-dropdown__button"
                                                {...getToggleButtonProps({
                                                    disabled: isLoadingContests,
                                                })}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    width="24"
                                                    height="24"
                                                >
                                                    <g data-name="Layer 2">
                                                        <g data-name="chevron-down">
                                                            <rect
                                                                width="24"
                                                                height="24"
                                                                opacity="0"
                                                            />
                                                            <path d="M12 15.5a1 1 0 0 1-.71-.29l-4-4a1 1 0 1 1 1.42-1.42L12 13.1l3.3-3.18a1 1 0 1 1 1.38 1.44l-4 3.86a1 1 0 0 1-.68.28z" />
                                                        </g>
                                                    </g>
                                                </svg>
                                                Down
                                            </button>
                                        )}
                                        {isOpen ? (
                                            <ul
                                                className="input-dropdown__list"
                                                {...getMenuProps()}
                                            >
                                                {contests
                                                    .filter(
                                                        contest =>
                                                            !inputValue ||
                                                            contest.name
                                                                .toLowerCase()
                                                                .includes(
                                                                    inputValue.toLowerCase()
                                                                )
                                                    )
                                                    .map((item, index) => (
                                                        <li
                                                            className="input-dropdown__item"
                                                            {...getItemProps({
                                                                key: index,
                                                                index,
                                                                item,
                                                            })}
                                                        >
                                                            {
                                                                item.draft_group_id
                                                            }{' '}
                                                            - {item.name}
                                                        </li>
                                                    ))}
                                            </ul>
                                        ) : null}
                                    </div>
                                )}
                            </Downshift>
                        </div>
                    </div>
                    {isError && errorMessage ? (
                        <div className="form__row row">
                            <div className="form__col col">
                                <p role="alert">{errorMessage}</p>
                            </div>
                        </div>
                    ) : (
                        <></>
                    )} */}
					{/* {players ? ( */}
					<div className="form__row row">
						<div className="form__col col">
							<div className="form__bar">
								<div>
									<button
										className="form__button button button--sm-bord-rad"
										type="submit"
									>
										Bulk Actions
									</button>
									<Filter
										filters={filters}
										submitFilters={submitFilters}
										handleRemoveFromFilter={
											handleRemoveFromFilter
										}
									/>
								</div>
								{/* <button
                                    className="form__optimize button button--light"
                                    type="submit"
                                >
                                    Optimize
                                </button> */}
								<div className="input input--icon-left search">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										className="input__icon"
									>
										<g data-name="Layer 2">
											<g data-name="search">
												<rect
													width="24"
													height="24"
													opacity="0"
												/>
												<path d="M20.71 19.29l-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8 7.92 7.92 0 0 0 4.9-1.69l3.39 3.4a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42zM5 11a6 6 0 1 1 6 6 6 6 0 0 1-6-6z" />
											</g>
										</g>
									</svg>
									<input
										type="search"
										placeholder="Search"
										onChange={handleSearch}
									/>
								</div>
							</div>
						</div>
					</div>
					{/* ) : (
                        <></>
                    )} */}
				</div>

				{optimizedLineups ? (
					<Table
						// players={players}
						optimizedLineups={optimizedLineups}
						handleSort={handleSort}
						currentSort={currentSort}
						ascending={ascending}
						// setPlayers={setPlayers}
					/>
				) : (
					<></>
				)}
			</Panel>
		</Layout>
	);
};

export async function getStaticProps() {
	if (!API) {
		return null;
	}

	const response = await fetch(API);
	const data = (await response.json()) as IResponse;

	return {
		props: {
			data,
		},
	};
}

export default Index;
