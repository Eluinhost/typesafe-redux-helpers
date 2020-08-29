import {
  assumeSuccessfulAction,
  createFailedAction,
  createSuccessAction,
  FailedAction,
  isFailedAction,
  isSuccessfulAction,
  isTypesafeAction,
  PayloadAction,
  SuccessAction,
} from './PayloadAction';

describe('isSuccessfulAction', () => {
  it('should return true for a SuccessAction', () => {
    expect(isSuccessfulAction(createSuccessAction('test', 10))).toBe(true);
  });

  it('should return false for a FailedAction', () => {
    expect(isSuccessfulAction(createFailedAction('test', new Error('test error')))).toBe(false);
  });

  it('should not return true for something that looks successful but doesnt have the symbol', () => {
    expect(isSuccessfulAction({ type: 'test', error: false, payload: 10 } as PayloadAction<any>)).toBe(false);
  });
});

describe('isFailedAction', () => {
  it('should return false for a SuccessAction', () => {
    expect(isFailedAction(createSuccessAction('test', 10))).toBe(false);
  });

  it('should return true for a FailedAction', () => {
    expect(isFailedAction(createFailedAction('test', new Error('test error')))).toBe(true);
  });

  it('should not return true for something that looks failed but doesnt have the symbol', () => {
    expect(
      isSuccessfulAction({ type: 'test', error: true, payload: new Error('test error') } as PayloadAction<any>),
    ).toBe(false);
  });
});

describe('isTypesafeAction', () => {
  it('should return false for something without the symbol', () => {
    expect(isTypesafeAction({ type: 'test', payload: 10, error: false })).toBe(false);
  });

  it('should return true for a FailedAction', () => {
    expect(isTypesafeAction(createFailedAction('test', new Error('test error')))).toBe(true);
  });

  it('should return true for a SuccessAction', () => {
    expect(isTypesafeAction(createSuccessAction('test', 10))).toBe(true);
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
