import React, { useEffect } from 'react';
import { withSendBird } from 'sendbird-uikit';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ModeSelect from './ModeSelect';
import {
  connectionModeOptions,
  CONNECTION_MODE_ALL,
  notificationModeOptions,
  NOTIFICATION_MODE_TOAST_ALL,
} from './MultitabSettingOptions';

const MultitabSettings = ({ state }) => {
  const [connectionMode, setConnectionMode] = React.useState(
    CONNECTION_MODE_ALL,
  );
  const [notificationMode, setNotificationMode] = React.useState(
    NOTIFICATION_MODE_TOAST_ALL,
  );
  const [localPushEnabled, setLocalPushEnabled] = React.useState(true);
  const { initialized, sdk } = state.stores.sdkStore;

  useEffect(() => {
    if (initialized) {
      window.addEventListener('focus', onFocus);
      window.addEventListener('blur', onBlur);
    }

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, [initialized]);

  const onFocus = () => {
    sdk.setForegroundState();
  };

  const onBlur = () => {
    sdk.setBackgroundState();
  };

  const handleLocalPushChange = (event) => {
    setLocalPushEnabled(event.target.checked);
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
