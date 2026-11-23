function DashboardCard({ title, count }) {
  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">
          {title}
        </p>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
          ✚
        </div>
      </div>

      <h2 className="mt-5 text-4xl font-bold tracking-tight text-slate-900">
        {count}
      </h2>

      <p className="mt-3 text-xs text-slate-400">
        Hospital statistics
      </p>
    </div>
  );
}

export default DashboardCard;