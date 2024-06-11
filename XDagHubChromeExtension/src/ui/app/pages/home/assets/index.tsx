import { useActiveAddress } from '_app/hooks/useActiveAddress';
import Alert from '_components/alert';
import FiltersPortal from '_components/filters-tags';
import Loading from '_components/loading';
import LoadingSpinner from '_components/loading/LoadingIndicator';
import { setToSessionStorage } from '_src/background/storage-utils';
import PageTitle from '_src/ui/app/shared/PageTitle';
import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ResultInscription, useQueryAsset } from '_src/ui/app/hooks/useGetAssets';
import { Text } from '_src/ui/app/shared/text';

const AssetPage = () => {
	const accountAddress = useActiveAddress();
	const observerElem = useRef<HTMLDivElement | null>(null);
	const {
		transactions,
		isFetching,
		isDataFetched,
		refetch,
		nestedRemarkMap,
		level1KeysCount,
		level2KeysCount,
		resultInscription,
		isFetchingNextPage,
	} = useQueryAsset(accountAddress);


	const { filterType } = useParams();

	console.log("inscContents---", resultInscription);

	// if (!isFetchingNextPage) {
	// 	return (
	// 		<div className='flex flex-col'>
	// 			<div className=' justify-center items-center'>
	// 				<Text color="hero-dark" variant="caption">
	// 					MY ASSETS
	// 				</Text>
	// 			</div>
	// 			<div className="mt-1 flex w-full justify-center">
	// 				<LoadingSpinner />
	// 			</div>
	// 			<div>
	// 				<Text color="hero-dark" variant="bodySmall">
	// 					{level1KeysCount} ---- {level2KeysCount}
	// 				</Text>
	// 			</div>
	// 		</div>
	// 	);
	// }

	if (!resultInscription) {
		return (
			<>
				hasn't any assets
			</>
		)
	}

	return (
		<div>
			<div className='flex flex-col w-full items-center justify-center'>
				<div className='flex w-full justify-center items-center'>
					<Text color="hero-dark" variant="caption" weight="bold" >
						MY ASSETS
					</Text>
				</div>
				<div className="mt-1 flex w-full justify-center">
					<LoadingSpinner />
				</div>
				{/* <div>
					<Text color="hero-dark" variant="bodySmall">
						{level1KeysCount} ---- {level2KeysCount}
					</Text>
				</div> */}
			</div>

			<div className="flex flex-col flex-nowrap">
				{Object.keys(resultInscription).map(key => {
					const content: ResultInscription | null = resultInscription[key];
					if (content && content.inscContent) {
						return (
							<div key={key} className="flex flex-row flex-nowrap items-center gap-3.75 py-3 justify-center w-full">
								<div className="flex items-stretch h-15 w-15 overflow-hidden bg-steel/20 shrink-0 grow-0">
									{content.inscContent.imgStr ? (
										<img className="flex-1" src={content.inscContent.imgStr} alt="img" />
									) : (
										<div className="flex-1 bg-gray-300">No Image</div>
									)}
								</div>
								<div className="flex flex-col items-center justify-center w-full">

									<div className=' w-full flex flex-row items-start justify-start'>
										{content.inscContent.txt ? (
											<Text color="xdag-dark" variant="bodySmall">
												{content.inscContent.txt}
											</Text>
										) : (
											<Text color="xdag-dark" variant="bodySmall">
												No Text
											</Text>
										)}
									</div>
									{/* <Text color="xdag-dark" variant="bodySmall">
										IN:{content.targetAddress}
									</Text> */}
									<div className=' w-full flex flex-row items-start justify-start'>
										<Text color="xdag-dark" variant="bodySmall">
											AWARD:{content.awardCost?.toFixed(1)}
										</Text>
									</div>

								</div>
							</div>
						);
					}
					return null;
				})}
			</div>

		</div>
	);

}


export default AssetPage;
