import { CLEAR_USER, SET_CURRENT_CHANNEL,SET_PRIVATE_CHANNEL, SET_USER, SET_USER_POSTS } from './types';

export const setUser = (user) => ({
    type: SET_USER,
    payload: {
        currentUser: user,
    }
});

export const clearUser = () => ({
    type: CLEAR_USER,
})


export const setCurrentChannel = (channel, source) => ({
    type: SET_CURRENT_CHANNEL,
    payload: {
        currentChannel: channel,
        activeSource: source
    }
})

export const setPrivateChannel = isPrivateChannel => ({
    type: SET_PRIVATE_CHANNEL,
    payload: {
        isPrivateChannel
    }
});

export const setUserPosts = userPosts => ({
    type: SET_USER_POSTS,
    payload: {
        userPosts
    }
});



