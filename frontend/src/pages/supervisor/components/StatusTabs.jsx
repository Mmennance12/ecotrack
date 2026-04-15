const tabs = ["pending", "verified", "assigned", "rejected"];

function StatusTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex gap-2 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-3 py-1 rounded ${
            activeTab === tab
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default StatusTabs;