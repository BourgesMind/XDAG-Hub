import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import Loading from "../../components/loading";
import { useAppSelector } from "../../hooks";
import { type RootState } from "../../redux/RootReducer";
import { inscRequestsSelectors } from "../../redux/slices/inscription-requests";
import { InscriptionRequest } from "./inscription-request";

export function ApprovalInscriptionRequestPage() {
	const { requestID } = useParams();
	const requestSelector = useMemo(() => {
		return (state: RootState) => {
			return (requestID && inscRequestsSelectors.selectById(state, requestID)) || null;
		}
	}, [requestID]);

	const request = useAppSelector(requestSelector);
	const requestsLoading = useAppSelector(({ inscriptionRequests }) => !inscriptionRequests.initialized,);
	const allReq = useAppSelector(inscRequestsSelectors.selectAll);
	useEffect(() => {
		if (!requestsLoading && (!request || (request && request.approved !== null))) {
			console.log('window will close!!!!!!!!!!!!')
			// window.close();
		}
	}, [requestsLoading, request]);


	return (
		<Loading loading={requestsLoading}>
			{
				request &&
				<InscriptionRequest inscRequest={request} />
			}
		</Loading>
	);
}
