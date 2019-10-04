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
  /**
   * Run an inner reducer to manage given property. All actions will be passed through to this reducer.
   * Useful for composing reducers
   */
  readonly forProperty: <Property extends keyof State>(prop: Property, reducer: Reducer<State[Property]>) => this;
}

// default should just not make any changes and return same reference
const defaultReducer = state => state;

export const createReducer = <State>(initialState: State): Reducer<State> & ReducerHelpers<State> => {
  // map of action types -> reducer to run for it
  const mappings: { [type: string]: Reducer<State> } = {};
  // reducers that run after every action
  const postReducers: Array<Reducer<State>> = [];

  // actual reducer that will be used by redux
  const reducer: Reducer<State> = (state: State = initialState, action: Action): State =>
    [mappings[action.type] || defaultReducer, ...postReducers].reduce(
      (intermediateState, currentReducer) => currentReducer(intermediateState, action),
      state,
    );

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
    forProperty<Property extends keyof State>(prop: Property, reducer: Reducer<State[Property]>) {
      const innerReducer = (state: State, action: Action) => {
        const input = state[prop];
        const output = reducer(state[prop], action);

        // only return a mutated state if the output has actually changed reference
        return output === input ? state : { ...state, [prop]: output };
      };

      postReducers.push(innerReducer);

      return this;
    },
  };

  return Object.assign<Reducer<State>, ReducerHelpers<State>>(reducer, helpers);
};
