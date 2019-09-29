import { ActionCreator, createAction } from './createAction';
import { FailedAction, isSuccessfulAction, SuccessAction } from './PayloadAction';

describe('createAction', () => {
  let actionCreator: ActionCreator<string, number, 'test action'>;

  beforeEach(() => {
    actionCreator = createAction('test action', (arg: string) => parseInt(arg));
  });

  it('should contain .actionType set to the provided type', () => {
    expect(actionCreator.actionType).toBe('test action');
  });

  it('should contain .toString that returns the provided type', () => {
    expect(actionCreator.toString()).toBe('test action');
  });

  describe('success', () => {
    let action: SuccessAction<number, 'test action'>;

    beforeEach(() => {
      action = actionCreator('100');
    });

    it('should create a success action when called with a non-error', () => {
      expect(isSuccessfulAction(action)).toBe(true);
    });

    it('should have the payload transformed by the provided function', () => {
      expect(action.payload).toBe(100);
    });

    it('should have the correct type', () => {
      expect(action.type).toBe('test action');
    });
  });

  describe('failure', () => {
    const error = new Error('test error');
    let action: FailedAction<'test action'>;

    beforeEach(() => {
      action = actionCreator.failed(error);
    });

    it('should create a failed action when called with a error', () => {
      expect(isSuccessfulAction(action)).toBe(false);
    });

    it('should have the payload that is the error directly', () => {
      expect(action.payload).toBe(error);
    });

    it('should have the correct type', () => {
      expect(action.type).toBe('test action');
    });
  });
});
