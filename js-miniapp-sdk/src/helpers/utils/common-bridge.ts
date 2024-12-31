function isValidJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function convertUnicodeCharacters(value) {
  //This will decode the message string that is sent from Native
  const decoded = Buffer.from(value, 'base64').toString('utf8');
  //Few characters like currency, etc., is not decoded properly,
  // We use following method to decoded it.
  const octalString = decodeOctalEscape(decoded);
  const stringifyMessage = JSON.stringify(octalString);
  const replaced = stringifyMessage.replace(/\\\\/g, '\\');
  if (isValidJson(replaced) === true) {
    return JSON.parse(replaced);
  } else {
    return JSON.parse(stringifyMessage);
  }
}

const decodeOctalEscape = input =>
  input.replace(/\\(\d{3})/g, (match, octalCode) => {
    return String.fromCharCode(parseIntOctal(octalCode));
  });

const parseIntOctal = octalCode => {
  return Number.parseInt(octalCode, 8);
};

function convertUnicodeCharactersForAndroid(value) {
  //This will decode the message string that is sent from Native
  const decoded = Buffer.from(value, 'base64').toString('utf8');
  const stringifyMessage = JSON.stringify(decoded);
  const replaced = stringifyMessage.replace(/\\\\/g, '\\');
  if (isValidJson(stringifyMessage) === true) {
    return JSON.parse(stringifyMessage);
  } else {
    return JSON.parse(replaced);
  }
}

export { convertUnicodeCharacters, convertUnicodeCharactersForAndroid };
