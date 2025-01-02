import {
  Reward,
  DevicePermission,
  CustomPermission,
  CustomPermissionName,
  CustomPermissionResult,
  CustomPermissionStatus,
  ShareInfo,
  ScreenOrientation,
  Points,
  DownloadFileHeaders,
  HostEnvironmentInfo,
  CloseAlertInfo,
  Platform as HostPlatform,
} from '../../js-miniapp-bridge/src';
import { UserInfoProvider, UserInfo } from './modules/user-info';
import { ChatService } from './modules/chat-service';
import { getBridge } from './sdkbridge';
import { SecureStorageService } from './modules/secure-storage';
import { UniversalBridge } from './modules/universal-bridge';
import { MiniAppUtils } from './modules/utils';
import { Purchases } from './modules/in-app-purchase';
import { CookieManager } from './modules/cookie-manager';
import { BridgeInfoConverter } from './modules/bridge-info-converter';
import { MiniAppPreference } from './modules/miniapp-preferences';
import { GalleryBridge } from './modules/gallery-manager';
import { ShareInfoType } from './types/share-info';
import { WebviewManager } from './modules/webview-config-provider';
import { CommonEvents } from './event-types';
import { AdTypes } from './types/ad-types';
import { parseMiniAppError } from './types/error-types';

/**
 * A module layer for webapps and mobile native interaction.
 */
interface MiniAppFeatures {
  /**
   * @deprecated
   * Use `getMessagingUniqueId` or `getMauid` instead
   * Request the mini app's unique id from the host app.
   * @returns The Promise of provided id of mini app from injected side.
   *
   */
  getUniqueId(): Promise<string>;

  /**
   * Request the mini app's messaging unique id from the host app.
   * @returns The Promise of provided id of mini app from injected side.
   */
  getMessagingUniqueId(): Promise<string>;

  /**
   * Request the mini app's mauid from the host app.
   * @returns The Promise of provided id of mini app from injected side.
   */
  getMauid(): Promise<string>;

  /**
   * Request the location permission from the host app.
   * You must call this before using `navigator.geolocation`.
   * This will request both the Android/iOS device permission for location (if not yet granted to the host app),
   * and the custom permission for location {@link CustomPermissionName.LOCATION}.
   * @param permissionDescription Description of location permission.
   * @returns The Promise of permission result of mini app from injected side.
   * Rejects the promise if the user denied the location permission (either the device permission or custom permission).
   */
  requestLocationPermission(permissionDescription?: string): Promise<string>;

  /**
   *
   * Request that the user grant custom permissions related to accessing user data.
   * Typically, this will show a dialog in the Host App asking the user grant access to your Mini App.
   * You can pass multiple permissions at once and the Host App will request all of those permissions within a single dialog.
   *
   * @param permissions An array containing CustomPermission objects - permission name and description
   * @returns Promise with the custom permission results - "ALLOWED" or "DENIED" for each permission
   */
  requestCustomPermissions(
    permissions: CustomPermission[]
  ): Promise<CustomPermissionResult[]>;

  /**
   * Share text and image with another App or with the host app.
   * @param info The shared data must match the property in [ShareInfoType].
   * @returns The Promise of share info action state from injected side.
   */
  shareInfo(info: ShareInfoType): Promise<string>;

  /**
   * Swap and lock the screen orientation.
   * There is no guarantee that all hostapps and devices allow the force screen change so MiniApp should not rely on this.
   * @param screenOrientation The action that miniapp wants to request on device.
   * @returns The Promise of screen action state from injected side.
   */
  setScreenOrientation(screenOrientation: ScreenOrientation): Promise<string>;

  /**
   * Request the point balance from the host app.
   * @returns Promise of the provided point balance from mini app.
   */
  getPoints(): Promise<Points>;

  /**
   * Request the host environment information.
   * @returns Promise of the provided environment info from mini app.
   */
  getHostEnvironmentInfo(): Promise<HostEnvironmentInfo>;

  /**
   * Request to download a file and save to the user's device.
   * @returns Promise of the downloaded files name. Response will be `null` in case the user cancelled the download.
   * Can be rejected with {@link MiniAppError}, {@link DownloadFailedError}, {@link DownloadHttpError}, {@link InvalidUrlError}, or {@link SaveFailureError}.
   */
  downloadFile(
    filename: string,
    url: string,
    headers?: DownloadFileHeaders
  ): Promise<string>;

  /**
   * Mini App can choose whether to display Close confirmation alert dialog when mini app is closed
   */
  setCloseAlert(alertInfo: CloseAlertInfo): Promise<string>;
}

/**
 * A contract declaring the interaction mechanism between mini-apps and native host app to display ads.
 */
