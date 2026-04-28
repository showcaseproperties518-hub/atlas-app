import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type OutboundClickRow = {
  id: string;
  timestamp: string;
  category: string;
  provider: string;
  label: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  flight_origin: string | null;
  stay_type: string | null;
  transport_type: string | null;
  budget: string | null;
  travelers: string | null;
  trip_style: string | null;
  target_url: string;
};

function countBy(items: string[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = item || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function sortEntries(record: Record<string, number>) {
  return Object.entries(record).sort((a, b) => b[1] - a[1]);
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-neutral-900">{value}</p>
      {subtitle ? <p className="mt-2 text-sm text-neutral-500">{subtitle}</p> : null}
    </div>
  );
}

function ListCard({
  title,
  items,
}: {
  title: string;
  items: Array<[string, number]>;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">{title}</p>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-500">No data yet</p>
        ) : (
          items.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <span className="text-sm text-neutral-700">{label}</span>
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-900">
                {value}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default async function BookingAdminPage() {
  const { data, error } = await supabase
    .from("outbound_clicks")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <main className="min-h-screen bg-[#f6f1e8] p-6 text-neutral-900">
        <div className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Error loading data</h1>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error.message}
          </pre>
        </div>
      </main>
    );
  }

  const rows = (data || []) as OutboundClickRow[];

  const totalClicks = rows.length;
  const providerCounts = sortEntries(countBy(rows.map((row) => row.provider)));
  const categoryCounts = sortEntries(countBy(rows.map((row) => row.category)));
  const destinationCounts = sortEntries(
    countBy(rows.map((row) => row.destination || "Unknown"))
  ).slice(0, 8);
  const labelCounts = sortEntries(countBy(rows.map((row) => row.label))).slice(0, 8);

  const stayClicks = rows.filter((row) => row.category === "stay").length;
  const flightClicks = rows.filter((row) => row.category === "flight").length;
  const transportClicks = rows.filter((row) => row.category === "transport").length;

  return (
    <main className="min-h-screen bg-[#f6f1e8] text-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">
            Internal admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Atlas Booking Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Live view of outbound booking behavior. This is the first layer of Atlas learning what
            people actually click.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total clicks"
            value={totalClicks}
            subtitle="All tracked outbound booking actions"
          />
          <StatCard
            title="Flight clicks"
            value={flightClicks}
            subtitle="Outbound flight intent"
          />
          <StatCard
            title="Stay clicks"
            value={stayClicks}
            subtitle="Outbound hotel / Airbnb intent"
          />
          <StatCard
            title="Transport clicks"
            value={transportClicks}
            subtitle="Outbound rental / movement intent"
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <ListCard title="Top providers" items={providerCounts.slice(0, 8)} />
          <ListCard title="By category" items={categoryCounts} />
          <ListCard title="Top destinations" items={destinationCounts} />
          <ListCard title="Top CTA labels" items={labelCounts} />
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                Recent outbound clicks
              </p>
              <h2 className="mt-1 text-xl font-semibold">Latest click activity</h2>
            </div>
            <p className="text-sm text-neutral-500">Showing up to {rows.length} most recent rows</p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left">
                  <th className="border-b border-neutral-200 px-3 py-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                    Time
                  </th>
                  <th className="border-b border-neutral-200 px-3 py-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                    Category
                  </th>
                  <th className="border-b border-neutral-200 px-3 py-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                    Provider
                  </th>
                  <th className="border-b border-neutral-200 px-3 py-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                    Destination
                  </th>
                  <th className="border-b border-neutral-200 px-3 py-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                    Label
                  </th>
                  <th className="border-b border-neutral-200 px-3 py-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                    Travelers
                  </th>
                  <th className="border-b border-neutral-200 px-3 py-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                    Budget
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-8 text-center text-sm text-neutral-500"
                    >
                      No outbound clicks yet. Click a few booking buttons from the results page and
                      come back here.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td className="border-b border-neutral-100 px-3 py-3 text-sm text-neutral-700">
                        {new Date(row.timestamp).toLocaleString()}
                      </td>
                      <td className="border-b border-neutral-100 px-3 py-3">
                        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-800">
                          {row.category}
                        </span>
                      </td>
                      <td className="border-b border-neutral-100 px-3 py-3 text-sm text-neutral-700">
                        {row.provider}
                      </td>
                      <td className="border-b border-neutral-100 px-3 py-3 text-sm text-neutral-700">
                        {row.destination || "—"}
                      </td>
                      <td className="border-b border-neutral-100 px-3 py-3 text-sm text-neutral-700">
                        {row.label}
                      </td>
                      <td className="border-b border-neutral-100 px-3 py-3 text-sm text-neutral-700">
                        {row.travelers || "—"}
                      </td>
                      <td className="border-b border-neutral-100 px-3 py-3 text-sm text-neutral-700">
                        {row.budget || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}