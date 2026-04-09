import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TripFlight from "../components/TripFlight";
import TripHotel from "../components/TripHotel";
import TripItinerary from "../components/TripItinerary";
import TripPacking from "../components/TripPacking";
import "../index.css";

function TripDetails() {
  const navigate = useNavigate();

    // Get user from localStorage
  const stored = localStorage.getItem('user_data');
  const user = stored ? JSON.parse(stored) : null;
  const userId = user?.id;
  
  const { tripId } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Flights");
  const [message, setMessage] = useState("");

  const [showTripModal, setShowTripModal] = useState(false);
  const [tripForm, setTripForm] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  // Early return if tripId is missing
  if (!tripId) return <div className="message">Error: No trip selected.</div>;

  // Fetch trip info on mount
  useEffect(() => {
    async function fetchTrip() {
      try {
        const response = await fetch(
          `https://lampstackprojectgroup9.com/api/get-trip/${tripId}`
        );
        const data = await response.json();

        if (data.error) {
          setMessage(data.error);
          setTrip(null);
        } else {
          setTrip(data.trip || null);
        }
      } catch (err: any) {
        console.error(err);
        setMessage("Failed to fetch trip details.");
      }
    }

    fetchTrip();
  }, [tripId]);

  const renderActiveTab = () => {
    if (!tripId) return <p>Loading Trip...</p>;
    
    switch (activeTab) {
      case "Flights":
        return <TripFlight tripId={tripId} />;
      case "Hotels":
        return <TripHotel tripId={tripId} />;
      case "Itinerary":
        return <TripItinerary tripId={tripId} />;
      case "Packing List":
        return <TripPacking tripId={tripId} />;
      default:
        return null;
    }
  };

  function getDaysAway(dateStr: string) {
    const today = new Date();
    const target = new Date(dateStr);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  const openEditTripModal = () => {
    if (!trip) return;

    const formatDateInput = (dateStr: string) => {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    setTripForm({
      name: trip.name || "",
      destination: trip.destination || "",
      startDate: formatDateInput(trip.startDate),
      endDate: formatDateInput(trip.endDate),
      status: trip.status || "planned",
    });

    setShowTripModal(true);
  };

  const saveTrip = async () => {
    try {
      // Only convert valid dates
      const startDateISO = tripForm.startDate ? new Date(tripForm.startDate).toISOString() : null;
      const endDateISO = tripForm.endDate ? new Date(tripForm.endDate).toISOString() : null;

      const payload = {
        name: tripForm.name,
        destination: tripForm.destination,
        startDate: startDateISO,
        endDate: endDateISO,
        status: tripForm.status,
      };

      const res = await fetch(
        `https://lampstackprojectgroup9.com/api/edit-trip/${userId}/${tripId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (data.error) {
        setMessage(data.error);
      } else {
        setShowTripModal(false);
        // Optionally refresh trip data
        setTrip({ ...trip, ...payload });
      }
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to save trip.");
    }
  };

    // Delete trip
    const deleteTrip = async () => {
      if (!tripId) return;

      try {
        await fetch(`https://lampstackprojectgroup9.com/api/delete-trip/${userId}/${tripId}`, {
          method: "DELETE",
        });
        setShowTripModal(false);
        navigate("/trips"); // go back to trips page after deletion
      } catch (err) {
        console.error(err);
        setMessage("Failed to delete trip.");
      }
    };

  return (
    <div className="details-page">
      {/* SIDEBAR */}
      <aside className="details-sidebar">
        {trip ? (
          <div className="trip-card sidebar-card" onClick={openEditTripModal}>
            <h2 className="trip-name">{trip.name}</h2>
            <p className="trip-destination">{trip.destination}</p>
            <p className="trip-status">{trip.status.toUpperCase()} </p>
            <p className="trip-time">T-{getDaysAway(trip.startDate)}d</p>
          </div>
        ) : (
          <p>Loading trip info...</p>
        )}

        {["Flights", "Hotels", "Itinerary", "Packing List"].map((tab) => (
          <button
            key={tab}
            className={`details-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}

        <button className="back-btn" onClick={() => navigate("/trips")}>
          ← Back
        </button>

        {showTripModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Edit Trip</h2>

              <div className="modal-field">
                <label>Name</label>
                <input
                  value={tripForm.name}
                  onChange={(e) => setTripForm({ ...tripForm, name: e.target.value })}
                />
              </div>

              <div className="modal-field">
                <label>Destination</label>
                <input
                  value={tripForm.destination}
                  onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                />
              </div>

              <div className="modal-field">
                <label>Start Date</label>
                <input
                  type="date"
                  value={tripForm.startDate}
                  onChange={(e) => setTripForm({ ...tripForm, startDate: e.target.value })}
                />
              </div>

              <div className="modal-field">
                <label>End Date</label>
                <input
                  type="date"
                  value={tripForm.endDate}
                  onChange={(e) => setTripForm({ ...tripForm, endDate: e.target.value })}
                />
              </div>

              <div className="modal-field">
                <label>Status</label>
                <select
                  value={tripForm.status}
                  onChange={(e) => setTripForm({ ...tripForm, status: e.target.value })}
                >
                  <option value="planned">Planning</option>
                  <option value="ongoing">Active</option>
                  <option value="complete">Completed</option>
                </select>
              </div>

              <div className="modal-buttons">
                <button className="confirm-btn" onClick={saveTrip}>SAVE</button>
                <button className="delete-btn" onClick={deleteTrip}>
                  DELETE
                </button>
                <button className="cancel-btn" onClick={() => setShowTripModal(false)}>CANCEL</button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className="details-content">
        <div className="details-header">
          <h1>{activeTab}</h1>
        </div>

        {message && <p className="message">{message}</p>}

        <div className="details-body">{renderActiveTab()}</div>
      </main>
    </div>
  );
}

export default TripDetails;