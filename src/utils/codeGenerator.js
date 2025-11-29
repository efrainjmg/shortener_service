import { nanoid } from 'nanoid';

export const generateShortCode = (size = 6) => {
    return nanoid(size);
};
