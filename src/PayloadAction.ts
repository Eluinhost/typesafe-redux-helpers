import { Action } from 'redux';

/*
 * Extensions to base Redux Action type to type the payload and have an FSA-like isError capability
 */

export interface SuccessAction<Payload, Type extends string = any> extends Action<Type> {
  readonly error: false;
  readonly payload: Payload;
}

export interface FailedAction<Type extends string = any> extends Action<Type> {
  readonly error: true;
  readonly payload: Error;
}

export type PayloadAction<Payload, Type extends string = any> = SuccessAction<Payload, Type> | FailedAction<Type>;

/**
 * Simple type guard to cast PayloadAction -> Success/Failure actions
 */
export const isSuccessfulAction = <Payload, Type extends string>(
  action: PayloadAction<Payload, Type>,
): action is SuccessAction<Payload, Type> => action.error !== true;

/**
 * Casts the action to success but will throw if the action was not actually a successful one.
 */
export function assumeSuccessfulAction<Payload, Type extends string>(
  action: PayloadAction<Payload, Type>,
): SuccessAction<Payload, Type> {
  if (isSuccessfulAction(action)) {
    return action;
  }

  throw new Error(`assumed '${action.type}' action was successful when it was not`);
}

export const createSuccessAction = <Type extends string, Payload>(
  type: Type,
  payload: Payload,
): SuccessAction<Payload, Type> => ({
  type,
  payload,
  error: false,
});

export const createFailedAction = <Type extends string>(type: Type, error: Error): FailedAction<Type> => ({
  type,
  payload: error,
  error: true,
});