interface Ad {
  /**
   * Loads the specified Interstittial Ad Unit ID.
   * Can be called multiple times to pre-load multiple ads.
   * Promise is resolved when successfully loaded.
   * @returns The Promise of load success response.
   * Promise is rejected if failed to load.
   */
  loadInterstitialAd(id: string): Promise<string>;

  /**
   * Loads the specified Rewarded Ad Unit ID.
   * Can be called multiple times to pre-load multiple ads.
   * Promise is resolved when successfully loaded.
   * @returns The Promise of load success response.
   * Promise is rejected if failed to load.
   */
  loadRewardedAd(id: string): Promise<string>;

  /**
   * Shows the Interstitial Ad for the specified ID.
   * Promise is resolved after the user closes the Ad.
   * @returns The Promise of close success response.
   * Promise is rejected if the Ad failed to display wasn't loaded first using MiniApp.loadInterstitialAd.
   */
  showInterstitialAd(id: string): Promise<string>;

  /**
   * Shows the Rewarded Ad for the specified ID.
   * Promise is resolved with an object after the user closes the Ad. The object contains the reward earned by the user.
   * Reward will be null if the user did not earn the reward.
   * @returns The Promise of Rewarded ad response result from injected side.
   * Promise is rejected if the Ad failed to display wasn't loaded first using MiniApp.loadRewardedAds.
   */
  showRewardedAd(id: string): Promise<Reward>;
}

interface Platform {
  /**
   * Detect which platform your mini app is running on.
   * @returns `Android`, `iOS`, or `Unknown`
   */
  getPlatform(): string;
}

export class MiniApp implements MiniAppFeatures, Ad, Platform {
  user: UserInfoProvider = new UserInfo();
  chatService: ChatService = new ChatService();
  secureStorageService: SecureStorageService = new SecureStorageService();
  universalBridge: UniversalBridge = new UniversalBridge();
  miniappUtils: MiniAppUtils = new MiniAppUtils();
  purchaseService: Purchases = new Purchases();
  cookieManager: CookieManager = new CookieManager();
  preferences: MiniAppPreference = new MiniAppPreference();
  galleryManager: GalleryBridge = new GalleryBridge();
  webviewManager: WebviewManager = new WebviewManager();

  private requestPermission(permissionType: DevicePermission): Promise<string> {
    return getBridge().sendToNative(CommonEvents.REQUEST_PERMISSION, {
      permission: permissionType,
    });
  }

  /**
   * @deprecated Deprecated method for getting the uniqueId use `getMessagingUniqueId` or `getMauid` instead
   */
  /**
   * Deprecated method for associating getUniqueId function to MiniAppBridge object.
   * Use `getMessagingUniqueId` or `getMauid` instead
   */
  getUniqueId(): Promise<string> {
    return getBridge().sendToNative(CommonEvents.GET_UNIQUE_ID, null);
  }

  /**
   * Associating getMessagingUniqueId function to MiniAppBridge object.
   */
  getMessagingUniqueId(): Promise<string> {
    return getBridge().sendToNative(CommonEvents.GET_UNIQUE_ID, null);
  }

  /**
   * Associating getMauid function to MiniAppBridge object.
   */
  getMauid(): Promise<string> {
    return getBridge().sendToNative(CommonEvents.GET_MAU_ID, null);
  }

  requestLocationPermission(permissionDescription = ''): Promise<string> {
    const locationPermission = [
      {
        name: CustomPermissionName.LOCATION,
        description: permissionDescription,
      },
    ];

    return this.requestCustomPermissions(locationPermission)
      .then(permission =>
        permission.find(
          result =>
            result.status === CustomPermissionStatus.ALLOWED ||
            // Case where older Android SDK doesn't support the Location custom permission
            result.status === CustomPermissionStatus.PERMISSION_NOT_AVAILABLE
        )
      )
      .catch(error =>
        // Case where older iOS SDK doesn't support the Location custom permission
        typeof error === 'string' &&
        error.startsWith('invalidCustomPermissionsList')
          ? Promise.resolve(true)
          : Promise.reject(error)
      )
      .then(hasPermission =>
        hasPermission
          ? this.requestPermission(DevicePermission.LOCATION)
          : Promise.reject('User denied location permission to this mini app.')
      );
  }

  /**
   * Associating requestCustomPermissions function to MiniAppBridge object
   * @param [CustomPermissionType[] permissionTypes, Types of custom permissions that are requested
   * using an Array including the parameters eg. name, description.
   *
   * For eg., Miniapps can pass the array of valid custom permissions as following
   * [
   *  {"name":"rakuten.miniapp.user.USER_NAME", "description": "Reason to request for the custom permission"},
   *  {"name":"rakuten.miniapp.user.PROFILE_PHOTO", "description": "Reason to request for the custom permission"},
   *  {"name":"rakuten.miniapp.user.CONTACT_LIST", "description": "Reason to request for the custom permission"}
   * ]
   */
  requestCustomPermissions(
    permissions: CustomPermission[]
  ): Promise<CustomPermissionResult[]> {
    return getBridge()
      .sendToNative(CommonEvents.REQUEST_CUSTOM_PERMISSIONS, {
        permissions,
      })
      .then(permissionResult => permissionResult.permissions);
  }

