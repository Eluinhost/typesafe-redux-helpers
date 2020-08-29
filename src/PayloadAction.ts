import { Action, AnyAction } from 'redux';

const TYPESAFE_REDUX_ACTION = Symbol('@@TYPESAFE_REDUX_ACTION@@');

export interface SuccessAction<Payload, Type extends string = any> extends Action<Type> {
  readonly error: false;
  readonly payload: Payload;
  readonly [TYPESAFE_REDUX_ACTION]: true;
}

export interface FailedAction<Type extends string = any> extends Action<Type> {
  readonly error: true;
  readonly payload: Error;
  readonly [TYPESAFE_REDUX_ACTION]: true;
}

/*
 * Extensions to base Redux Action type to type the payload and have an FSA-like isError capability
 */
export type PayloadAction<Payload, Type extends string = any> = SuccessAction<Payload, Type> | FailedAction<Type>;

/**
 * Simple type guard to cast PayloadAction -> Success actions
 */
export const isSuccessfulAction = <Payload, Type extends string>(
  action: PayloadAction<Payload, Type>,
): action is SuccessAction<Payload, Type> => isTypesafeAction(action) && action.error === false;

/**
 * Simple type guard to cast PayloadAction -> Failed actions
 */
export const isFailedAction = <Payload, Type extends string>(
  action: PayloadAction<Payload, Type>,
): action is FailedAction<Type> => isTypesafeAction(action) && action.error === true;

export const isTypesafeAction = (action: AnyAction): action is PayloadAction<unknown> =>
  (action as any)[TYPESAFE_REDUX_ACTION] === true;

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
  [TYPESAFE_REDUX_ACTION]: true,
});

export const createFailedAction = <Type extends string>(type: Type, error: Error): FailedAction<Type> => ({
  type,
  payload: error,
  error: true,
  [TYPESAFE_REDUX_ACTION]: true,
});
