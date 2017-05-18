/**
 * @flow
 */

'use strict';

var ActionSheetIOS = require('ActionSheetIOS');
var { Platform } = require('react-native');
var Alert = require('Alert');
var { API_URL } = require('../PLEnv');
var { Action, ThunkAction } = require('./types');
var FacebookSDK = require('FacebookSDK');

async function logIn(username: string, password: string): Promise<Action> {
  try {
    var response = await fetch(`${API_URL}/secure/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      })
    });
    var user = await response.json();
    if (user.token) {
      const action = {
        type: 'LOGGED_IN',
        data: {
          id: user.id,
          username: user.username,
          token: user.token,
          is_registration_complete: user.is_registration_complete,
        },
      };
      return Promise.resolve(action);
    }
    else {
      return Promise.reject(user);
    }
  } catch (error) {
    console.error(error);
  }
}

function logInManually(username: string, password: string): ThunkAction {
  return (dispatch) => {
    var login = logIn(username, password);
    login.then(
      (result) => {
        dispatch(result);
      }
    );
    return login;
  }
}

async function queryFacebookAPI(path, ...args): Promise {
  return new Promise((resolve, reject) => {
    FacebookSDK.api(path, ...args, (response) => {
      if (response && !response.error) {
        resolve(response);
      } else {
        reject(response && response.error);
      }
    });
  });
}

function logInWithFacebook(): ThunkAction {
  return (dispatch) => {
    FacebookSDK.login((result) => {
      if (result.error) {
        return;
      } else {
        var response = result.authResponse;
        const action = {
          type: 'LOGGED_IN',
          data: {
            id: "test_fbuser_id",
            username: "test_fbuser_name",
            token: "test_fbuser_token",
            is_registration_complete: false,
          },
        };
        dispatch(action);
      }
    }, {});
  };
}

async function forgotPassword(email: string) {
  try {
    let response = await fetch(`${API_URL}/secure/forgot-password`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
      })
    });
    let responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.error(error);
  }
}

module.exports = { logInManually, logInWithFacebook, forgotPassword };
