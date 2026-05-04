import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DriverLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 p-4 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default DriverLayout;
