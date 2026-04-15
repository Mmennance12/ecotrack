import { Outlet } from "react-router-dom";

function RecyclerLayout() {
  return (
    <div className="min-h-screen bg-green-50">
      <Outlet />
    </div>
  );
}

export default RecyclerLayout;