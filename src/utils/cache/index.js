import localforage from 'localforage';

const set = (key, value) => localforage.setItem(key, value);
const get = key => localforage.getItem(key);
const remove = key => localforage.removeItem(key);
const clear = () => localforage.clear();
const length = () => localforage.length();
const key = keyIndex => localforage.key(keyIndex);
const keys = () => localforage.keys();
const createInstance = options => localforage.createInstance(options);

const cache = {
  set,
  get,
  remove,
  clear,
  length,
  key,
  keys,
  createInstance
};

export default cache;
