import { configureStore } from '@reduxjs/toolkit'
import {combineReducers} from 'redux'
import alertReducer from './alertSlice';
import userReducer from './userSlice';

const rootReducer=combineReducers({
    alerts:alertReducer,
    user:userReducer
})


const store = configureStore({
    reducer: rootReducer,
})
export default store