import { MiniAppError } from '../../../js-miniapp-bridge/src';
import { getBridge } from '../sdkbridge';
import { MiniAppEvents, SECURE_STORAGE } from '../event-types/index';
import {
  MiniAppSecureStorageKeyValues,
  MiniAppSecureStorageSize,
  MiniAppSecureStorageEvents,
} from '../../../js-miniapp-bridge/src/types/secure-storage';
import { parseMiniAppError } from '../../../js-miniapp-bridge/src/types/error-types';

interface SecureStorageProvider {
  setItems(items: MiniAppSecureStorageKeyValues): Promise<undefined>;

  getItem(key: string): Promise<string>;

  removeItems(key: [string]): Promise<undefined>;

  clear(): Promise<undefined>;

  size(): Promise<MiniAppSecureStorageSize>;

  onReady(): Promise<string>;

  onLoadError(): Promise<string>;
}

/** @internal */
export class SecureStorageService {
  setItems(
    items: MiniAppSecureStorageKeyValues
  ): Promise<boolean | MiniAppError> {
    return getBridge()
      .sendToNative(SECURE_STORAGE.SET_SECURE_STORAGE_ITEM, {
        secureStorageItems: items,
      })
      .then(response => {
        return true;
      })
      .catch(error => parseMiniAppError(error));
  }

  getItem(key: string): Promise<string> {
    return getBridge()
      .sendToNative(SECURE_STORAGE.GET_SECURE_STORAGE_ITEM, {
        secureStorageKey: key,
      })
      .then(responseData => responseData)
      .catch(error => parseMiniAppError(error));
  }

  removeItems(key: [string]): Promise<undefined> {
    return getBridge()
      .sendToNative(SECURE_STORAGE.REMOVE_SECURE_STORAGE_ITEM, {
        secureStorageKeyList: key,
      })
      .then(responseData => responseData)
      .catch(error => parseMiniAppError(error));
  }

  clear(): Promise<undefined> {
    return getBridge()
      .sendToNative(SECURE_STORAGE.CLEAR_SECURE_STORAGE, null)
      .then(responseData => responseData)
      .catch(error => parseMiniAppError(error));
  }

  size(): Promise<MiniAppSecureStorageSize | MiniAppError> {
    return getBridge()
      .sendToNative(SECURE_STORAGE.GET_SECURE_STORAGE_SIZE, null)
      .then(
        responseData => JSON.parse(responseData) as MiniAppSecureStorageSize
      )
      .catch(error => parseMiniAppError(error));
  }

  onReady(onReady: () => void) {
    if (getBridge().isSecureStorageReady) {
      onReady();
    } else {
      window.addEventListener(MiniAppSecureStorageEvents.onReady, () => {
        onReady();
      });
    }
  }

  onLoadError(onLoadError: (error: MiniAppError) => void) {
    if (getBridge().secureStorageLoadError) {
      onLoadError(getBridge().secureStorageLoadError);
    } else {
      window.addEventListener(
        MiniAppSecureStorageEvents.onLoadError,
        (e: CustomEvent) => {
          onLoadError(parseMiniAppError(e.detail.message));
        }
      );
    }
  }
}
