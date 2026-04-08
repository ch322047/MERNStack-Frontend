import { useState, useEffect } from "react";

interface TripFlightProps {
  tripId: string;
}

interface Flight {
  _id?: string;
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  booked: boolean;
}

function TripFlight({ tripId }: TripFlightProps) {
  const stored = localStorage.getItem("user_data");
  const ud = stored && stored !== "undefined" ? JSON.parse(stored) : { id: -1 };
  const userId: string = ud.id;

  const [flights, setFlights] = useState<Flight[]>([]);
  const [message, setMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [flightForm, setFlightForm] = useState<Flight>({
    airline: "",
    flightNumber: "",
    departure: "",
    arrival: "",
    booked: false,
  });

  const buildPath = (route: string) =>
    `https://lampstackprojectgroup9.com/api/${route}`;

  // Fetch flights from trip
  useEffect(() => {
    async function fetchFlights() {
      try {
        const res = await fetch(buildPath(`get-trip/${tripId}`));
        const data = await res.json();
        if (data.error) setMessage(data.error);
        else setFlights((data.trip?.flights || []).filter((f: any) => f));
      } catch (err: any) {
        console.error(err);
        setMessage("Failed to load flights.");
      }
    }
    fetchFlights();
  }, [tripId]);

  // Open modal for new flight
  const handleAddClick = () => {
    setEditingIndex(null);
    setFlightForm({ airline: "", flightNumber: "", departure: "", arrival: "", booked: false });
    setShowModal(true);
  };

  // Open modal for editing
  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setFlightForm({ ...flights[index] });
    setShowModal(true);
  };

  // Save flight (add or edit)
  const saveFlight = async () => {
    if (!flightForm.airline || !flightForm.flightNumber || !flightForm.departure) {
      setMessage("Please fill Airline, Flight Number, and Departure");
      return;
    }

    if (editingIndex === null) {
      // Create new flight
      try {
        const res = await fetch(buildPath(`add-flight/${userId}/${tripId}`), {
          method: "POST",
          body: JSON.stringify(flightForm),
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (data.error) setMessage(data.error);
        else {
          setFlights([...flights, data.flight]);
          setShowModal(false);
        }
      } catch (err: any) {
        setMessage(err instanceof Error ? err.message : String(err));
      }
    } else {
      // Update existing flight
      const flightId = flights[editingIndex]._id;
      if (!flightId) return;

      try {
        const res = await fetch(buildPath(`edit-flight/${userId}/${tripId}/${flightId}`), {
          method: "POST",
          body: JSON.stringify(flightForm),
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (data.error) setMessage(data.error);
        else {
          const updated = [...flights];
          updated[editingIndex] = { ...flightForm, _id: flightId };
          setFlights(updated);
          setShowModal(false);
        }
      } catch (err: any) {
        console.error(err);
        setMessage("Failed to update flight.");
      }
    }
  };

  // Delete flight
  const deleteFlight = async (index: number) => {
    const flightId = flights[index]._id;
    if (!flightId) return;

    try {
      const res = await fetch(buildPath(`delete-flight/${userId}/${tripId}/${flightId}`), {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) setMessage(data.error);
      else setFlights(flights.filter((_, i) => i !== index));
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to delete flight.");
    }
  };

  return (
    <div className="flights-page">
      <div className="flight-grid">
        {/* Add Flight Card */}
        <div className="flight-card add-card" onClick={handleAddClick}>
          + Add Flight
        </div>

        {/* Flight Cards */}
        {flights.map((f, i) => (
          <div key={i} className="flight-card" onClick={() => handleEditClick(i)}>
            <h3>{f.airline}</h3>
            <p>{f.flightNumber}</p>
            <p>Departure: {new Date(f.departure).toLocaleString()}</p>
            <p>Arrival: {f.arrival ? new Date(f.arrival).toLocaleString() : "-"}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingIndex === null ? "Add a Flight" : "Edit Flight"}</h2>

            <div className="modal-field">
              <label>Airline</label>
              <input
                placeholder="Airline Name"
                value={flightForm.airline}
                onChange={(e) => setFlightForm({ ...flightForm, airline: e.target.value })}
              />
            </div>

            <div className="modal-field">
              <label>Flight Number</label>
              <input
                placeholder="Flight Number"
                value={flightForm.flightNumber}
                onChange={(e) => setFlightForm({ ...flightForm, flightNumber: e.target.value })}
              />
            </div>

            <div className="modal-field">
              <label>Departure Time</label>
              <input
                type="datetime-local"
                value={flightForm.departure}
                onChange={(e) => setFlightForm({ ...flightForm, departure: e.target.value })}
              />
            </div>

            <div className="modal-field">
              <label>Arrival Time</label>
              <input
                type="datetime-local"
                value={flightForm.arrival}
                onChange={(e) => setFlightForm({ ...flightForm, arrival: e.target.value })}
              />
            </div>

            <div className="modal-buttons">
              <button className="confirm-btn" onClick={saveFlight}>
                {editingIndex === null ? "ADD FLIGHT" : "SAVE FLIGHT"}
              </button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                CANCEL
              </button>
              {editingIndex !== null && (
                <button className="delete-btn" onClick={() => { deleteFlight(editingIndex); setShowModal(false); }}>
                  DELETE
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <p className="message">{message}</p>
    </div>
  );
}

export default TripFlight;