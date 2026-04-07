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

  // Early return if tripId is missing
  if (!tripId) return <div>Error: No trip selected.</div>;

  // Fetch trip info (name, etc.) on mount
  useEffect(() => {
    async function fetchTrip() {
      try {
        const res = await fetch(
          `https://lampstackprojectgroup9.com/api/gettrip?tripId=${tripId}`
        );
        const data = await res.json();
        setTripName(data.name);
      } catch (err) {
        console.error(err);
      }
    }
    fetchTrip();
  }, [tripId]);

  const renderActiveTab = () => {
    // Now tripId is guaranteed to exist, so no TS error
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
        <h2>{tripName}</h2>
        {["Flights", "Hotels", "Itinerary", "Packing List"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active-tab" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </aside>

      <main className="trip-content">{renderActiveTab()}</main>
    </div>
  );
}

export default TripDetailsPage;