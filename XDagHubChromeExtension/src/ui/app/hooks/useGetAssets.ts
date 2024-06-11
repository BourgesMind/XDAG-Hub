import { useQuery, useQueryClient } from "@tanstack/react-query";
import { XDagAddress, XDagAddressBlockResponse, XDagTransactionBlockResponse } from "_src/xdag/typescript/types";
import { useRpcClient } from "_src/xdag/api";
import { useState, useEffect } from "react";
import { blake2b } from "@noble/hashes/blake2b";
import BitCounter from "_src/shared/utils/BitCounter";
import { base64DecodeJson } from "_src/background/utils";
import { InscriptionContent } from "_src/shared/messaging/messages/payloads/inscription";
import { timeStamp } from "console";
import { JsonRpcProvider } from "_src/xdag/typescript/rpc";


type XDagBlockInsc = {
    remark: string,
    time: number,
    txAddress: string | undefined,
    amount: string | undefined,
    direction: number
}

type RestoredInsc = {
    inscContent: InscriptionContent,
    toAddress: string,
    awardCost: number,
    inscTime: number
}

export type ResultInscription = {
    inscContent: InscriptionContent | null | undefined,
    targetAddress: string | null | undefined,
    awardCost: number | null | undefined,
}

async function fetchTransactionOutAddress(txAddress: string, rpc: JsonRpcProvider): Promise<string | undefined> {
    let addressValue: string | undefined = undefined;
    if (txAddress && rpc) {
        const txDetail = await rpc.getTransactionBlock({ digest: txAddress, pageNumber: 1 });
        if (txDetail?.refs) {
            for (const ref of txDetail.refs) {
                if (ref.direction === 1) {
                    addressValue = ref.address;
                    break;
                }
            }
        }
    }
    return addressValue;
}

type UnfinishedResult = {
    bigTxt: string;
    targetAddress: string;
    awardCost: number;
}

