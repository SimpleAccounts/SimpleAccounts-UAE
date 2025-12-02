import React from 'react'

import { Provider } from 'react-redux'
import { createBrowserHistory } from 'history'
import { Router, Route, Switch } from 'react-router-dom'

import { mainRoutes } from 'routes'
import { configureStore } from 'services'
import { Loading } from 'components'

import 'app.scss'

const hist = createBrowserHistory()
const store = configureStore()

export default class App extends React.Component {

  render () {
    return (
      <Provider store={store}>
        <Router history={hist}>
          <React.Suspense fallback={Loading()}>
            <Switch>
              {
                mainRoutes.map((prop, key) => {
                  return <Route path={prop.path} key={key} component={prop.component} />
                })
              }
            </Switch>
          </React.Suspense>
        </Router>
      </Provider>
    )
  }

}

