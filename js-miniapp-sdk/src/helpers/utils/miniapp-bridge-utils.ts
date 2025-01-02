export class MiniAppBridgeUtils {
  static BooleanValue(value) {
    if (typeof value === 'boolean') {
      return value;
    } else if (typeof value === 'string') {
      const lowerCaseValue = value.toLowerCase();
      if (lowerCaseValue === 'true' || lowerCaseValue === '1') {
        return true;
      } else if (lowerCaseValue === 'false' || lowerCaseValue === '0') {
        return false;
      }
    }
    return false;
  }
}
