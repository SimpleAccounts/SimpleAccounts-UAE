import React from 'react'

import { motion } from 'framer-motion/dist/framer-motion'
//
import { alpha, styled, useTheme } from '@mui/material/styles';
import { Box, GlobalStyles } from '@mui/material';
const loaderImage = require('assets/images/brand/loader-gif.gif')
// const loaderImage = require('assets/images/settings/thumbnail.png');
// const newloaderImage = require('assets/images/settings/thumbnail.png');
const oldloaderImage = require('assets/images/brand/loader-gif.gif')
export default function Loader({loadingMsg,NextloadingMsg}) {
  return (

    //   <div className="sk-double-bounce loader">
    //   <img
    //     src={loader}
    //     style={{height:'100px'}}
    //     alt=''
    //   ></img>
    // </div>
    <div style={{ marginTop: "18%" }}>

      <div className='mt-5' style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }} >
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 360 }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            repeatDelay: 1,
            repeat: Infinity
          }}
        >
          <img style={{ width: 200, height: 84 }} src={oldloaderImage} alt="logo" />
          {/* <img style={{ width: 64, height: 64 }} src={newloaderImage} alt="logo" /> */}
        </motion.div>

        <Box
          component={motion.div}
          animate={{
            scale: [1.2, 1, 1, 1.2, 1.2],
            rotate: [270, 0, 0, 270, 270],
            opacity: [0.25, 1, 1, 1, 0.25],
            borderRadius: ['25%', '25%', '50%', '50%', '25%']
          }}
          transition={{ ease: 'linear', duration: 3.2, repeat: Infinity }}
          sx={{
            width: 100,
            height: 100,
            borderRadius: '25%',
            position: 'absolute',
            border: (theme) => `solid 3px ${alpha(theme.palette.primary.dark, 0.24)}`
          }}
        />

        <Box
          component={motion.div}
          animate={{
            scale: [1, 1.2, 1.2, 1, 1],
            rotate: [0, 270, 270, 0, 0],
            opacity: [1, 0.25, 0.25, 0.25, 1],
            borderRadius: ['25%', '25%', '50%', '50%', '25%']
          }}
          transition={{
            ease: 'linear',
            duration: 3.2,
            repeat: Infinity
          }}
          sx={{
            width: 120,
            height: 120,
            borderRadius: '25%',
            position: 'absolute',
            border: (theme) => `solid 8px ${alpha(theme.palette.primary.dark, 0.24)}`
          }}
        />
      </div>
      <div className='text-center mt-5'
           style={{color:"#2064d8"}}>
   <b>
      {loadingMsg ? loadingMsg:"Loading..."}<br/>
      {NextloadingMsg ? NextloadingMsg:""}
   </b></div>
    </div>

  )
}