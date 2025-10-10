import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png"
import {
  Home,
  Dumbbell,
  Target,
  BarChart3,
  Apple,
  User,
} from "lucide-react";

const Sidebar = () => {
  const navItems = [
    { to: "/dashboard", icon: <Home size={22} />, label: "Dashboard" },
    { to: "/workout", icon: <Dumbbell size={22} />, label: "Workout" },
    { to: "/progress", icon: <BarChart3 size={22} />, label: "Progress" },
    { to: "/goals", icon: <Target size={22} />, label: "Goals" },
    { to: "/nutrition", icon: <Apple size={22} />, label: "Nutrition" },
    { to: "/profile", icon: <User size={22} />, label: "Profile" },
  ];

  return (
    <div className="fixed top-0 left-0 h-full w-16 sm:w-20 bg-[#020540] flex flex-col items-center py-6 space-y-6">
      
      <div className="text-[#06E959] font-bold text-lg">
        <img src={logo} alt="logo" />
      </div>

      
      <div className="flex flex-col space-y-6">
        {navItems.map(({ to, icon }, i) => (
          <NavLink
            key={i}
            to={to}
            className={({ isActive }) =>
              `p-2 rounded-lg flex justify-center items-center ${
                isActive
                  ? "bg-[#06E959] text-black"
                  : "text-white hover:text-[#06E959]"
              }`
            }
          >
            {icon}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
