import React from 'react'
import {
  FaRegUser,
  FaKey,
  FaUserShield,
  FaClipboardList,
  FaDatabase,
  FaCheckCircle,
} from "react-icons/fa";
import { IoIosTv } from "react-icons/io";
import { TbDeviceTvFilled } from "react-icons/tb";
import { FaUserAlt } from "react-icons/fa";

const Card = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className=" group w-full rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1
        hover:shadow-lg hover:border-blue-400 active:scale-[0.98] flex flex-col items-center justify-center gap-1 min-h-24">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all duration-200 group-hover:bg-blue-100 group-hover:scale-110">
        {icon}
      </div>

      <span className="text-xs font-medium text-gray-700 text-center leading-tight">
        {label}
      </span>
    </button>
  );
};

const MenuMaskMode = ({ setSubtab }) => {
  const menus = [
    {
      label: "User Info",
      key: "UserInfo",
      icon: <FaUserAlt size={15} />,
    },
  ];

  return (
    <section className="grid grid-cols-3 gap-4 md:grid-cols-3">
      {menus.map((menu) => (
        <Card
          key={menu.key}
          icon={menu.icon}
          label={menu.label}
          onClick={() => setSubtab(menu.key)}
        />
      ))}
    </section>
  );
};

export default MenuMaskMode;