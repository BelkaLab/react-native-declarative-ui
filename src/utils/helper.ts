import { ComposableItem } from '../models/composableItem';

export function requireWrapper(modulePath: string) {
  // force require
  try {
    return require(modulePath);
  } catch (e) {
    console.log('requireWrapper(): The file "' + modulePath + '".js could not be loaded.');
    return false;
  }
}

export function isObject(obj: unknown) {
  return typeof obj === 'object';
}

export function getValueByKey(item: ComposableItem, key: string) {
  return item[key]
}
