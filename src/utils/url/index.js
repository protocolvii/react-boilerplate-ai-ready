import queryString from 'query-string';

/* eslint no-restricted-globals: 0 */
const qsGet = (name, type, defaultVal, qsObj) => {
  const qs = qsObj || queryString.parse(location.search);
  let val = qs[name] !== undefined ? qs[name] : defaultVal;
  if (val === defaultVal) return val;
  switch (type) {
    case 'string':
      val = `${val}`;
      break;
    case 'int':
      val = parseInt(val, 10);
      break;
    case 'pint': // 正整数
      val = parseInt(val, 10);
      if (!Number.isNaN(val) && val < 0) val = defaultVal;
      break;
    case 'float':
      val = parseFloat(val);
      break;
    default:
  }
  if ((type === 'int' || type === 'pint' || type === 'float') && Number.isNaN(val)) return defaultVal;
  return val;
};

const url = {
  qsGet
};

export default url;
