import { CLEAR_USER, SET_CURRENT_CHANNEL, SET_USER } from './types';

export const setUser = (user) => ({
    type: SET_USER,
    payload: {
        currentUser: user,
    }
});

export const clearUser = () => ({
    type: CLEAR_USER,
})


export const setCurrentChannel = channel => ({
    type: SET_CURRENT_CHANNEL,
    payload: {
        currentChannel: channel
    }
})


