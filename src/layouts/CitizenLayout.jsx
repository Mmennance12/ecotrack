import { Outlet } from "react-router-dom";
import CitizenHeader from "../components/citizen/CitizenHeader";
import CitizenSidebar from "../components/citizen/CitizenSidebar";

function CitizenLayout() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <CitizenSidebar />

      <div className="flex-1 flex flex-col">
        <CitizenHeader />

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default CitizenLayout;
