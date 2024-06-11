import { combineReducers } from "@reduxjs/toolkit";
import account from "./slices/account";
import app from "./slices/app";
import permissions from "./slices/permissions";
import transactionRequests from "./slices/transaction-requests";
import inscriptionRequests from "./slices/inscription-requests";
import curInscriptionRequestSlice from "./slices/curInscriptionRequestSlice"

const rootReducer = combineReducers({
  account,
  app,
  permissions,
  transactionRequests,
  inscriptionRequests,
  curInscriptionRequestSlice,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
