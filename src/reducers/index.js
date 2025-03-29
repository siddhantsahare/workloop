import { CLEAR_USER, SET_COLORS, SET_CURRENT_CHANNEL, SET_PRIVATE_CHANNEL, SET_USER, SET_USER_POSTS } from "../actions/types";
import { combineReducers } from "redux";

const initialState = {
    currentUser: null,
    isLoading: true
}
const user_reducer = (state = initialState, action) => {
    switch(action.type){
        case SET_USER: 
            return {
                currentUser: action.payload.currentUser,
                isLoading: false,
            };
        case CLEAR_USER:
            return {
                ...state, 
                isLoading: false,
            }
        default:
            return state;
    }
}

const initialChannelState = {
    currentChannel: null,
    activeSource: null,
    isPrivateChannel: false, 
    userPosts: null   
}
const channel_reducer = (state = initialChannelState, action) => {
    switch(action.type){
        case SET_CURRENT_CHANNEL: 
            return {
                ...state, 
                currentChannel: action.payload.currentChannel,
                activeSource: action.payload.activeSource,
            };
        case SET_PRIVATE_CHANNEL: 
            return {
                ...state, 
                isPrivateChannel: action.payload.isPrivateChannel,
            };
        case SET_USER_POSTS:
            return {
                ...state, 
                userPosts: action.payload.userPosts,
            }
        default:
            return state;
    }
}

const initialColorsState = {
    primaryColor: "#4c3c4c",
    secondaryColor: "#eee"
}

const colors_reducer = (state = initialColorsState, action) => {
    switch(action.type){
        case SET_COLORS:
            return {
                primaryColor: action.payload.primaryColor,
                secondaryColor: action.payload.secondaryColor
            }
        default: 
            return state;
    }
}


const rootReducer = combineReducers({
    user: user_reducer,
    channels: channel_reducer,
    colors: colors_reducer,
});

export default rootReducer; 