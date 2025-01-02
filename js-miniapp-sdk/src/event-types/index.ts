/**
 * Enum for supported SDK event types
 */
export enum MiniAppEvents {
  EXTERNAL_WEBVIEW_CLOSE = 'miniappwebviewclosed',
  PAUSE = 'miniapppause',
  RESUME = 'miniappresume',
}

/**
 * Enum for supported keyboard event types
 */
export enum MiniAppKeyboardEvents {
  KEYBOARDSHOWN = 'miniappkeyboardshown',
  KEYBOARDHIDDEN = 'miniappkeyboardhidden',
}

/**
 * Enum for supported HostApp event types
 */
export enum HostAppEvents {
  RECEIVE_JSON_INFO = 'miniappreceivejsoninfo',
}

export enum CommonEvents {
  GET_UNIQUE_ID = 'getUniqueId',
  GET_MESSAGE_UNIQUE_ID = 'getMessagingUniqueId',
  GET_MAU_ID = 'getMauid',
  REQUEST_CUSTOM_PERMISSIONS = 'requestCustomPermissions',
  LOAD_AD = 'loadAd',
  SHOW_AD = 'showAd',
  SHARE_INFO = 'shareInfo',
  SET_SCREEN_ORIENTATION = 'setScreenOrientation',
  GET_POINTS = 'getPoints',
  GET_HOST_ENVIRONMENT_INFO = 'getHostEnvironmentInfo',
  DOWNLOAD_FILE = 'downloadFile',
  SET_CLOSE_ALERT = 'setCloseAlert',
  REQUEST_PERMISSION = 'requestPermission',
}

export enum USERINFO {
  GET_USER_NAME = 'getUserName',
  GET_PROFILE_PHOTO = 'getProfilePhoto',
  GET_POINT = 'getPoints',
  GET_PHONE_NUMBER = 'getPhoneNumber',
  IS_LOGGED_IN = 'isLoggedIn',
  GET_ACCESS_TOKEN = 'getAccessToken',
  GET_CONTACTS = 'getContacts',
}

export enum CHATSERVICE {
  SEND_MESSAGE_TO_CONTACT = 'sendMessageToContact',
}
