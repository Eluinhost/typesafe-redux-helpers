import { ActionMatchingPattern } from '@redux-saga/types';
import { TakeEffect } from '@redux-saga/core/effects';
import { takeLatest, takeEvery, take, takeLeading, takeMaybe, ForkEffect } from 'redux-saga/effects';

import { ActionCreator } from './createAction';
import { isFailedAction, isSuccessfulAction } from './PayloadAction';

export const takeSuccess = <T extends ActionCreator<any, any, any>>(actionCreator: T): TakeEffect =>
  take((action) => action.type === actionCreator.actionType && isSuccessfulAction(action));

export const takeFailure = <T extends ActionCreator<any, any, any>>(actionCreator: T): TakeEffect =>
  take((action) => action.type === actionCreator.actionType && isFailedAction(action));

export const takeMaybeSuccess = <T extends ActionCreator<any, any, any>>(actionCreator: T): TakeEffect =>
  takeMaybe((action) => action.type === actionCreator.actionType && isSuccessfulAction(action));

export const takeMaybeFailure = <T extends ActionCreator<any, any, any>>(actionCreator: T): TakeEffect =>
  takeMaybe((action) => action.type === actionCreator.actionType && isFailedAction(action));

// TODO figure out if we can handle ...args for each of these take* effects as pass-through to inner worker
export const takeLatestSuccess = <T extends ActionCreator<any, any, any>>(
  actionCreator: T,
  worker: (action: ActionMatchingPattern<T>) => any,
): ForkEffect => takeLatest((action) => action.type === actionCreator.actionType && isSuccessfulAction(action), worker);

export const takeLatestFailure = <T extends ActionCreator<any, any, any>>(
  actionCreator: T,
  worker: (action: ActionMatchingPattern<T['failed']>) => any,
): ForkEffect => takeLatest((action) => action.type === actionCreator.actionType && isFailedAction(action), worker);

export const takeEverySuccess = <T extends ActionCreator<any, any, any>>(
  actionCreator: T,
  worker: (action: ActionMatchingPattern<T>) => any,
): ForkEffect => takeEvery((action) => action.type === actionCreator.actionType && isSuccessfulAction(action), worker);

export const takeEveryFailure = <T extends ActionCreator<any, any, any>>(
  actionCreator: T,
  worker: (action: ActionMatchingPattern<T['failed']>) => any,
): ForkEffect => takeEvery((action) => action.type === actionCreator.actionType && isFailedAction(action), worker);

export const takeLeadingSuccess = <T extends ActionCreator<any, any, any>>(
  actionCreator: T,
  worker: (action: ActionMatchingPattern<T>) => any,
): ForkEffect =>
  takeLeading((action) => action.type === actionCreator.actionType && isSuccessfulAction(action), worker);

export const takeLeadingFailure = <T extends ActionCreator<any, any, any>>(
  actionCreator: T,
  worker: (action: ActionMatchingPattern<T['failed']>) => any,
): ForkEffect => takeLeading((action) => action.type === actionCreator.actionType && isFailedAction(action), worker);
