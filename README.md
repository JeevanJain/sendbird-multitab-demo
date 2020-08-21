## Overview

This proof of concept demo shows how to handle Sendbird in a browser with multiple tabs open. Some users may prefer to limit their browser to a single connection of either the currently visible tab, or in the case a non Senbird tab is open limit the connection to the most recently viewed Sendbird tab.

This overview used the [react-compose-sample](https://github.com/sendbird/SendBird-JavaScript/tree/master/uikit-samples/composed-react-app) from the ui-kit-samples in the [Sendbird JavaScript Samples Repository](https://github.com/sendbird/SendBird-JavaScript).

## Assumptions / Notes

- This assumes tabs open in the browser are logged in as the same user. The cross tab communication does not currently handle user information and only supports a single user.
- Notification are currently only displayed for User or Admin type messages.
- Different people have different prefences for chat. The toggles are meant to provide a few options, but even if your scenario is not configurable in this demo it is likely possible with Sendbird.
- The user experience will be best when all tabs maintain their websocket connection as much as possible. For Sendbird users that do not wish to that, this is a decent starting point.
- Not all APIs are available in all browsers. This uses the Notification and Broadcast channel APIs. This is one of many ways to do this and you may have to concider alternatives depending on your use case.
- When a new client is connect in a new tab and the settings are not the default the tab settings will be out of sync until one of the tabs changes a setting. This is fixable, but doesn't really matter for the demo so hasn't been fixed.
  
## How to run

Rename the file .env.example to .env and add your [APPID](https://dashboard.sendbird.com/)

Find code samples in src/App.js and src/Chat.js

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
