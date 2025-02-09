import { ChangeEvent } from 'react';

type FormElement = HTMLInputElement | HTMLTextAreaElement;

const createChangeHandler = <T>(setState: React.Dispatch<React.SetStateAction<T>>) => {
  return (e: ChangeEvent<FormElement>) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      [name]: value
    }));
  };
};

export default createChangeHandler