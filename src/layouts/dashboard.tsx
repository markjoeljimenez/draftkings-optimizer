import { connect } from 'react-redux';
import { ChangeEvent, useState } from 'react';

import Dropdown from '../containers/Dropdown/Dropdown';
import Nav from '../components/global/nav';
import SkipLink from '../components/global/skiplink';
import Providers from '../containers/Providers/Providers';
import Sports from '../containers/Sports/Sports';
import Upload from '../containers/Upload/Upload';

export interface ILayoutProps {
	children: React.ReactNode;
	fantasyData: any;
	sports: any;
}

const Dashboard = ({ children, fantasyData, sports }: ILayoutProps) => {
	console.log(fantasyData);

	const [provider, setProvider] = useState(0);

	const handleProviderChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setProvider(parseInt(e.currentTarget.value));
	};

	return (
		<div className="md:flex md:min-h-screen text-blue-800">
			<Nav />

			<main className="w-full">
				<div className="border-b border-gray-300">
					<div className="py-4 px-6 md:p-8 md:flex justify-between">
						<div className="space-x-4 flex mb-4 md:mb-0 justify-center">
							{/* <Sports /> */}
							<select
								name=""
								id=""
								defaultValue={provider}
								onChange={handleProviderChange}
							>
								{fantasyData.map(
									(
										{ SlateID, Operator, OperatorGameType },
										i
									) => (
										<option value={i} key={SlateID}>
											{Operator} - {OperatorGameType}
										</option>
									)
								)}
							</select>

							<select name="" id="">
								{fantasyData[provider].DfsSlateGames.map(games => (
									<option value=""></option>
								))}
							</select>
						</div>
						{/* <div className="items-center flex-1 md:ml-56">
						{providers && (
							<>
								{sports.sport && (
									<div className="md:space-x-4 md:flex justify-center">
										<div className="flex flex-1 justify-between">
											<Upload />
											<div className="flex items-center mx-4">
												or
											</div>
											<div className="flex-1">
												<Dropdown />
											</div>
										</div>
									</div>
								)}
							</>
						)}
					</div> */}
					</div>
				</div>

				{children}
			</main>
		</div>
	);
};

const mapStateToProps = ({ sports, fantasyData }) => ({
	sports,
	fantasyData,
});

export default connect(mapStateToProps)(Dashboard);
