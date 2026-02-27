import React from 'react'
import { FaRegUser } from "react-icons/fa";

const Menu = ({ setSubtab }) => {
  return (
    <div className="p-4 bg-white rounded shadow w-fit cursor-pointer flex items-center justify-center flex-col"
        onClick={() => setSubtab('userLogins')}>
        <FaRegUser size={24}/> <span className="ml-2">Login</span>
    </div>
  )
}

export default Menu
