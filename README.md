# typesafe-redux-helpers

This library was designed to allow for correctly typed and checked reducers/actions with typescript
following an FSA-like format for created actions.

# Actions

Actions created using this library follow the FSA standard:

```javascript
success = {
  type: 'INCREMENT',
  error: false,
  payload: {
    amount: 10,
  },
};

failure = {
  type: 'LOGOUT',
  error: true,
  payload: new Error('failed to call api'),
};
```

To make an action creator without arguments you can simply call `createAction` with only a type to use:

```typescript
import { createAction } from 'typesafe-redux-helpers';

const INCREMENT = createAction('INCREMENT');

dispatch(INCREMENT());

// equivalent to
dispatch({
  type: 'INCREMENT',
  error: false,
});
```

To make an action creator that has a payload you can provide a second argument; a transformation function.

This function takes a single argument and the return value will be used as the payload. The output action
creator will take the same argument and return an action with the transformed payload.

```typescript
import { createAction } from 'typesafe-redux-helpers';

const INCREMENT = createAction('INCREMENT', (amount: number) => ({ amount }));

dispatch(INCREMENT(10));

// equivalent to
dispatch({
  type: 'INCREMENT',
  error: false,
  payload: {
    amount: 10,
  },
});
```

All actions can be created as a failure state. To access this functionality you can use
`.failed` on the action creator with an Error.

```typescript
import { createAction } from 'typesafe-redux-helpers';

const INCREMENT = createAction('INCREMENT', (amount: number) => ({ amount }));

const error = new Error('example error');

dispatch(INCREMENT.failed(error));

// equivalent to
dispatch({
  type: 'INCREMENT',
  error: true,
  payload: error,
});
```

# Create reducer

A reducer can be created by calling `createReducer(initialState)`. The State type of the reducer
is implied from the type of the initial state passed in.

```typescript
import { createReducer } from 'typesafe-redux-helpers';

interface CounterState {
  count: number;
  error: Error | null;
}

const initialState = {
  count: 10,
  error: null,
};

const reducer = createReducer(initialState);
```

By default this reducer will not make any state changes, to do this we will need to handle
some actions using `handleAction` or `handleUntypedAction`

## Handle Action

```typescript
createReducer(initialState)
  .handleAction(INCREMENT, (state, action) => ({
    ...state,
    count: state.count + action.payload.amount,
  }))
  .handleAction(DECREMENT, (state, action) => ({
    ...state,
    count: state.count - action.payload.amount,
  }));
```

In this example `state` will be typed as `CounterState` and `action` will be typed as the success action from INCREMENT.
The reducer will also type check that the return value is also `CounterState`

When providing only a single function it will only be called for success actions, to handle failed actions you
can provide a second reducer where the action is typed as the failed action from INCREMENT:

```typescript
createReducer(initialState).handleAction(
  INCREMENT,
  (state, action) => ({
    ...state,
    count: action.payload.amount,
  }),
  (state, action) => ({
    ...state,
    error: action.payload,
  }),
);
```

## Handle untyped action

This function works the same as `handleAction` but instead of passing an action creator you instead pass a
action type string. Because of this the reducer cannot correctly type `action` in the reducer but can type
`state` and the return value correctly. It also does not check for success/failure actions separately.

```typescript
createReducer(initialState).handleUntypedAction('INCREMENT', (state, action) => ({
  count: action.payload.amount,
}));
```

# Child reducers

Reducers can be composed by using `.forProperty('prop', childReducer)`

```typescript
const innerReducer = createReducer(initialInnerState)
  .handleAction(STARTED_FETCHING, () => ({ isFetching: true }))
  .handleAction(STOPPED_FETCHING, () => ({ isFetching: false }));

createReducer(initialState)
  .handleAction(INCREMENT, state => ({ count: count + 1, inner: state.inner }))
  .forProperty('inner', innerReducer);
```

The inner reducer will have every action available like every reducer and will manage the state for the single
property 'inner' for this example
