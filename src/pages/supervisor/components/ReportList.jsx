function ReportList({ reports, onSelect, selected }) {
  if (reports.length === 0) {
    return <p className="text-gray-500">No reports</p>;
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => {
        const isActive = selected?._id === report._id;

        return (
          <div
            key={report._id}
            onClick={() => onSelect(report)}
            className={`
              p-4 rounded-xl cursor-pointer transition-all duration-300
              ${isActive 
                ? "bg-green-100 border-l-4 border-green-600 shadow-md" 
                : "bg-white hover:bg-green-50 hover:shadow-md"
              }
            `}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">
                {report.wasteType}
              </h3>

              <span className="text-xs px-2 py-1 rounded-full bg-gray-200">
                {report.status}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              {report.location?.address}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default ReportList;