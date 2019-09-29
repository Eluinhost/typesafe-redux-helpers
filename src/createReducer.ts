import { Action, Reducer } from 'redux';

import { ActionCreator } from './createAction';
import { FailedAction, isSuccessfulAction, PayloadAction, SuccessAction } from './PayloadAction';

export interface ReducerHelpers<State> {
  /**
   * For actions not created by `createAction`, does not require a valid typed reducer
   * and can reference just the type name alone instead of the entire creator function
   */
  readonly handleUntypedAction: (action: string, reducer: Reducer<State>) => this;
  /**
   * Informs this reducer to handle the given action. For success actions the first reducer
   * is called, for failed actions the second (optional) reducer is called.
   */
  readonly handleAction: <Payload, Type extends string>(
    actionCreator: ActionCreator<any, Payload, Type>,
    success: (state: State, action: SuccessAction<Payload, Type>) => State,
    failure?: (state: State, action: FailedAction<Type>) => State,
  ) => this;
}

export const createReducer = <State>(initialState: State): Reducer<State> & ReducerHelpers<State> => {
  // map of action types -> reducer to run for it
  const mappings: { [type: string]: Reducer<State> } = {};

  // actual reducer that will be used by redux
  const reducer: Reducer<State> = (state: State = initialState, action: Action): State => {
    const configuredReducer = mappings[action.type];

    // if we don't have a registered reducer for the action dont do anything
    if (!configuredReducer) {
      return state;
    }

    return configuredReducer(state, action);
  };

  const helpers: ReducerHelpers<State> = {
    handleUntypedAction(action, reducer) {
      if (mappings[action]) {
        throw new Error(`Already handling an action with name '${action}'`);
      }

      mappings[action] = reducer;

      return this;
    },
    handleAction<Payload, Type extends string>(actionCreator, successReducer, failedReducer) {
      const splitReducer = (state: State, action: PayloadAction<Payload, Type>): State => {
        if (isSuccessfulAction(action)) {
          return successReducer(state, action);
        }

        if (failedReducer) {
          return failedReducer(state, action);
        }

        return state;
      };

      return this.handleUntypedAction(actionCreator.actionType, splitReducer);
    },
  };

  return Object.assign<Reducer<State>, ReducerHelpers<State>>(reducer, helpers);
};
