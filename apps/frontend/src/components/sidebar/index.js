import React from 'react'
import Sidebar from "react-sidebar";
import './style.scss'

class SidebarComponent extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
    }

  }

  render() {

    const {
      sidebar,
      pullRight,
      sidebarOpen,
      styles
    } = this.props

    return (
      <Sidebar
        sidebar={sidebar}
        onSetOpen={this.onSetSidebarOpen}
        pullRight={pullRight}
        open={sidebarOpen}
        docked={sidebarOpen}
        styles={sidebarOpen ?
          styles ? styles : {
            sidebar: {
              background: "white",
              zIndex: "3000",
              // width: "400px",
              position: "fixed",
              top: "101px",
              left: "65%",
              boxShadow: "rgba(0, 0, 0, 0)",
              borderLeftWidth: "1px",
              borderLeftColor: "#eee",
              orderLeftStyle: "solid"
            }
          }
          : {}}
      >
        <div></div>
      </Sidebar>
    )
  }
}

export default SidebarComponent


