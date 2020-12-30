---
title: How to monitor network changes using Redux Saga in React Native
date: "2019-01-01T19:33:21.401Z"
description: Redux Saga is an alternate side effect model for redux apps. It is easier to
  manage, execute, test and catch errors.
---

### What is an Event Channel?

Redux Saga consists of `eventChannels` to communicate between external events
and sagas as a factory function. The events are from the event sources _other
than the redux store.

Here’s a basic example from the
[docs](https://github.com/redux-saga/redux-saga/blob/master/docs/advanced/Channels.md#using-the-eventchannel-factory-to-connect-to-external-events):

```js
  import { eventChannel, END } from 'redux-saga'
  
  function countdown(secs) {
    return eventChannel(emitter => {
        const iv = setInterval(() => {
          secs -= 1
          if (secs > 0) {
            emitter(secs)
          } else {
            // this causes the channel to close
            emitter(END)
          }
        }, 1000);
        // The subscriber must return an unsubscribe function
        return () => {
          clearInterval(iv)
        }
      }
    )
  }
```

Things to note:
* The first argument of the `eventChannel` is a listener function.
* The return method is the unregister listener function.

Emitter initializes the listener once after which all the events from the
listener are passed to the emitter function by invoking it.

#### How should I hook up Redux Saga’s Event Channel with React Native’s Network(NetInfo) API?

The React Native’s **NetInfo** `isConnected` API asynchronously fetches a
`boolean` which determines whether the device is `online` or `offline`.

#### Dive into the code

**First, we need to create a start channel method.**

```js
  function * startChannel(syncActionName) {
    const channel = eventChannel(listener => {
      const handleConnectivityChange = (isConnected) => {
        listener(isConnected);
      }
  
      NetInfo.isConnected.addEventListener("connectionChange", handleConnectivityChange);
      return () => NetInfo.isConnected.removeEventListener("connectionChange", handleConnectivityChange);
    });
  }
```

The next step is to **listen for the event changes** within the channel.

```js
  while (true) {
      const connectionInfo = yield take(channel);
    }
```

The final step is to **pass a custom action** to the channel so that the value
can be synced using your action.

```js
  while (true) {
      const connectionInfo = yield take(channel);
      yield put({type: syncActionName, status: connectionInfo }); // blocking action
    }
```

This **channel** can be used in our default exported generator by using the
[call](https://github.com/redux-saga/redux-saga/tree/master/docs/api#callfn-args)
operation.

```js
  export default function* netInfoSaga(options = {}) {
    try {
      yield call(startChannel, options.syncAction);
    } catch (e) {
      console.log(e);
    }
  }
```

The exported generator can then be imported and used as a detached task
using
[spawn/fork](https://github.com/redux-saga/redux-saga/tree/master/docs/api#spawnfn-args)
operation in our main saga.

### Usage

The above code has added it as a package `react-native-network-status-saga` to
include some of the more useful and cool parameters.

Here are the links

* [GitHub](https://github.com/pritishvaidya/react-native-network-status-saga)
* [npm](https://www.npmjs.com/package/react-native-network-status-saga)
