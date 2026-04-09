import { useState, useEffect } from "react";
import "../index.css";

interface Activity {
  _id?: string;
  name: string;
  time: string;
  location: string;
}

interface ItineraryDay {
  _id?: string;
  date: string;
  activities: Activity[];
}

interface TripItineraryProps {
  tripId: string;
}

function TripItinerary({ tripId }: TripItineraryProps) {
  const stored = localStorage.getItem("user_data");
  const ud = stored && stored !== "undefined" ? JSON.parse(stored) : { id: -1 };
  const userId: string = ud.id;

  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<ItineraryDay | null>(null);
  const [message, setMessage] = useState("");

  const buildPath = (route: string) =>
    `https://lampstackprojectgroup9.com/api/${route}`;

  const fetchTrip = async () => {
    try {
      const res = await fetch(buildPath(`get-trip/${tripId}`));
      const data = await res.json();

      if (data.error) setMessage(data.error);
      else setItinerary(data.trip?.itinerary || []);
    } catch (err: any) {
      setMessage("Failed to load itinerary.");
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  const addDay = async () => {
    try {
      await fetch(buildPath(`add-itinerary-day/${userId}/${tripId}`), {
        method: "POST",
      });

      fetchTrip();
    } catch {
      setMessage("Failed to add day.");
    }
  };

  const deleteDay = async (dayId?: string) => {
    if (!dayId) return;

    try {
      await fetch(
        buildPath(`delete-itinerary/${userId}/${tripId}/${dayId}`),
        { method: "DELETE" }
      );

      setSelectedDay(null);
      fetchTrip();
    } catch {
      setMessage("Failed to delete day.");
    }
  };

  const addActivity = async () => {
    if (!selectedDay?._id) return;

    const payload = { name: "", time: "", location: "" };

    try {
      await fetch(
        buildPath(
          `add-itinerary-day-activity/${userId}/${tripId}/${selectedDay._id}`
        ),
        {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        }
      );

      fetchTrip();
    } catch {
      setMessage("Failed to add activity.");
    }
  };

  const deleteActivity = async (activityId?: string) => {
    if (!activityId || !selectedDay?._id) return;

    try {
      await fetch(
        buildPath(
          `delete-activity/${userId}/${tripId}/${selectedDay._id}/${activityId}`
        ),
        { method: "DELETE" }
      );

      fetchTrip();
    } catch {
      setMessage("Failed to delete activity.");
    }
  };

  useEffect(() => {
    if (!selectedDay) return;

    const updated = itinerary.find((d) => d._id === selectedDay._id);
    if (updated) setSelectedDay(updated);
  }, [itinerary]);


  return (
    <div className="trip-page">

      {/* ===== DAY VIEW ===== */}
      {!selectedDay && (
        <>
          <div className="trip-grid">
            {itinerary.map((day, i) => (
              <div
                key={i}
                className="trip-card"
                onClick={() => setSelectedDay(day)}
              >
                <h3>{new Date(day.date).toLocaleDateString()}</h3>
              </div>
            ))}
          </div>

          <button className="add-trip-btn" onClick={addDay}>
            + Add Day
          </button>
        </>
      )}

      {/* ===== ACTIVITY VIEW ===== */}
      {selectedDay && (
        <>
          <div className="details-header">
            <button className="cancel-btn" onClick={() => setSelectedDay(null)}>
              ← Back
            </button>

            <h1>
              Itinerary of {new Date(selectedDay.date).toLocaleDateString()}
            </h1>
          </div>

          <div className="trip-grid">
            {(selectedDay.activities || []).map((a, i) => (
              <div key={i} className="trip-card">
                <h3>{a.name || "New Activity"}</h3>
                <p>{a.time || "-"}</p>
                <p>{a.location || "-"}</p>

                <button
                  className="delete-btn"
                  onClick={() => deleteActivity(a._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <button className="add-trip-btn" onClick={addActivity}>
            + Add Activity
          </button>

          <button
            className="delete-btn"
            onClick={() => deleteDay(selectedDay._id)}
          >
            Delete Day
          </button>
        </>
      )}

      <p className="message">{message}</p>
    </div>
  );
}

export default TripItinerary;