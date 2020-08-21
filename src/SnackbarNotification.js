import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

const Alert = (props) => {
  return <MuiAlert elevation={6} variant='filled' {...props} />;
};

const SnackbarNotification = ({ notification, handleCloseSnackbar }) => {
  return (
    <Snackbar
      open={Boolean(notification)}
      autoHideDuration={5000}
      onClose={handleCloseSnackbar}
    >
      <Alert onClose={handleCloseSnackbar} severity='success'>
        {notification}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarNotification;
