import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  selectCurInscChunks,
  selectCurInscIsProcessing,
  selectCurInscRequest,
  selectCurInscResponse
} from '_src/ui/app/redux/slices/curInscriptionRequestSlice';
import {  useQueries } from '@tanstack/react-query';
import Overlay from '_src/ui/app/components/overlay';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check32 } from '_src/ui/assets/icons/tsIcons';
import { useRpcClient } from '_src/xdag/api';
import { InscriptionReceiptCard } from './inscription-receipt-card';

const InscriptionReceiptPage = () => {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("requestId") ?? "";
  const toAddress = searchParams.get("toAddress");
  const fromParam = searchParams.get("from");

  const curChunk = useSelector(selectCurInscChunks);
  const curInscReq = useSelector(selectCurInscRequest);
  const curInscResponse = useSelector(selectCurInscResponse);
  const curInscIsProcessing = useSelector(selectCurInscIsProcessing);

  // const [transactionIds, setTransactionIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(true);
  const [isPushing, setIsPushing] = useState(true);
  const [isError, setIsError] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [resultDatas, setResultDatas] = useState<any[]>([]);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const rpc = useRpcClient();
  useEffect(() => {
    const curInscResponseTxIds = (curInscResponse as any)?.inscResponse;
    if (curInscResponseTxIds) {
      const queries = curInscResponseTxIds.map((blockAddress: string) => ({
        queryKey: ['batch-transaction-block-query', blockAddress],
        queryFn: () => rpc.getTransactionBlock({ digest: blockAddress }),
        enabled: !!blockAddress,
        retry: 3,
        refetchInterval: 3500,
      }));
      setAllQueries(queries);
      setIsPushing(false);
    }
  }, [curInscResponse]);

  const [allQueries, setAllQueries] = useState<any[]>([]);
  const queryResults = useQueries({ queries: allQueries });

  useEffect(() => {
    if (queryResults) {
      setIsError(queryResults.some(result => result.isError));
      setIsRefetching(queryResults.some(query => query.isRefetching));
      setResultDatas(queryResults.map(query => query.data));
    }
  }, [queryResults]);


  const closeReceipt = useCallback(() => {
    fromParam ? navigate(`/${fromParam}`) : navigate(-1);
  }, [fromParam, navigate]);

  return (
    <Overlay
      showModal={showModal}
      setShowModal={setShowModal}
      title={t("ReceiptPage.TransactionStatus")}
      closeOverlay={closeReceipt}
      closeIcon={<Check32 fill="currentColor" className="text-xdag-light w-8 h-8" />}
    >
      <InscriptionReceiptCard
        incriptionResults={queryResults}
        isRefetching={isRefetching}
        isPushing={isPushing}
      />
    </Overlay>
  );
};

export default InscriptionReceiptPage;
