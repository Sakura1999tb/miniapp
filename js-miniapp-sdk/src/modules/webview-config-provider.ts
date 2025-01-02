import { WEBCONFIG } from '../event-types';
import { MiniAppBridgeUtils } from '../helpers/utils/miniapp-bridge-utils';
import { getBridge } from '../sdkbridge';

/**
 * Interface representing a provider for WebView configuration.
 */
export interface WebViewConfigProvider {
  /**
   * Allows or disallows back and forward navigation gestures in the WebView.
   * @param shouldAllow - A boolean indicating whether the gestures should be allowed.
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
  allowBackForwardNavigationGestures(shouldAllow: boolean): Promise<boolean>;
}

/**
 * Class implementing the WebViewConfigProvider interface to manage WebView configurations.
 */
export class WebviewManager implements WebViewConfigProvider {
  /**
   * Allows or disallows back and forward navigation gestures in the WebView.
   * @param shouldAllow - A boolean indicating whether the gestures should be allowed.
   * @returns A promise that resolves to a boolean indicating the success of the operation.
   */
  allowBackForwardNavigationGestures(shouldAllow: boolean): Promise<boolean> {
    return getBridge()
      .sendToNative(WEBCONFIG.ALLOW_BACK_FORWARD_NAVIGATION_GESTURES, {
        shouldAllowNavigationGestures: shouldAllow,
      })
      .then(response => MiniAppBridgeUtils.BooleanValue(response))
      .catch(error => error);
  }
}