  /**
   * Associating loadInterstitialAd function to MiniAppBridge object.
   * This function preloads interstitial ad before they are requested for display.
   * Can be called multiple times to pre-load multiple ads.
   * @param {string} id ad unit id of the interstitial ad that needs to be loaded.
   */
  loadInterstitialAd(id: string): Promise<string> {
    return getBridge().sendToNative(CommonEvents.LOAD_AD, {
      adType: AdTypes.INTERSTITIAL,
      adUnitId: id,
    });
  }

  /**
   * Associating loadRewardedAd function to MiniAppBridge object.
   * This function preloads Rewarded ad before they are requested for display.
   * Can be called multiple times to pre-load multiple ads.
   * @param {string} id ad unit id of the Rewarded ad that needs to be loaded.
   */
  loadRewardedAd(id: string): Promise<string> {
    return getBridge().sendToNative(CommonEvents.LOAD_AD, {
      adType: AdTypes.REWARDED,
      adUnitId: id,
    });
  }

  /**
   * Associating showInterstitialAd function to MiniAppBridge object.
   * @param {string} id ad unit id of the intertitial ad
   */
  showInterstitialAd(id: string): Promise<string> {
    return getBridge().sendToNative(CommonEvents.SHOW_AD, {
      adType: AdTypes.INTERSTITIAL,
      adUnitId: id,
    });
  }

  /**
   * Associating showRewardedAd function to MiniAppBridge object.
   * @param {string} id ad unit id of the Rewarded ad
   */
  showRewardedAd(id: string): Promise<Reward> {
    return getBridge().sendToNative(CommonEvents.SHOW_AD, {
      adType: AdTypes.REWARDED,
      adUnitId: id,
    });
  }

  /**
   * Associating shareInfo function to MiniAppBridge object.
   * This function returns the shared info action state.
   * @param {info} The shared info object.
   */
  async shareInfo(info: ShareInfoType): Promise<string> {
    const blob = await MiniAppUtils.convertBlobToNumberArray(info.imageBlob);
    const shareInfo: ShareInfo = {
      content: info.content,
      url: info.url,
      imageData: blob.length ? blob : undefined,
    };
    return await getBridge().sendToNative(CommonEvents.SHARE_INFO, shareInfo);
  }

  /**
   * Get the platform which injects this bridge.
   * @returns The platform name. It could be 'Android' or 'iOS'.
   */
  getPlatform(): string {
    let platform = 'Unknown';
    try {
      platform = getBridge().platform;
    } catch (e) {}
    return platform;
  }

  /**
   * This function does not return anything back on success.
   * @param {screenAction} The screen state that miniapp wants to set on device.
   */
  setScreenOrientation(screenOrientation: ScreenOrientation): Promise<string> {
    return getBridge().sendToNative(CommonEvents.SET_SCREEN_ORIENTATION, {
      action: screenOrientation,
    });
  }

  /**
   * Associating get point balance function to MiniAppBridge object.
   * (provided rakuten.miniapp.user.POINTS is allowed by the user)
   */
  getPoints(): Promise<Points> {
    return getBridge().sendToNative(CommonEvents.GET_POINTS, null);
  }

  async getHostEnvironmentInfo(): Promise<HostEnvironmentInfo> {
    const info = await getBridge()
      .sendToNative(CommonEvents.GET_HOST_ENVIRONMENT_INFO, null);
    info.platform = getBridge().platform as HostPlatform;
    return BridgeInfoConverter.convertJsonToPlatformInfo(info);
  }

  downloadFile(
    filename: string,
    url: string,
    headers: DownloadFileHeaders = {}
  ): Promise<string> {
    return getBridge()
      .sendToNative(CommonEvents.DOWNLOAD_FILE, {
        filename,
        url,
        headers,
      })
      .then(id => {
        if (id !== 'null' && id !== null) {
          return id;
        } else {
          return null;
        }
      })
      .catch(error => {
        return parseMiniAppError(error);
      });
  }

  /**
   * @param alertInfo Close confirmation alert info.
   * @see {setCloseAlert}
   */
  setCloseAlert(alertInfo: CloseAlertInfo): Promise<string> {
    return getBridge().sendToNative(CommonEvents.SET_CLOSE_ALERT, {
      closeAlertInfo: alertInfo,
    });
  }
}
