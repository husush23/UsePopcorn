import {useState, useEffect} from 'react';

export function useLocalStorage(initialState, key) {
  const [value, setValue] = useState(() =>
    JSON.parse(localStorage.getItem(key))
  );

  useEffect(() => {
    localStorage.setItem('watched', JSON.stringify(value));
  }, [value, key]);

  return {value, setValue};
}
