import React, { useState, useEffect } from 'react';
import { withSendBird } from 'sendbird-uikit';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ModeSelect from './ModeSelect';
import { v4 } from 'uuid';
import {
  connectionModeOptions,
  CONNECTION_MODE_ALL,
  CONNECTION_MODE_VISIBLE,
  CONNECTION_MODE_RECENT,
  notificationModeOptions,
  NOTIFICATION_MODE_TOAST_ALL,
  NOTIFICATION_MODE_TOAST_CONNECTED,
  NOTIFICATION_MODE_TOAST_NONE,
  EVENT_FOCUS_CLAIMED,
  EVENT_NOTIFY,
} from './MultitabSettingOptions';
import SnackbarNotification from './SnackbarNotification';
import { Button } from '@material-ui/core';

const MultitabSettings = ({ state }) => {
  const [notification, setNotification] = useState('');
  const [backgroundMode, setBackgroundMode] = useState(false);
  const [connectionMode, setConnectionMode] = useState(CONNECTION_MODE_ALL);
  const [notificationMode, setNotificationMode] = useState(
    NOTIFICATION_MODE_TOAST_ALL,
  );
  const [browserNotificationEnabled, setBrowserNotificationEnabled] = useState(
    true,
  );
  const { initialized, sdk } = state.stores.sdkStore;
  const [multitabChannel, setMultitabChannel] = useState(true);

  useEffect(() => {
    const channel = new BroadcastChannel('Sendbird Multitab');
    channel.onmessage = ({ data }) => {
      handleMultitabEvent(data);
    };
    setMultitabChannel(channel);

    return () => {
      channel.close();
      setMultitabChannel(null);
    };
  }, []);

  useEffect(() => {
    if (initialized) {
      console.log(state.stores);
      const ChannelHandler = new sdk.ChannelHandler();
      // If only showing on connected clients this does not need to be sent through the multitab broadcast channel
      // and can be received on each client
      const UNIQUE_HANDLER_ID = v4();
      ChannelHandler.onMessageReceived = function (channel, message) {
        const { userId } = sdk.currentUser;
        console.log(message);
        if (
          message.message &&
          !(message._sender && message._sender.userId === userId)
        ) {
          setNotification(`message received: ${message.message}`);
          if (browserNotificationEnabled) {
            displayBrowserNotification(message.message);
          }
        }
      };
      sdk.addChannelHandler(UNIQUE_HANDLER_ID, ChannelHandler);
      return () => {
        // cleanup
        sdk.removeChannelHandler(UNIQUE_HANDLER_ID);
      };
    }
  }, [initialized]);

  useEffect(() => {
    if (initialized) {
      window.addEventListener('focus', onFocus);
      window.addEventListener('blur', onBlur);
    }

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, [initialized, connectionMode, notificationMode]);

  const onFocus = () => {
    sdk.setForegroundState();
    setBackgroundMode(false);
    multitabChannel.postMessage({ event: EVENT_FOCUS_CLAIMED });
  };

  const onBlur = () => {
    if (connectionMode === CONNECTION_MODE_VISIBLE) {
      setBackgroundMode(true);
      sdk.setBackgroundState();
    }
  };

  const requestBrowserNotificationPermission = () => {
    const userAgent = window.navigator.userAgent;
    const msie = userAgent.indexOf('Trident/');
    const edge = userAgent.indexOf('Edge/');
    if (msie < 0 && edge < 0) {
      if (window.Notification && Notification.permission !== 'granted') {
        Notification.requestPermission(function (permission) {
          if (Notification.permission !== permission) {
            Notification.permission = permission;
          }
        });
      }
    }
  };

  useEffect(() => {
    if (browserNotificationEnabled) {
      requestBrowserNotificationPermission();
    }
  }, [browserNotificationEnabled]);

  const handleBrowserNotificationEnabled = (event) => {
    const enabled = event.target.checked;
    setBrowserNotificationEnabled(event.target.checked);
  };

  const displayBrowserNotification = (message) => {
    if ('Notification' in window) {
      var notification = new Notification('New Message', {
        body: message,
      });
      notification.onclick = function () {
        window.focus();
      };
    }
  };

  const handleMultitabEvent = ({ event, message }) => {
    switch (event) {
      case EVENT_FOCUS_CLAIMED:
        if (
          connectionMode in [CONNECTION_MODE_VISIBLE, CONNECTION_MODE_RECENT]
        ) {
          setBackgroundMode(true);
          sdk.setBackgroundState();
        }
        break;
      case EVENT_NOTIFY:
        if (
          notificationMode === NOTIFICATION_MODE_TOAST_ALL ||
          (!backgroundMode &&
            notificationMode === NOTIFICATION_MODE_TOAST_CONNECTED)
        ) {
          setNotification(message);
        }
        break;
      default:
        break;
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setNotification('');
  };

  return (
    <div>
      {String(browserNotificationEnabled)}
      <ModeSelect
        name={'Connection'}
        mode={connectionMode}
        setMode={setConnectionMode}
        options={connectionModeOptions}
      ></ModeSelect>
      <ModeSelect
        name={'Notification'}
        mode={notificationMode}
        setMode={setNotificationMode}
        options={notificationModeOptions}
      ></ModeSelect>
      <FormControlLabel
        control={
          <Checkbox
            checked={browserNotificationEnabled}
            onChange={handleBrowserNotificationEnabled}
            name='browserNotificationEnabled'
          />
        }
        label='Browser Notification Enabled'
      />
      <SnackbarNotification
        notification={notification}
        handleCloseSnackbar={handleCloseSnackbar}
      ></SnackbarNotification>
      <Button></Button>
    </div>
  );
};

const mapSendbirdStateToProps = (state) => {
  return {
    state,
  };
};

export default withSendBird(MultitabSettings, mapSendbirdStateToProps);
