import { useState, useEffect } from "react";

interface TripHotelProps {
  tripId: string;
}

function TripHotel({ tripId }: TripHotelProps) {
  const stored = localStorage.getItem("user_data");
  const ud = stored && stored !== "undefined" ? JSON.parse(stored) : { id: -1 };
  const userId: string = ud.id;

  const [hotels, setHotels] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const buildPath = (route: string) =>
    `https://lampstackprojectgroup9.com/api/${route}`;

  // Fetch hotels from trip
  useEffect(() => {
    async function fetchHotels() {
      try {
        const res = await fetch(buildPath(`get-trip/${tripId}`));
        const data = await res.json();
        if (data.error) setMessage(data.error);
        else setHotels(data.hotels || []);
      } catch (err: any) {
        console.error(err);
        setMessage("Failed to load hotels.");
      }
    }
    fetchHotels();
  }, [tripId]);

  const addHotel = async () => {
    const newHotel = { name: "", checkIn: "", checkOut: "", booked: false };

    try {
      const res = await fetch(buildPath(`add-hotel/${userId}/${tripId}`), {
        method: "POST",
        body: JSON.stringify(newHotel),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) setMessage(data.error);
      else setHotels([...hotels, data.hotel]);
    } catch (err: any) {
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  const updateHotel = async (index: number, field: string, value: any) => {
    const updated = [...hotels];
    updated[index][field] = value;
    setHotels(updated);

    const hotelId = updated[index].id;
    if (!hotelId) return;

    try {
      const res = await fetch(
        buildPath(`edit-hotel/${userId}/${tripId}/${hotelId}`),
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
      setMessage("Failed to update hotel.");
    }
  };

  const deleteHotel = async (index: number) => {
    const hotelId = hotels[index].id;
    if (!hotelId) return;

    try {
      const res = await fetch(
        buildPath(`delete-hotel/${userId}/${tripId}/${hotelId}`),
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.error) setMessage(data.error);
      else setHotels(hotels.filter((_, i) => i !== index));
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to delete hotel.");
    }
  };

  return (
    <div className="tab-section">
      <button className="add-btn" onClick={addHotel}>
        + Add Hotel
      </button>

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
          <button className="delete-btn" onClick={() => deleteHotel(i)}>
            Delete
          </button>
        </div>
      ))}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default TripHotel;