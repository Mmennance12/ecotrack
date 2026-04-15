import { Outlet } from "react-router-dom";

function CitizenLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default CitizenLayout;
