import { error } from "console";
import BitCounter from "./BitCounter";
import { blake2b } from "@noble/hashes/blake2b";

const DEFAULT_GROUPSIZE = 28;
const DEFAULT_CHUNKHEADERSIZE = 4;

export interface InscChunKs {
  chunks: string[];
  estimateGas: number;
  award: number;
  singleTxCost: number;
  totalCost: number;
}


function generateLastChunk(imgIndex:string, chunkSize:number, base64String:string){
  const hash = blake2b(base64String,{ dkLen: 32 });
  const hashString = Buffer.from(hash).toString('hex');
  const last6Chars = hashString.slice(-6);
  const chunk = imgIndex + "~~#$#" + chunkSize  + "#" + last6Chars;
  return chunk;
}

function splitBase64String(imgIndex: string, base64String: string, groupSize: number): string[] {
  const chunks: string[] = [];
  const bitCounter = new BitCounter();
  let chunkCount = 0;
  for (let i = 0; i < base64String.length; i += groupSize) {
    const idxString = bitCounter.getCurrentCharacter();
    const chunk = imgIndex + idxString + base64String.slice(i, i + groupSize);
    chunks.push(chunk);
    bitCounter.getNextCharacter();
    chunkCount++;
  }
  const lastChunk = generateLastChunk(imgIndex, chunkCount,base64String);
  chunks.push(lastChunk);
  console.log("#########chunks:\n", chunks);
  return chunks;
}



export const largeTextToChunks = (imgIndex: string, largeText: string, awardRatio: number = 10): InscChunKs | undefined => {

  if (!imgIndex || imgIndex.length !== 2 || !largeText) {
    throw new Error("Unexpected imgIndex and largeText.");
  }

  if (largeText) {
    const base64Chunks = largeText ? splitBase64String(imgIndex, largeText, DEFAULT_GROUPSIZE) : [];
    const gas = base64Chunks.length * 0.1;
    const award = Math.ceil((gas * awardRatio) / 0.1) * 0.1;
    const singleTxCost = Math.ceil(((award + gas) / base64Chunks.length) / 0.1) * 0.1;
    const totalCost = singleTxCost * base64Chunks.length;
    return {
      chunks: base64Chunks,
      estimateGas: gas,
      award,
      singleTxCost,
      totalCost,
    }
  }
}
