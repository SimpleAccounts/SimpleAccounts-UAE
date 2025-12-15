import React from 'react'

import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { mainRoutes } from 'routes'
import { configureStore } from 'services'
import { Loading } from 'components'

import './app.scss'

const store = configureStore()

export default class App extends React.Component {

  render () {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <React.Suspense fallback={Loading()}>
            <Routes>
              {
                mainRoutes.map((prop, key) => {
                  return <Route path={prop.path} key={key} element={<prop.component />} />
                })
              }
            </Routes>
          </React.Suspense>
        </BrowserRouter>
      </Provider>
    )
  }

}

