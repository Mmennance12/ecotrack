import { Outlet } from "react-router-dom";

function CitizenLayout() {
  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-gray-950">
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default CitizenLayout;
