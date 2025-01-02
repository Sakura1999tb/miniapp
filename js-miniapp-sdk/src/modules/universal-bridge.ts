import { UniversalBridgeInfo } from '../../../js-miniapp-bridge/src/types/universal-bridge';
import { UNIVERSAL_BRIDGE } from '../event-types';
import { getBridge } from '../sdkbridge';
import { parseMiniAppError } from '../types/error-types';

/**
 * Interfaces to communicate with Host application
 */
export interface UniversalBridgeProvider {
  /**
   * Send JSON/String information to HostApp.
   */
  sendJsonToHostapp(info: string): Promise<string>;

  /**
   * Send UniversalBridgeInfo to HostApp.
   */
  sendInfoToHostapp(info: UniversalBridgeInfo): Promise<string>;
}

/** @internal */
export class UniversalBridge implements UniversalBridgeProvider {
  /**
   * Associating sendJsonToHostapp function to MiniAppBridge object.
   * @param {info} JSON/String information that you would like to send to HostApp.
   * @see {sendJsonToHostapp}
   */
  sendJsonToHostapp(info: string): Promise<string> {
    // return getBridge().sendJsonToHostapp(info);
    return getBridge()
      .sendToNative(UNIVERSAL_BRIDGE.SEND_JSON_TO_HOST_APP, { jsonInfo: info })
      .then(success => success)
      .catch(error => parseMiniAppError(error));
  }

  /**
   * Associating sendInfoToHostapp function to MiniAppBridge object.
   * @param {info} UniversalBridgeInfo information that you would like to send to HostApp.
   * @see {sendInfoToHostapp}
   */
  sendInfoToHostapp(info: UniversalBridgeInfo): Promise<string> {
    return getBridge()
      .sendToNative(UNIVERSAL_BRIDGE.SEND_INFO_TO_HOST_APP, {
        universalBridgeInfo: info,
      })
      .then(success => success)
      .catch(error => parseMiniAppError(error));
  }
}
