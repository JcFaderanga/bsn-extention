import React from 'react'
import { FaRegUser } from "react-icons/fa";


// const Card =()=>{

//   return(

//   )
// }


const Menu = ({ setSubtab }) => {
  return (
    <section className='grid grid-cols-3 gap-4'>
      <div
        className="p-4 bg-white rounded shadow w-full cursor-pointer flex items-center justify-center flex-col"
        onClick={() => setSubtab('userLogins')}
      >
        <FaRegUser size={24} />
        <span className="mt-2 text-center text-sm">Login</span>
      </div>

      {/* <div
        className="p-4 bg-white rounded shadow w-full cursor-pointer flex items-center justify-center flex-col"
        onClick={() => setSubtab('annotator')}
      >
        <FaRegUser size={24} />
        <span className="mt-2 text-center text-sm">Annotator</span>
      </div> */}

      <div
        className="p-4 bg-white rounded shadow w-full cursor-pointer flex items-center justify-center flex-col"
        onClick={() => setSubtab('charlength')}
      >
        <FaRegUser size={24} />
        <span className="mt-2 text-center text-sm">255 Char</span>
      </div>

      <div
        className="p-4 bg-white rounded shadow w-full cursor-pointer flex items-center justify-center flex-col"
        onClick={() => setSubtab('taskTrack')}
      >
        <FaRegUser size={24} />
        <span className="mt-2 text-center text-sm">Task Track</span>
      </div>

    <div
        className="p-4 bg-white rounded shadow w-full cursor-pointer flex items-center justify-center flex-col"
        onClick={() => setSubtab('getToken')}
      >
        <FaRegUser size={24} />
        <span className="mt-2 text-center text-sm">Get Token</span>
      </div>

      <div
        className="p-4 bg-white rounded shadow w-full cursor-pointer flex items-center justify-center flex-col"
        onClick={() => setSubtab('GenerateToken')}
      >
        <FaRegUser size={24} />
        <span className="mt-2 text-center text-sm">Generate Token</span>
      </div>
      
    </section>
  )
}

export default Menu