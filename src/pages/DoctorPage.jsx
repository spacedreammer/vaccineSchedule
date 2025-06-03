import React from 'react'

const DoctorPage = () => {
  return (
    <>
   <div>
    <div className='grid grid-cols-3 mt-8'>
        {/* leftside */}
        <div className='mx-0 '>left side</div>

        {/* middle */}
        <div className='bg-gradient-to-r from-cyan-200 to-blue-300 w-[13cm] rounded h-14'>
            <h1 className=''>Middle part</h1>
        </div>

        {/* rightside */}
        <div>Right side</div>
    </div>
   </div>
    </>
  )
}

export default DoctorPage