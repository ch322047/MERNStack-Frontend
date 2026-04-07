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
  tripId?: string;
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
  const [message, setMessage] = useState("");

  const buildPath = (route: string) =>
    `https://lampstackprojectgroup9.com/api/${route}`;

  // Fetch itinerary on mount
  useEffect(() => {
    async function fetchItinerary() {
      try {
        const res = await fetch(buildPath(`get-trip/${tripId}`));
        const data = await res.json();
        if (data.error) setMessage(data.error);
        else setItinerary(data.trip?.itinerary || []);
      } catch (err: any) {
        setMessage("Failed to load itinerary.");
        console.error(err);
      }
    }
    fetchItinerary();
  }, [tripId]);

  // Add new day
  const addDay = async () => {
    const newDay: ItineraryDay = { tripId, date: new Date().toISOString(), activities: [] };
    try {
      const res = await fetch(buildPath(`add-itinerary-day/${userId}/${tripId}`), {
        method: "POST",
        body: JSON.stringify(newDay),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) setMessage(data.error);
      else setItinerary([...itinerary, data.day]);
    } catch (err: any) {
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  const updateDayDate = async (dayIndex: number, date: string) => {
    const updated = [...itinerary];
    updated[dayIndex].date = date;
    setItinerary(updated);

    const dayId = updated[dayIndex]._id;
    if (!dayId) return;

    try {
      const res = await fetch(buildPath(`edit-itinerary-day/${userId}/${tripId}/${dayId}`), {
        method: "POST",
        body: JSON.stringify({ date }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) setMessage(data.error);
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to update day.");
    }
  };

  const deleteDay = async (dayIndex: number) => {
    const dayId = itinerary[dayIndex]._id;
    if (!dayId) return;

    try {
      const res = await fetch(buildPath(`delete-itinerary/${userId}/${tripId}/${dayId}`), { method: "DELETE" });
      const data = await res.json();
      if (data.error) setMessage(data.error);
      else setItinerary(itinerary.filter((_, i) => i !== dayIndex));
    } catch (err: any) {
      setMessage("Failed to delete day.");
      console.error(err);
    }
  };

  // Add activity to a day
  const addActivity = async (dayIndex: number) => {
    const day = itinerary[dayIndex];
    const newActivity: Activity = { name: "", time: "", location: "" };

    try {
      const res = await fetch(buildPath(`add-itinerary-day-activity/${userId}/${tripId}/${day._id}`), {
        method: "POST",
        body: JSON.stringify(newActivity),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) setMessage(data.error);
      else {
        const updated = [...itinerary];
        updated[dayIndex].activities.push(data.activity);
        setItinerary(updated);
      }
    } catch (err: any) {
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  const updateActivity = async (
    dayIndex: number,
    activityIndex: number,
    field: keyof Activity,
    value: string
  ) => {
    const updated = [...itinerary];
    updated[dayIndex].activities[activityIndex][field] = value;
    setItinerary(updated);

    const activityId = updated[dayIndex].activities[activityIndex]._id;
    const dayId = updated[dayIndex]._id;
    if (!activityId || !dayId) return;

    try {
      const res = await fetch(buildPath(`edit-itinerary-day-activity/${userId}/${tripId}/${dayId}/${activityId}`), {
        method: "POST",
        body: JSON.stringify({ [field]: value }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) setMessage(data.error);
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to update activity.");
    }
  };

  const deleteActivity = async (dayIndex: number, activityIndex: number) => {
    const activityId = itinerary[dayIndex].activities[activityIndex]._id;
    const dayId = itinerary[dayIndex]._id;
    if (!activityId || !dayId) return;

    try {
      const res = await fetch(buildPath(`delete-activity/${userId}/${tripId}/${dayId}/${activityId}`), { method: "DELETE" });
      const data = await res.json();
      if (data.error) setMessage(data.error);
      else {
        const updated = [...itinerary];
        updated[dayIndex].activities.splice(activityIndex, 1);
        setItinerary(updated);
      }
    } catch (err: any) {
      setMessage("Failed to delete activity.");
      console.error(err);
    }
  };

  return (
    <div className="tab-section">
      <button className="add-btn" onClick={addDay}>+ Add Day</button>

      {itinerary.map((day, di) => (
        <div key={di} className="itinerary-day card">
          <div className="day-header">
            <input
              type="date"
              value={day.date ? new Date(day.date).toISOString().slice(0, 10) : ""}
              onChange={(e) => updateDayDate(di, e.target.value)}
              className="day-date-input"
            />
            <button className="save-btn" onClick={() => deleteDay(di)}>Delete Day</button>
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
                <button className="delete-btn" onClick={() => deleteActivity(di, ai)}>Delete</button>
              </div>
            ))}
          </div>

          <button className="add-btn" onClick={() => addActivity(di)}>+ Add Activity</button>
        </div>
      ))}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default TripItinerary;