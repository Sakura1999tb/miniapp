import {
  AccessTokenData,
  Contact,
  MiniAppError,
  Points,
} from '../../../js-miniapp-bridge/src';
import { USERINFO } from '../event-types';
import {
  convertUnicodeCharacters,
  convertUnicodeCharactersForAndroid,
} from '../helpers/utils/common-bridge';
import { getBridge } from '../sdkbridge';
import { parseMiniAppError } from '../types/error-types';
import { NativeTokenData } from '../types/token-data';
import { DecodeManager } from './decoder';

/**
 * Interfaces to retrieve User profile related information.
 */
export interface UserInfoProvider {
  /**
   * Fetches the username from host app.
   * You should request the {@link CustomPermissionName.USER_NAME} permission before using this method.
   * @returns Username saved in the host app user profile.
   */
  getUserName(): Promise<string>;

  /**
   * Fetches the profile photo URI from host app.
   * You should request the {@link CustomPermissionName.PROFILE_PHOTO} permission before using this method.
   * @returns Profile photo saved in the host app user profile.
   */
  getProfilePhoto(): Promise<string>;

  /**
   * Fetches the contact list from host app.
   * You should request the {@link CustomPermissionName.CONTACT_LIST} permission before using this method.
   * @returns Contact list in the host app user profile.
   */
  getContacts(): Promise<Contact[]>;

  /**
   * Fetches the access token from host app.
   * @param audience one of the audiences provided in MiniApp manifest
   * @param scopes scopes array associated to the audience
   * @returns Access token from native host app.
   */
  getAccessToken(
    audience: string,
    scopes: string[]
  ): Promise<AccessTokenData | MiniAppError>;

  /**
   * Fetches the points from host app.
   * @returns Points from native host app.
   */
  getPoints(): Promise<Points | MiniAppError>;

  /**
   * Fetches the Phone number of the user.
   * @returns Phone number saved in the host app user profile.
   */
  getPhoneNumber(): Promise<string>;

  /**
   * Fetches the current login status of the user
   */
  isLoggedIn(): Promise<boolean>;
}

/** @internal */
export class UserInfo implements UserInfoProvider {
  /**
   * Associating getUserName function to MiniAppBridge object.
   * This function returns username from the user profile
   * (provided the rakuten.miniapp.user.USER_NAME custom permission is allowed by the user)
   * It returns error info if user had denied the custom permission
   */
  getUserName(): Promise<string> {
    const platform = getBridge().platform;
    return getBridge()
      .sendToNative(USERINFO.GET_USER_NAME, null)
      .then(userName => {
        let value;
        if (platform === 'iOS') {
          value = convertUnicodeCharacters(userName);
        } else {
          value = convertUnicodeCharactersForAndroid(userName);
        }
        return value;
      })
      .catch(error => error);
  }

  /**
   * Associating getProfilePhoto function to MiniAppBridge object.
   * This function returns username from the user profile.
   * (provided the rakuten.miniapp.user.PROFILE_PHOTO is allowed by the user)
   * It returns error info if user had denied the custom permission
   */
  getProfilePhoto(): Promise<string> {
    return getBridge().sendToNative(USERINFO.GET_PROFILE_PHOTO, null);
  }

  /**
   * Associating getContacts function to MiniAppBridge object.
   * This function returns contact list from the user profile.
   * (provided the rakuten.miniapp.user.CONTACT_LIST is allowed by the user)
   * It returns error info if user had denied the custom permission
   */
  async getContacts(): Promise<Contact[]> {
    try {
      getBridge()
        .sendToNative(USERINFO.GET_CONTACTS, {
          isContactsEncodingRequired: true,
        })
        .then(contacts => {
          const contactList: Contact[] = JSON.parse(contacts) as Contact[];
          const decoder = new DecodeManager();
          return decoder.decodeContacts(contactList);
        })
        .catch(error => error);
    } catch (error) {
      console.error(`Error retrieving contacts: ${error.message}`);
      return [];
    }
  }

  /**
   * Associating getAccessToken function to MiniAppBridge object.
   * This function returns access token details from the host app.
   * (provided the rakuten.miniapp.user.ACCESS_TOKEN is allowed by the user)
   * It returns error info if user had denied the custom permission
   * @param {string} audience the audience the MiniApp requests for the token
   * @param {string[]} scopes the associated scopes with the requested audience
   */
  async getAccessToken(
    audience: string,
    scopes: string[]
  ): Promise<AccessTokenData | MiniAppError> {
    try {
      const tokenData = await getBridge().sendToNative(
        USERINFO.GET_ACCESS_TOKEN,
        {
          audience,
          scopes,
        }
      );
      const nativeTokenData = JSON.parse(tokenData) as NativeTokenData;
      return new AccessTokenData(nativeTokenData);
    } catch (error) {
      return parseMiniAppError(error);
    }
  }

  /**
   * Associating get point balance function to MiniAppBridge object.
   * (provided rakuten.miniapp.user.POINTS is allowed by the user)
   */
  async getPoints(): Promise<Points | MiniAppError> {
    try {
      const points = await getBridge().sendToNative(USERINFO.GET_POINT, null);
      return JSON.parse(points) as Points;
    } catch (error) {
      return parseMiniAppError(error);
    }
  }

  /**
   * Associating getPhoneNumber function to MiniAppBridge object.
   * This function returns phone number of the User
   */
  getPhoneNumber(): Promise<string> {
    return getBridge().sendToNative(USERINFO.GET_PHONE_NUMBER, null);
  }

  /**
   * This interface is used to know if the user login status
   * @returns true/false based on the user profile status
   */
  isLoggedIn(): Promise<boolean> {
    return getBridge().sendToNative(USERINFO.IS_LOGGED_IN, null);
  }
}
