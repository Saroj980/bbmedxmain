
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function StaffDashboard() {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<null | any>(null);

  useEffect(() => {
    let mounted = true;
    api.get("/staff")
      .then((res) => {
        if (mounted) setStaff(res.data);
      })
      .catch((e) => {
        console.error("Failed to fetch staff:", e);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold">Staff Dashboard</h1>
      {staff ? (
        <pre className="mt-4">{JSON.stringify(staff, null, 2)}</pre>
      ) : (
        <p className="mt-4">No staff data available.</p>
      )}
    </div>
  );
}
