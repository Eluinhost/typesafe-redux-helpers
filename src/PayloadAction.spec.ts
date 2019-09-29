import {
  assumeSuccessfulAction,
  createFailedAction,
  createSuccessAction,
  FailedAction,
  isSuccessfulAction,
  SuccessAction,
} from './PayloadAction';

describe('isSuccessfulAction', () => {
  it('should return true for a SuccessAction', () => {
    expect(isSuccessfulAction(createSuccessAction('test', 10))).toBe(true);
  });

  it('should return false for a FailedAction', () => {
    expect(isSuccessfulAction(createFailedAction('test', new Error('test error')))).toBe(false);
  });
});

describe('assumeSuccessfulAction', () => {
  it('should pass action back if it is already a success', () => {
    const action = createSuccessAction('test', 10);

    expect(assumeSuccessfulAction(action)).toBe(action);
  });

  it('should throw when a failed action is passed', () => {
    const action = createFailedAction('test', new Error('test'));

    expect(() => assumeSuccessfulAction(action)).toThrow("assumed 'test' action was successful when it was not");
  });
});

describe('createSuccessAction', () => {
  let action: SuccessAction<number, any>;

  beforeEach(() => {
    action = createSuccessAction('test action', 200);
  });

  it('should make an action with .isError set to false', () => {
    expect(action.error).toBe(false);
  });

  it('should set the correct type', () => {
    expect(action.type).toBe('test action');
  });

  it('should set the payload correctly', () => {
    expect(action.payload).toBe(200);
  });
});

describe('createFailedAction', () => {
  const error = new Error('test error');
  let action: FailedAction<any>;

  beforeEach(() => {
    action = createFailedAction('test action', error);
  });

  it('should make an action with .isError set to true', () => {
    expect(action.error).toBe(true);
  });

  it('should set the correct type', () => {
    expect(action.type).toBe('test action');
  });

  it('should set the payload correctly', () => {
    expect(action.payload).toBe(error);
  });
});
