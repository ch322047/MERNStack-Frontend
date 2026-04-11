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
  const token = localStorage.getItem('token');

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
  const fetchFlights = async () => {
      try {
        const res = await fetch(buildPath(`get-trip/${tripId}`),{ headers:{ Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.error) setMessage(data.error);
        else setFlights((data.trip?.flights || []).filter((f: any) => f));
      } catch (err: any) {
        console.error(err);
        setMessage("Failed to load flights.");
      }
    }
  
  // initial refresh
  useEffect(() => {
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
    setFlightForm({ 
      ...flights[index],
      departure: formatForInput(flights[index].departure),
      arrival: formatForInput(flights[index].arrival),
    });
    setShowModal(true);
  };

  const formatForInput = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const pad = (n: number) => n.toString().padStart(2, "0");

    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());

    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const saveFlight = async () => {
    if (!flightForm.airline || !flightForm.flightNumber || !flightForm.departure) {
      setMessage("Please fill Airline, Flight Number, and Departure Time");
      return;
    }

    // Convert local datetime-local string to UTC
    const departureUTC = new Date(flightForm.departure);
    const arrivalUTC = flightForm.arrival ? new Date(flightForm.arrival) : null;

    const payload = {
      ...flightForm,
      departure: departureUTC.toISOString(),
      arrival: arrivalUTC ? arrivalUTC.toISOString() : null,
    };

    try {
      const url =
        editingIndex === null
          ? buildPath(`add-flight/${userId}/${tripId}`)
          : buildPath(`edit-flight/${userId}/${tripId}/${flights[editingIndex]._id}`);

      await fetch(url, {
        method: editingIndex === null ? "POST" : "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      setShowModal(false); 
      fetchFlights();
    } catch (err: any) {
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  // Delete flight
  const deleteFlight = async (index: number) => {
    const flightId = flights[index]._id;
    if (!flightId) return;

    try {
      await fetch(buildPath(`delete-flight/${userId}/${tripId}/${flightId}`), {
        method: "DELETE",
        headers:{ Authorization: `Bearer ${token}`},
      });
      setShowModal(false); // close the modal
      fetchFlights(); //refresh flight list
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to delete flight.");
    }
  };

  return (
    <div className="trip-page">
      <div className="trip-grid">

        {/* Flight Cards */}
        {flights.map((f, i) => (
          <div key={i} className="trip-card" onClick={() => handleEditClick(i)}>
            <h3>{f.airline}</h3>
            <p>{f.flightNumber}</p>
            <p>Departure: {new Date(f.departure).toLocaleString({hour: 'numeric', minute: '2-digit'})}</p>
            <p>Arrival: {f.arrival ? new Date(f.arrival).toLocaleString({hour: 'numeric', minute: '2-digit'}) : "-"}</p>
          </div>
        ))}
      </div>
      
      {/* Add Flight Card */}
      <button className="add-trip-btn" onClick={handleAddClick}>
        + Add Flight
      </button>

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
                {editingIndex === null ? "ADD FLIGHT" : "SAVE"}
              </button>
              {editingIndex !== null && (
                <button className="delete-btn" onClick={() => { deleteFlight(editingIndex); setShowModal(false); }}>
                  DELETE
                </button>
              )}
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="message">{message}</p>
    </div>
  );
}

export default TripFlight;
