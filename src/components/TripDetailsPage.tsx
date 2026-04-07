import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TripFlight from "./TripFlight";
import TripHotel from "./TripHotel";
import TripItinerary from "./TripItinerary";
import TripPacking from "./TripPacking";
import "../index.css";

function TripDetailsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [tripName, setTripName] = useState("");
  const [activeTab, setActiveTab] = useState("Flights");
  const [message, setMessage] = useState("");

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
          setTripName("");
        } else {
          setTripName(data.name || "Unnamed Trip");
        }
      } catch (err: any) {
        console.error(err);
        setMessage("Failed to fetch trip details.");
      }
    }

    fetchTrip();
  }, [tripId]);

  const renderActiveTab = () => {
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

  return (
    <div className="trip-details-page">
      <aside className="trip-sidebar">
        <h2 className="trip-title">{tripName || "Loading..."}</h2>
        {["Flights", "Hotels", "Itinerary", "Packing List"].map((tab) => (
          <button
            key={tab}
            className={`sidebar-btn ${activeTab === tab ? "active-tab" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </aside>

      <main className="trip-content">
        {message && <p className="message">{message}</p>}
        {renderActiveTab()}
      </main>
    </div>
  );
}

export default TripDetailsPage;