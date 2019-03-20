export function requireWrapper(modulePath: string) {
  // force require
  try {
    return require(modulePath);
  } catch (e) {
    console.log('requireWrapper(): The file "' + modulePath + '".js could not be loaded.');
    return false;
  }
}
