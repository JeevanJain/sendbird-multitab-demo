import React, { useEffect } from 'react';
import { withSendBird } from 'sendbird-uikit';

const FocusListener = ({ state }) => {
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

  return <></>;
};

const mapSendbirdStateToProps = (state) => {
  return {
    state,
  };
};

export default withSendBird(FocusListener, mapSendbirdStateToProps);
