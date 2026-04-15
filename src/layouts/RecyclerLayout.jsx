import { Outlet } from "react-router-dom";
import RecyclerHeader from "../components/recycler/RecyclerHeader";
import RecyclerSidebar from "../components/recycler/RecyclerSidebar";

function RecyclerLayout() {
  return (
    <div className="h-screen flex overflow-hidden bg-green-50">
      
      {/* SIDEBAR */}
      <RecyclerSidebar />

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <RecyclerHeader />

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}

export default RecyclerLayout;