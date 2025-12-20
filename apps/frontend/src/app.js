import React from 'react'

import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { mainRoutes } from 'routes'
import { configureStore } from 'services'
import { RouteLoading } from 'components'
import LazyLoadErrorBoundary from 'components/error-boundary/LazyLoadErrorBoundary'

import './app.scss'

const store = configureStore()

export default class App extends React.Component {

  render () {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <LazyLoadErrorBoundary>
            <React.Suspense fallback={<RouteLoading />}>
              <Routes>
                {
                  mainRoutes.map((prop, key) => {
                    return <Route path={prop.path} key={key} element={<prop.component />} />
                  })
                }
              </Routes>
            </React.Suspense>
          </LazyLoadErrorBoundary>
        </BrowserRouter>
      </Provider>
    )
  }

}

