import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../RootReducer';
import { InscChunKs } from '_src/shared/utils/chunkString';
import { InscriptionApprovalRequest } from '_src/shared/messaging/messages/payloads/inscription';

interface InitialState {
  inscRequest: InscriptionApprovalRequest | undefined;
  inscChunks: InscChunKs | undefined;
  inscResponse: {} | undefined;
  isProcessing: boolean;
}
const initialState: InitialState = {
  inscRequest: undefined,
  inscChunks: undefined,
  inscResponse: undefined,
  isProcessing: false,
};

export const curInscriptionRequestSlice = createSlice({
  name: 'curInscriptionRequestSlice',
  initialState,
  reducers: {
    setCurInscRequest: (state, action) => {
      state.inscRequest = action.payload;
    },
    setCurChunkResult: (state, action) => {
      state.inscChunks = action.payload;
    },
    setCurInscResponse: (state, action) => {
      state.inscResponse = action.payload;
    },
    setCurInscIsProcessing: (state, action) => {
      state.isProcessing = action.payload
    }
  },
});

export const {
  setCurInscRequest,
  setCurChunkResult,
  setCurInscResponse,
  setCurInscIsProcessing,
} = curInscriptionRequestSlice.actions;

export const selectCurInscRequest = (state: RootState) => state.curInscriptionRequestSlice.inscRequest;
export const selectCurInscChunks = (state: RootState) => state.curInscriptionRequestSlice.inscChunks;
export const selectCurInscResponse = (state: RootState) => state.curInscriptionRequestSlice.inscResponse;
export const selectCurInscIsProcessing = (state: RootState) => state.curInscriptionRequestSlice.isProcessing;

export default curInscriptionRequestSlice.reducer;