async function validateAndRestoreChunks(imgIndex: string, blocks: XDagBlockInsc[], rpc: JsonRpcProvider): Promise<UnfinishedResult | null> {
    // console.log("......》》》》》all Chunks:", blocks)

    const lastChunk = blocks[blocks.length - 1];
    // 检查 lastChunk 是否包含 '#$#' 字符，并且包含 3 个 '#' 号，并且第 2 个和第 3 个 '#' 之间是纯数字
    const isValidLastChunk = lastChunk.remark.includes('~~#$#') && (lastChunk.remark.match(/#/g) || []).length === 3;
    if (!isValidLastChunk) {
        return null;
    }

    const [lastImgIndex, $, chunkCountStr, last6Chars] = lastChunk.remark.split("#");
    // console.log("......find lastChunk!!!!!!\n:", lastChunk, '\n', [lastImgIndex, $, chunkCountStr, last6Chars])
    if (!(/^\d+$/.test(chunkCountStr))) {
        console.log(" test failes not a number:", chunkCountStr)
        return null;
    }
    if (!lastImgIndex || lastImgIndex.length < 2 || lastImgIndex.slice(0, 2) !== imgIndex) {
        console.log("invalid imageIndex in last Chunk:", lastChunk, "|", lastImgIndex, "|", lastImgIndex.slice(0, 2))
        return null;
    }
    const lastChunkIndex = lastImgIndex.slice(0, 2);
    const chunkCount = parseInt(chunkCountStr, 10);
    if (imgIndex !== lastChunkIndex || chunkCount !== (blocks.length - 1)) {
        console.log("test tag failed: ", imgIndex, ':', lastChunkIndex, ':', chunkCount, ':', (blocks.length - 1));
        return null;
    }
    blocks.pop();

    // const actualAddresses = await Promise.all(blocks.map(block => fetchTransactionOutAddress(block.txAddress || "", rpc)));
    // const addressSet = new Set(actualAddresses);
    // if (addressSet.size > 1) {
    //     console.log("Chunks belong to different transaction addresses");
    //     return null;
    // }
    // const firstAddress = actualAddresses[0];
    // console.log("@#$@$@#$@$:", actualAddresses);

    let awardCost = 0;
    blocks.forEach(item => {
        awardCost += parseFloat(item?.amount ?? "0");
    })

    let restoredText = "";
    const bitCounter = new BitCounter();
    for (const b of blocks) {
        const idxString = bitCounter.getCurrentCharacter();
        // console.log("####chunk:", chunk, idxString);
        if (!b.remark.startsWith(imgIndex + idxString)) {
            console.log("invalid chunk check:", b, ":", imgIndex + idxString);
            return null;
        }
        const base64Part = b.remark.slice(imgIndex.length + idxString.length);
        restoredText += base64Part;
        bitCounter.getNextCharacter();
    }

    const calculatedHash = blake2b(restoredText, { dkLen: 32 });
    const calculatedHashString = Buffer.from(calculatedHash).toString('hex');
    const calculatedLast6Chars = calculatedHashString.slice(-6);

    if (calculatedLast6Chars !== last6Chars) {
        console.log("invalid hash CHECK!!!", last6Chars, "--->", calculatedLast6Chars)
        return null;
    }

    const r = {
        bigTxt: restoredText,
        targetAddress: "",
        awardCost: awardCost
    };
    // console.log("RRRRRRRRRRRRR:", r);
    return r;
}

export const useQueryAsset = (myAddress: XDagAddress | null) => {
    const rpc = useRpcClient();
    const queryClient = useQueryClient();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [isLastPage, setIsLastPage] = useState(false);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
    const [isDataFetched, setIsDataFetched] = useState(false);

    const fetchPage = async (page: number) => {
        if (myAddress) {
            // console.log("fetch apge:", page, '--', myAddress);
            return await rpc.queryAddressBlock({ XDagAddress: myAddress, pageNumber: page });
        }
        return null;
    };

    const { data, isFetching, refetch } = useQuery({
        queryKey: ["transactions-by-address", myAddress, pageNumber],
        queryFn: () => fetchPage(pageNumber),
        enabled: !!myAddress && !isLastPage && !isFetchingNextPage,
        refetchInterval: false,  // Disable automatic refetching
    });

    useEffect(() => {
        const handleData = async () => {
            if (data) {
                const { transactions: newTransactions, totalPage } = data;
                if (pageNumber === 1) {
                    (window as any).totalPageCount = totalPage;
                }
                if (newTransactions) {
                    setTransactions(prev => [...prev, ...newTransactions]);
                    if (pageNumber < ((window as any).totalPageCount || 1)) {
                        setIsFetchingNextPage(true);
                        setPageNumber(prev => prev + 1);
                    } else {
                        setIsLastPage(true);
                        setIsDataFetched(true);
                    }
                } else {
                    setIsLastPage(true);
                    setIsDataFetched(true);
                }
            }
            setIsFetchingNextPage(false);
        };

        if (!isFetchingNextPage && data) {
            handleData();
        }
    }, [data]);
    const [nestedRemarkMap, setNestedRemarkMap] = useState<Record<string, Record<string, XDagBlockInsc>>>({});
    const [level1KeysCount, setLevel1KeysCount] = useState(0);
    const [level2KeysCount, setLevel2KeysCount] = useState(0);

    useEffect(() => {
        const newNestedRemarkMap = transactions.reduce((acc, transaction) => {
            const level1KeyPrefix = transaction.remark.slice(0, 2);
            const transactionTimestamp = new Date(transaction.time).getTime();
            let level1Key = null;

            // 查找是否有相同前缀且时间戳相差不超过3分钟的一级键
            for (const key in acc) {
                const keyPrefix = key.slice(0, 2);
                const keyTimestamp = parseInt(key.slice(2), 10);
                if (keyPrefix === level1KeyPrefix && Math.abs(transactionTimestamp - keyTimestamp) <= 3 * 60 * 1000) {
                    level1Key = key;
                    break;
                }
            }

            // 如果没有找到符合条件的一级键，则创建新的一级键
            if (!level1Key) {
                level1Key = level1KeyPrefix + transactionTimestamp;
            }

            const level2Key = transaction.remark.slice(0, 4);
            const value = {
                remark: transaction.remark ?? "",
                time: transaction.time,
                address: transaction.address,
                txAddress:transaction.address,
                amount: transaction.amount,
                direction: transaction.direction
            }

            if (!acc[level1Key]) {
                acc[level1Key] = {};
            }

            acc[level1Key][level2Key] = value;

            return acc;
        }, {});

        setNestedRemarkMap(newNestedRemarkMap);

        // 计算一级键和二级键的数量
        const level1Keys = Object.keys(newNestedRemarkMap);
        const level1KeysCount = level1Keys.length;

        const level2KeysCount = level1Keys.reduce((count, key) => {
            return count + Object.keys(newNestedRemarkMap[key]).length;
        }, 0);

        setLevel1KeysCount(level1KeysCount);
        setLevel2KeysCount(level2KeysCount);
    }, [transactions]);



    const [resultInscription, setResultInscription] = useState<Record<string, ResultInscription | null> | null>(null);
    useEffect(() => {
        const fetchInscriptionContent = async () => {
            const result: Record<string, ResultInscription | null> = {};
            const level1Keys = Object.keys(nestedRemarkMap);

            for (const level1Key of level1Keys) {
                // const chunksTmp = Object.values(nestedRemarkMap[level1Key]);
                // const blocks = [...chunksTmp].sort((a, b) => a.remark.localeCompare(b.remark));
                const chunksTmp = Object.values(nestedRemarkMap[level1Key]);
                const blocks = [...chunksTmp].sort((a, b) => {
                    for (let i = 0; i < Math.min(a.remark.length, b.remark.length); i++) {
                        const charCodeA = a.remark.charCodeAt(i);
                        const charCodeB = b.remark.charCodeAt(i);
                        if (charCodeA !== charCodeB) {
                            return charCodeA - charCodeB;
                        }
                    }
                    return a.remark.length - b.remark.length;
                });
                // .map(insc => insc.remark); // Extract remarks after sorting
                // console.log(">>》》》》>>\n", chunksTmp, "\n", blocks);
                try {
                    const unfinishedResult = await validateAndRestoreChunks(level1Key.slice(0, 2), blocks, rpc);
                    if (unfinishedResult) {
                        try {
                            const inscContent = base64DecodeJson(unfinishedResult.bigTxt) as InscriptionContent | null;
                            result[level1Key] = {
                                inscContent: inscContent,
                                awardCost: unfinishedResult.awardCost,
                                targetAddress: unfinishedResult.targetAddress
                            }
                        } catch (e) {
                            console.error(`Failed to decode or parse restored text for key ${level1Key}:`, e);
                            result[level1Key] = null;
                        }
                    }
                } catch (e) {
                    console.error(`Failed to validate and restore chunks for key ${level1Key}:`, e);
                    result[level1Key] = null;
                }
            }
            setResultInscription(result);
        };

        fetchInscriptionContent();
    }, [nestedRemarkMap]);


    useEffect(() => {
        if (pageNumber > 1 && !isLastPage && !isFetchingNextPage) {
            refetch();
        }
    }, [pageNumber]);

    return {
        transactions,
        isFetching,
        isDataFetched,
        refetch,
        nestedRemarkMap,
        level1KeysCount,
        level2KeysCount,
        resultInscription,
        isFetchingNextPage,
    };
}


//下面是返回的单个查询的信息
// 	"jsonrpc": "2.0",
// 	"id": 1,
// 	"result": {
// 		"height": 0,
// 		"balance": "168.000000000",
// 		"blockTime": 1693224448000,
// 		"timeStamp": 1733861834752,
// 		"state": "Accepted",
// 		"hash": null,
// 		"address": "C3vw9K8wteBHkaFTEiezh825YQrYWz71k",
// 		"remark": null,
// 		"diff": null,
// 		"type": "Wallet",
// 		"flags": null,
// 		"totalPage": 1,
// 		"refs": null,
// 		"transactions": [
// 			{
// 				"direction": 0,
// 				"hashlow": "0000000000000000e89a5f1857d1ea7065ce35197a9296dd3ffe1230fa3d03c3",
// 				"address": "wwM9+jAS/j/dlpJ6GTXOZXDq0VcYX5ro",
// 				"amount": "1.000000000",
// 				"time": 1694090442805,
// 				"remark": "wwwfvfvf"
// 			},
// 			...string
// 			]


