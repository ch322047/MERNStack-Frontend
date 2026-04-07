import { useState, useEffect } from "react";

interface TripFlightProps {
  tripId: string;
}

function TripFlight({ tripId }: TripFlightProps) {
  const [flights, setFlights] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  // Fetch flights for this trip
  useEffect(() => {
    async function fetchFlights() {
      try {
        const res = await fetch(`https://lampstackprojectgroup9.com/api/gettrip?tripId=${tripId}`);
        const data = await res.json();
        setFlights(data.flights || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchFlights();
  }, [tripId]);

  const addFlight = async () => {
    const newFlight = { tripId, airline: "", flightNumber: "", departure: "", arrival: "", booked: false };
    try {
      const res = await fetch("https://lampstackprojectgroup9.com/api/addflight", {
        method: "POST",
        body: JSON.stringify(newFlight),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!data.error) setFlights([...flights, data.flight]);
      else setMessage(data.error);
    } catch (err: unknown) {
    setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  const updateFlight = async (index: number, field: string, value: any) => {
    const updated = [...flights];
    updated[index][field] = value;
    setFlights(updated);
    try {
      await fetch("https://lampstackprojectgroup9.com/api/updateflight", {
        method: "POST",
        body: JSON.stringify(updated[index]),
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="tab-section">
      <button onClick={addFlight}>+ Add Flight</button>
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
            value={f.departure ? new Date(f.departure).toISOString().slice(0, 16) : ""}
            onChange={(e) => updateFlight(i, "departure", e.target.value)}
          />
          <input
            type="datetime-local"
            value={f.arrival ? new Date(f.arrival).toISOString().slice(0, 16) : ""}
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
        </div>
      ))}
      <p>{message}</p>
    </div>
  );
}

export default TripFlight;