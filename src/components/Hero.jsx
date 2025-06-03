import React from 'react'
import banner from '../assets/images/banner.jpeg'
import banner1 from '../assets/images/banner1.jpeg'
 
const Hero = () => {
  return (
    <>
    <div className='pt-3' >
        <img src={banner1} alt="hola" className='w-full h-[10cm] object-cover'/>
    </div>
    </>
  )
}

export default Hero