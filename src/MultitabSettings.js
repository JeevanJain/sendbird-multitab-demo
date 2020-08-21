import React, { useState, useEffect } from 'react';
import { withSendBird } from 'sendbird-uikit';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ModeSelect from './ModeSelect';
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

const MultitabSettings = ({ state }) => {
  const [connectionMode, setConnectionMode] = useState(CONNECTION_MODE_ALL);
  const [notificationMode, setNotificationMode] = useState(
    NOTIFICATION_MODE_TOAST_ALL,
  );
  const [localPushEnabled, setLocalPushEnabled] = useState(true);
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
    multitabChannel.postMessage({ event: EVENT_FOCUS_CLAIMED });
  };

  const onBlur = () => {
    if (connectionMode === CONNECTION_MODE_VISIBLE) {
      sdk.setBackgroundState();
    }
  };

  const handleLocalPushChange = (event) => {
    setLocalPushEnabled(event.target.checked);
  };

  const handleMultitabEvent = ({ event }) => {
    switch (event) {
      case EVENT_FOCUS_CLAIMED:
        if (
          connectionMode in [CONNECTION_MODE_VISIBLE, CONNECTION_MODE_RECENT]
        ) {
          sdk.setBackgroundState();
        }
        break;
      case EVENT_NOTIFY:

      default:
        break;
    }
  };

  return (
    <div>
      {String(localPushEnabled)}
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
            checked={localPushEnabled}
            onChange={handleLocalPushChange}
            name='localPushEnabled'
          />
        }
        label='Local Push Enabled'
      />
    </div>
  );
};

const mapSendbirdStateToProps = (state) => {
  return {
    state,
  };
};

export default withSendBird(MultitabSettings, mapSendbirdStateToProps);
