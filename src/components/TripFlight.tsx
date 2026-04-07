import { useState, useEffect } from "react";

interface TripFlightProps {
  tripId: string;
}

function TripFlight({ tripId }: TripFlightProps) {
  const stored = localStorage.getItem("user_data");
  const ud = stored && stored !== "undefined" ? JSON.parse(stored) : { id: -1 };
  const userId: string = ud.id;

  const [flights, setFlights] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const buildPath = (route: string) =>
    `https://lampstackprojectgroup9.com/api/${route}`;

  // Fetch flights from trip
  useEffect(() => {
    async function fetchFlights() {
      try {
        const res = await fetch(buildPath(`get-trip/${tripId}`));
        const data = await res.json();
        if (data.error) setMessage(data.error);
        else setFlights(data.flights || []);
      } catch (err: any) {
        console.error(err);
        setMessage("Failed to load flights.");
      }
    }
    fetchFlights();
  }, [tripId]);

  const addFlight = async () => {
    const newFlight = {
      airline: "",
      flightNumber: "",
      departure: "",
      arrival: "",
      booked: false,
    };

    try {
      const res = await fetch(buildPath(`add-flight/${userId}/${tripId}`), {
        method: "POST",
        body: JSON.stringify(newFlight),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) setMessage(data.error);
      else setFlights([...flights, data.flight]);
    } catch (err: any) {
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  const updateFlight = async (index: number, field: string, value: any) => {
    const updated = [...flights];
    updated[index][field] = value;
    setFlights(updated);

    const flightId = updated[index].id;
    if (!flightId) return;

    try {
      const res = await fetch(
        buildPath(`edit-flight/${userId}/${tripId}/${flightId}`),
        {
          method: "POST",
          body: JSON.stringify(updated[index]),
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (data.error) setMessage(data.error);
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to update flight.");
    }
  };

  const deleteFlight = async (index: number) => {
    const flightId = flights[index].id;
    if (!flightId) return;

    try {
      const res = await fetch(
        buildPath(`delete-flight/${userId}/${tripId}/${flightId}`),
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (data.error) setMessage(data.error);
      else setFlights(flights.filter((_, i) => i !== index));
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to delete flight.");
    }
  };

  return (
    <div className="tab-section">
      <button className="add-btn" onClick={addFlight}>
        + Add Flight
      </button>

      {flights.map((f, i) => (
        <div key={i} className="flight-item">
          <input
            value={f.airline}
            placeholder="Airline"
            onChange={(e) => updateFlight(i, "airline", e.target.value)}
          />
          <input
            value={f.flightNumber}
            placeholder="Flight Number"
            onChange={(e) => updateFlight(i, "flightNumber", e.target.value)}
          />
          <input
            type="datetime-local"
            value={
              f.departure ? new Date(f.departure).toISOString().slice(0, 16) : ""
            }
            onChange={(e) => updateFlight(i, "departure", e.target.value)}
          />
          <input
            type="datetime-local"
            value={
              f.arrival ? new Date(f.arrival).toISOString().slice(0, 16) : ""
            }
            onChange={(e) => updateFlight(i, "arrival", e.target.value)}
          />
          <label>
            <input
              type="checkbox"
              checked={f.booked || false}
              onChange={(e) => updateFlight(i, "booked", e.target.checked)}
            />
            Booked
          </label>
          <button className="delete-btn" onClick={() => deleteFlight(i)}>
            Delete
          </button>
        </div>
      ))}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default TripFlight;