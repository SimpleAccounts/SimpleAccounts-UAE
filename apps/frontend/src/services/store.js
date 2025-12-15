import { configureStore as rtkConfigureStore } from '@reduxjs/toolkit'
import rootReducer from './reducer'

export default function configureStore(initialState = {}) {
  return rtkConfigureStore({
    reducer: rootReducer,
    preloadedState: initialState,
    devTools: process.env.NODE_ENV !== 'production',
  })
}