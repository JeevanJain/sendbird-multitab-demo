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
  EVENT_FOCUS_CLAIMED,
  EVENT_NOTIFY,
  EVENT_UPDATE_MULTITAB_SETTINGS,
} from './MultitabSettingOptions';
import SnackbarNotification from './SnackbarNotification';
import { Button } from '@material-ui/core';

const MultitabSettings = ({ state }) => {
  const [activelyFocused, setActivelyFocused] = useState(true);
  const [latestFocused, setLatestFocused] = useState(true);
  const [notification, setNotification] = useState('');
  const [connectionMode, setConnectionMode] = useState(CONNECTION_MODE_ALL);
  const [toastNotificationEnabled, setToastNotificationEnabled] = useState(
    true,
  );
  const [browserNotificationEnabled, setBrowerNotificationEnabled] = useState(
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
    claimFocus(channel);

    return () => {
      channel.close();
      setMultitabChannel(null);
    };
  }, []);

  useEffect(() => {
    if (initialized) {
      const { userId } = sdk.currentUser;
      const ChannelHandler = new sdk.ChannelHandler();
      const UNIQUE_HANDLER_ID = `${userId}-notification-channel-handler`;
      ChannelHandler.onMessageReceived = function (channel, message) {
        if (
          message.message &&
          !(message._sender && message._sender.userId === userId)
        ) {
          if (toastNotificationEnabled) {
            setNotification(`message received: ${message.message}`);
          }
          if (browserNotificationEnabled && latestFocused) {
            displayBrowserNotification(message.message);
          }
        }
      };
      sdk.addChannelHandler(UNIQUE_HANDLER_ID, ChannelHandler);
      return () => {
        sdk.removeChannelHandler(UNIQUE_HANDLER_ID);
      };
    }
  }, [
    initialized,
    toastNotificationEnabled,
    browserNotificationEnabled,
    latestFocused,
  ]);

  useEffect(() => {
    if (initialized) {
      window.addEventListener('focus', onFocus);
      window.addEventListener('blur', onBlur);
    }

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, [
    initialized,
    connectionMode,
    toastNotificationEnabled,
    browserNotificationEnabled,
  ]);

  const onFocus = () => {
    sdk.setForegroundState();
    claimFocus(multitabChannel);
  };

  const claimFocus = (channel) => {
    channel.postMessage({ event: EVENT_FOCUS_CLAIMED });
    setActivelyFocused(true);
    setLatestFocused(true);
  };

  const onBlur = () => {
    if (connectionMode === CONNECTION_MODE_VISIBLE) {
      sdk.setBackgroundState();
      setActivelyFocused(false);
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

  const handleMultitabEvent = ({ event, message, settings }) => {
    switch (event) {
      case EVENT_FOCUS_CLAIMED:
        setLatestFocused(false);
        if (
          connectionMode in [CONNECTION_MODE_VISIBLE, CONNECTION_MODE_RECENT]
        ) {
          sdk.setBackgroundState();
        }
        break;
      case EVENT_NOTIFY:
        if (toastNotificationEnabled) {
          setNotification(message);
        }
        break;
      case EVENT_UPDATE_MULTITAB_SETTINGS:
        syncMultitabSettings(settings);
        break;
      default:
        break;
    }
  };

  const handleConnectionModeChange = (connectionMode) => {
    const newSettings = {
      connectionMode,
      toastNotificationEnabled,
      browserNotificationEnabled,
    };
    setConnectionMode(connectionMode);
    broadcastMultitabSettings(newSettings);
  };

  const handleToastNotificationEnabled = (event) => {
    const toastNotificationEnabled = event.target.checked;
    const newSettings = {
      connectionMode,
      toastNotificationEnabled,
      browserNotificationEnabled,
    };
    setToastNotificationEnabled(toastNotificationEnabled);
    broadcastMultitabSettings(newSettings);
  };

  const handleBrowserNotificationEnabled = (event) => {
    const browserNotificationEnabled = event.target.checked;
    const newSettings = {
      connectionMode,
      toastNotificationEnabled,
      browserNotificationEnabled,
    };
    setBrowerNotificationEnabled(browserNotificationEnabled);
    broadcastMultitabSettings(newSettings);
  };

  const broadcastMultitabSettings = (newSettings) => {
    multitabChannel.postMessage({
      event: EVENT_UPDATE_MULTITAB_SETTINGS,
      settings: newSettings,
    });
  };

  const syncMultitabSettings = (settings) => {
    const {
      connectionMode,
      toastNotificationEnabled,
      browserNotificationEnabled,
    } = settings;
    setConnectionMode(connectionMode);
    setToastNotificationEnabled(toastNotificationEnabled);
    setBrowerNotificationEnabled(browserNotificationEnabled);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setNotification('');
  };

  return (
    <div>
      {String(toastNotificationEnabled)}
      {String(browserNotificationEnabled)}
      <ModeSelect
        name={'Connection'}
        mode={connectionMode}
        setMode={handleConnectionModeChange}
        options={connectionModeOptions}
      ></ModeSelect>
      <FormControlLabel
        control={
          <Checkbox
            checked={toastNotificationEnabled}
            onChange={handleToastNotificationEnabled}
            name='toastNotificationEnabled'
          />
        }
        label='Toast Notification Enabled'
      />
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
