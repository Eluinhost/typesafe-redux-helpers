import { createFailedAction, createSuccessAction, FailedAction, SuccessAction } from './PayloadAction';

export type SuccessActionConstructor<Arg, Payload, Type extends string> = (arg: Arg) => SuccessAction<Payload, Type>;
export type FailedActionConstructor<Type extends string> = (err: Error) => FailedAction<Type>;

export interface ActionCreatorHelpers<Type extends string> {
  /**
   * Useful to determine action name
   */
  readonly actionType: Type;

  /**
   * Useful to determine action name, will be used in redux-saga in places like takeLatest(ACTION, etc);
   */
  readonly toString: () => Type;
}

export interface WithFailed<Type extends string> {
  /**
   * Determines that the action is a failed version, output will include .isError = true
   * and passed error will become the payload
   */
  readonly failed: FailedActionConstructor<Type> & ActionCreatorHelpers<Type>;
}

export type ActionCreator<Arg, Payload, Type extends string> = SuccessActionConstructor<Arg, Payload, Type> &
  ActionCreatorHelpers<Type> &
  WithFailed<Type>;

/**
 * Create an action creator function for the given action name and optional payload creator
 *
 * @param type - the type of the resulting actions
 * @param payloadCreator - When not provided then the resulting action creator will take no arguments and the actions it
 * creates will have no payload. When provided the resulting creator will take a single argument matching this function's
 * argument and the return value of this function will determine what the payload type is.
 */
export const createAction = <Type extends string, Arg = void, Payload = void>(
  type: Type,
  payloadCreator?: (arg: Arg) => Payload,
): ActionCreator<Arg, Payload, Type> => {
  const helpers: ActionCreatorHelpers<Type> = {
    actionType: type,
    toString: () => type,
  };

  const failed = Object.assign<FailedActionConstructor<Type>, ActionCreatorHelpers<Type>>(
    err => createFailedAction(type, err),
    helpers,
  );

  const success: SuccessActionConstructor<Arg, Payload, Type> = arg =>
    createSuccessAction(type, payloadCreator && payloadCreator(arg));

  return Object.assign<SuccessActionConstructor<Arg, Payload, Type>, ActionCreatorHelpers<Type>, WithFailed<Type>>(
    success,
    helpers,
    { failed },
  );
};
