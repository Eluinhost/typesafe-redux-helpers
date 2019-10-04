import { createReducer, ReducerHelpers } from './createReducer';
import { createAction } from './createAction';
import { Reducer } from 'redux';

interface State {
  amount: number;
  data: string | Error;
  inner: InnerState;
}

interface InnerState {
  hasIncremented: boolean;
  hasTriggeredInner: boolean;
}

const initialState: State = {
  amount: 10,
  data: null,
  inner: undefined,
};

const initialInnerState: InnerState = {
  hasIncremented: false,
  hasTriggeredInner: false,
};

const INCREMENT = createAction('increment', (by: number) => ({ by }));
const COMPLETE = createAction('complete', (data: string) => ({ data }));
const UNKNOWN = createAction('unknown');
const INNER_ONLY = createAction('inner only');

describe('createReducer', () => {
  let reducer: Reducer<State> & ReducerHelpers<State>;
  let innerReducer: Reducer<InnerState> & ReducerHelpers<InnerState>;

  beforeEach(() => {
    reducer = createReducer(initialState)
      .handleAction(INCREMENT, (state, action) => ({
        ...state,
        amount: action.payload.by + state.amount,
        data: state.data,
      }))
      .handleAction(
        COMPLETE,
        (state, action) => ({
          ...state,
          amount: state.amount,
          data: action.payload.data,
        }),
        (state, action) => ({
          ...state,
          amount: state.amount,
          data: action.payload,
        }),
      );
  });

  it('should use initial state', () => {
    expect(reducer(undefined, UNKNOWN())).toBe(initialState);
  });

  describe('without failure condition', () => {
    it('should not change state for a unhandled action', () => {
      expect(reducer(initialState, UNKNOWN())).toBe(initialState);
    });

    it('should run success reducer for successes', () => {
      expect(reducer(initialState, INCREMENT(10))).toEqual({
        amount: 20,
        data: null,
      });
    });

    it('should not make changes for failures', () => {
      expect(reducer(initialState, INCREMENT.failed(new Error('test error')))).toEqual(initialState);
    });
  });

  describe('with failure condition', () => {
    it('should not change state for a unhandled action', () => {
      expect(reducer(initialState, UNKNOWN())).toBe(initialState);
    });

    it('should run success reducer for successes', () => {
      expect(reducer(initialState, COMPLETE('test'))).toEqual({
        amount: 10,
        data: 'test',
      });
    });

    it('should make changes for failures', () => {
      const error = new Error('test error');

      expect(reducer(initialState, COMPLETE.failed(error))).toEqual({
        amount: 10,
        data: error,
      });
    });
  });

  describe('inner reducer', () => {
    beforeEach(() => {
      innerReducer = createReducer(initialInnerState)
        .handleAction(INCREMENT, state => ({ ...state, hasIncremented: true }))
        .handleAction(INNER_ONLY, state => ({ ...state, hasTriggeredInner: true }));

      reducer.forProperty('inner', innerReducer);
    });

    it('should trigger inner reducer when outer reducer also handles action', () => {
      const output = reducer(initialState, INCREMENT(10));

      expect(output.amount).toBe(initialState.amount + 10);
      expect(output.inner).not.toBe(initialInnerState);
      expect(output.inner.hasTriggeredInner).toBe(false);
      expect(output.inner.hasIncremented).toBe(true);
    });

    it('should trigger inner reducer when outer reducer does not handle action', () => {
      const output = reducer(initialState, INNER_ONLY());

      expect(output.inner).not.toBe(initialInnerState);
      expect(output.inner.hasTriggeredInner).toBe(true);
      expect(output.inner.hasIncremented).toBe(false);
    });

    test('we must go deeper', () => {
      type C = number;
      type B = { c: C };
      type A = { b: B };

      const cReducer = createReducer<C>(10).handleAction(INCREMENT, (state, action) => state + action.payload.by);

      const bReducer = createReducer<B>({ c: undefined }).forProperty('c', cReducer);

      const reducer = createReducer<A>({ b: undefined }).forProperty('b', bReducer);

      const output = reducer(undefined, INCREMENT(10));

      expect(output.b.c).toBe(20);
    });
  });
});
