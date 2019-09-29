import { createReducer } from './createReducer';
import { createAction } from './createAction';

const initialState: { amount: number; data: string | Error } = {
  amount: 10,
  data: null,
};

const INCREMENT = createAction('increment', (by: number) => ({ by }));
const COMPLETE = createAction('complete', (data: string) => ({ data }));
const UNKNOWN = createAction('unknown');

describe('createReducer', () => {
  let reducer;

  beforeEach(() => {
    reducer = createReducer(initialState)
      .handleAction(INCREMENT, (state, action) => ({
        amount: action.payload.by + state.amount,
        data: state.data,
      }))
      .handleAction(
        COMPLETE,
        (state, action) => ({
          amount: state.amount,
          data: action.payload.data,
        }),
        (state, action) => ({
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
});
