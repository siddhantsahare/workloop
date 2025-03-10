import { CLEAR_USER, SET_USER } from './types';

export const setUser = (user) => ({
    type: SET_USER,
    payload: {
        currentUser: user,
    }
});

export const clearUser = () => ({
    type: CLEAR_USER,
})


