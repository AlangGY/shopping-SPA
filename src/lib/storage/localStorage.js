const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(e);
  }
};

const getItem = (key, defaultValue) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (!value) return defaultValue;
    return value;
  } catch (e) {
    console.error(e);
    return defaultValue;
  }
};

const clearItem = (key) => {
  localStorage.removeItem(key);
};

export default { setItem, getItem, clearItem };
