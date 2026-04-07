import { useState, useEffect } from "react";
import "../index.css";

interface Activity {
  name: string;
  time: string;
  location: string;
}

interface ItineraryDay {
  _id?: string; // DB id for updating
  tripId?: string;
  date: string;
  activities: Activity[];
}

interface TripItineraryProps {
  tripId: string;
}

function TripItinerary({ tripId }: TripItineraryProps) {
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [message, setMessage] = useState("");

  // Fetch itinerary on mount
  useEffect(() => {
    async function fetchItinerary() {
      try {
        const res = await fetch(
          `https://lampstackprojectgroup9.com/api/gettrip?tripId=${tripId}`
        );
        const data = await res.json();
        setItinerary(data.itinerary || []);
      } catch (err: unknown) {
        setMessage(err instanceof Error ? err.message : String(err));
      }
    }
    fetchItinerary();
  }, [tripId]);

  // Add new day
  const addDay = async () => {
    const newDay: ItineraryDay = { tripId, date: new Date().toISOString(), activities: [] };
    try {
      const res = await fetch("https://lampstackprojectgroup9.com/api/additineraryday", {
        method: "POST",
        body: JSON.stringify(newDay),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!data.error) setItinerary([...itinerary, data.day]);
      else setMessage(data.error);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  // Update day date
  const updateDayDate = (dayIndex: number, date: string) => {
    const updated = [...itinerary];
    updated[dayIndex].date = date;
    setItinerary(updated);
  };

  // Add a new activity to a day
  const addActivity = (dayIndex: number) => {
    const updated = [...itinerary];
    updated[dayIndex].activities.push({ name: "", time: "", location: "" });
    setItinerary(updated);
  };

  // Update an activity field
  const updateActivity = (dayIndex: number, activityIndex: number, field: keyof Activity, value: string) => {
    const updated = [...itinerary];
    updated[dayIndex].activities[activityIndex][field] = value;
    setItinerary(updated);
  };

  // Save a day (with activities) to DB
  const saveDay = async (dayIndex: number) => {
    const dayToSave = itinerary[dayIndex];
    try {
      const res = await fetch("https://lampstackprojectgroup9.com/api/updateitineraryday", {
        method: "POST",
        body: JSON.stringify(dayToSave),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) setMessage(data.error);
      else setMessage("Day saved!");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="tab-section">
      <button className="add-button" onClick={addDay}>
        + Add Day
      </button>

      {itinerary.map((day, di) => (
        <div key={di} className="itinerary-day card">
          <div className="day-header">
            <input
              type="date"
              value={day.date ? new Date(day.date).toISOString().slice(0, 10) : ""}
              onChange={(e) => updateDayDate(di, e.target.value)}
              className="day-date-input"
            />
            <button className="save-button" onClick={() => saveDay(di)}>
              Save Day
            </button>
          </div>

          <div className="activities-list">
            {day.activities.map((activity, ai) => (
              <div key={ai} className="activity-item">
                <input
                  placeholder="Activity Name"
                  value={activity.name}
                  onChange={(e) => updateActivity(di, ai, "name", e.target.value)}
                />
                <input
                  placeholder="Time"
                  value={activity.time}
                  onChange={(e) => updateActivity(di, ai, "time", e.target.value)}
                />
                <input
                  placeholder="Location"
                  value={activity.location}
                  onChange={(e) => updateActivity(di, ai, "location", e.target.value)}
                />
              </div>
            ))}
          </div>

          <button className="add-button" onClick={() => addActivity(di)}>
            + Add Activity
          </button>
        </div>
      ))}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default TripItinerary;