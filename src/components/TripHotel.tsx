import { useState, useEffect } from "react";

interface TripHotelProps {
  tripId: string;
}

interface Hotel {
  _id?: string;
  name: string;
  checkIn: string;
  checkOut: string;
  booked: boolean;
}

function TripHotel({ tripId }: TripHotelProps) {
  const token = localStorage.getItem('token');

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [message, setMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [hotelForm, setHotelForm] = useState<Hotel>({
    name: "",
    checkIn: "",
    checkOut: "",
    booked: false,
  });

  const buildPath = (route: string) =>
    `https://lampstackprojectgroup9.com/api/${route}`;

  // Fetch hotels from trip
  const fetchHotels = async () => {
    try {
      const res = await fetch(buildPath(`get-trip/${tripId}`),{ headers:{ Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.error) setMessage(data.error);
      else setHotels((data.trip?.hotels || []).filter((h: any) => h));
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to load hotels.");
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [tripId]);

  // Open modal for new hotel
  const handleAddClick = () => {
    setEditingIndex(null);
    setHotelForm({ name: "", checkIn: "", checkOut: "", booked: false });
    setShowModal(true);
  };

  // Open modal for editing
  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setHotelForm({
      ...hotels[index],
      checkIn: formatForInput(hotels[index].checkIn),
      checkOut: formatForInput(hotels[index].checkOut),
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

  // Save hotel (add or edit)
  const saveHotel = async () => {
    if (!hotelForm.name || !hotelForm.checkIn) {
      setShowModal(false);
      setMessage("Please fill Hotel Name and Check-In Time");
      return;
    }

    // Convert local datetime-local string to UTC
    const checkInUTC = new Date(hotelForm.checkIn);
    const checkOutUTC = hotelForm.checkOut ? new Date(hotelForm.checkOut) : null;

    const payload = {
      ...hotelForm,
      checkIn: checkInUTC.toISOString(),
      checkOut: checkOutUTC ? checkOutUTC.toISOString() : null,
    };

    try {
      const url =
        editingIndex === null
          ? buildPath(`add-hotel/${tripId}`)
          : buildPath(`edit-hotel/${tripId}/${hotels[editingIndex]._id}`);

      await fetch(url, {
        method: editingIndex === null ? "POST" : "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      setShowModal(false);
      fetchHotels();
    } catch (err: any) {
      setShowModal(false);
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  // Delete hotel
  const deleteHotel = async (index: number) => {
    const hotelId = hotels[index]._id;
    if (!hotelId) return;

    try {
      await fetch(buildPath(`delete-hotel/${tripId}/${hotelId}`), {
        method: "DELETE",
        headers:{ Authorization: `Bearer ${token}`},
      });
      setShowModal(false);
      fetchHotels();
    } catch (err: any) {
      console.error(err);
      setShowModal(false);
      setMessage("Failed to delete hotel.");
    }
  };

  return (
    <div className="trip-page">
      <div className="trip-grid">

        {/* Hotel Cards */}
        {hotels.map((h, i) => (
          <div key={i} className="trip-card" onClick={() => handleEditClick(i)}>
            <h3>{h.name}</h3>
            <p>Check-In: {h.checkIn ? new Date(h.checkIn).toLocaleString(undefined, {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}) : "-"}</p>
            <p>Check-Out: {h.checkOut ? new Date(h.checkOut).toLocaleString(undefined, {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}) : "-"}</p>
            <p>Booked: {h.booked ? "Yes" : "No"}</p>
          </div>
        ))}
      </div>

      {/* Add Hotel Card */}
      <button className="add-trip-btn" onClick={handleAddClick}>
        + Add Hotel
      </button>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingIndex === null ? "Add a Hotel" : "Edit Hotel"}</h2>

            <div className="modal-field">
              <label>Hotel Name</label>
              <input
                placeholder="Hotel Name"
                value={hotelForm.name}
                onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
              />
            </div>

            <div className="modal-field">
              <label>Check-In Time</label>
              <input
                type="datetime-local"
                value={hotelForm.checkIn}
                onChange={(e) => setHotelForm({ ...hotelForm, checkIn: e.target.value })}
              />
            </div>

            <div className="modal-field">
              <label>Check-Out Time</label>
              <input
                type="datetime-local"
                value={hotelForm.checkOut}
                onChange={(e) => setHotelForm({ ...hotelForm, checkOut: e.target.value })}
              />
            </div>

            <div className="modal-field booked-field">
              <label>Booked</label>
                <input
                  type="checkbox"
                  checked={hotelForm.booked}
                  onChange={(e) => setHotelForm({ ...hotelForm, booked: e.target.checked })}
                />
            </div>

            <div className="modal-buttons">
              <button className="confirm-btn" onClick={saveHotel}>
                {editingIndex === null ? "ADD HOTEL" : "SAVE"}
              </button>
              {editingIndex !== null && (
                <button
                  className="delete-btn"
                  onClick={() => {
                    deleteHotel(editingIndex);
                    setShowModal(false);
                  }}
                >
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

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default TripHotel;
