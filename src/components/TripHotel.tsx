import { useState, useEffect } from "react";

interface TripHotelProps {
  tripId: string;
}

function TripHotel({ tripId }: TripHotelProps) {
  const [hotels, setHotels] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchHotels() {
      try {
        const res = await fetch(`https://lampstackprojectgroup9.com/api/gettrip?tripId=${tripId}`);
        const data = await res.json();
        setHotels(data.hotels || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchHotels();
  }, [tripId]);

  const addHotel = async () => {
    const newHotel = { tripId, name: "", checkIn: "", checkOut: "", booked: false };
    try {
      const res = await fetch("https://lampstackprojectgroup9.com/api/addhotel", {
        method: "POST",
        body: JSON.stringify(newHotel),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!data.error) setHotels([...hotels, data.hotel]);
      else setMessage(data.error);
    } catch (err: unknown) {
        setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  const updateHotel = async (index: number, field: string, value: any) => {
    const updated = [...hotels];
    updated[index][field] = value;
    setHotels(updated);
    try {
      await fetch("https://lampstackprojectgroup9.com/api/updatehotel", {
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
      <button onClick={addHotel}>+ Add Hotel</button>
      {hotels.map((h, i) => (
        <div key={i} className="hotel-item">
          <input
            value={h.name}
            placeholder="Hotel Name"
            onChange={(e) => updateHotel(i, "name", e.target.value)}
          />
          <input
            type="date"
            value={h.checkIn ? new Date(h.checkIn).toISOString().slice(0, 10) : ""}
            onChange={(e) => updateHotel(i, "checkIn", e.target.value)}
          />
          <input
            type="date"
            value={h.checkOut ? new Date(h.checkOut).toISOString().slice(0, 10) : ""}
            onChange={(e) => updateHotel(i, "checkOut", e.target.value)}
          />
          <label>
            <input
              type="checkbox"
              checked={h.booked || false}
              onChange={(e) => updateHotel(i, "booked", e.target.checked)}
            />
            Booked
          </label>
        </div>
      ))}
      <p>{message}</p>
    </div>
  );
}

export default TripHotel;