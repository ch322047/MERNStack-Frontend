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

  const [showDayModal, setShowDayModal] = useState(false);
  const [dayDate, setDayDate] = useState("");

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [activityForm, setActivityForm] = useState<Activity>({
    name: "",
    time: "",
    location: "",
  });

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

  const saveDay = async () => {
    if (!dayDate) {
      setMessage("Please select a date.");
      return;
    }

    try {
      await fetch(buildPath(`add-itinerary-day/${userId}/${tripId}`), {
        method: "POST",
        body: JSON.stringify({ date: new Date(dayDate).toISOString() }),
        headers: { "Content-Type": "application/json" },
      });

      setShowDayModal(false);
      setDayDate("");
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

    const openAddActivity = () => {
    setEditingActivity(null);
    setActivityForm({ name: "", time: "", location: "" });
    setShowActivityModal(true);
  };

  const openEditActivity = (activity: Activity) => {
    setEditingActivity(activity);

    const formatTime = (dateStr: string) => {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`; // HH:MM only
    };

    setActivityForm({
      ...activity,
      time: formatTime(activity.time), // just the time part
    });

    setShowActivityModal(true);
  };

  const saveActivity = async () => {
    if (!selectedDay?._id) return;

    if (!activityForm.name || !activityForm.time) {
      setMessage("Name and time are required.");
      return;
    }

    const [hours, minutes] = activityForm.time.split(":");
    const date = new Date(selectedDay.date);
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0); // set hours and minutes
    const isoTime = date.toISOString(); // valid full ISO string for API

    const payload = {
      ...activityForm,
      time: isoTime,
    };

    try {
      const url = editingActivity
        ? buildPath(
            `edit-activity/${userId}/${tripId}/${selectedDay._id}/${editingActivity._id}`
          )
        : buildPath(
            `add-itinerary-day-activity/${userId}/${tripId}/${selectedDay._id}`
          );

      await fetch(url, {
        method: editingActivity ? "PUT" : "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      setShowActivityModal(false);
      fetchTrip();
    } catch {
      setMessage("Failed to save activity.");
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

          {showDayModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Add Itinerary Day</h2>

                <div className="modal-field">
                  <label>Date</label>
                  <input
                    type="date"
                    value={dayDate}
                    onChange={(e) => setDayDate(e.target.value)}
                  />
                </div>

                <div className="modal-buttons">
                  <button className="confirm-btn" onClick={saveDay}>
                    ADD DAY
                  </button>
                  <button className="cancel-btn" onClick={() => setShowDayModal(false)}>
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          )}

          <button className="add-trip-btn" onClick={() => setShowDayModal(true)}>
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
              <div key={i} className="trip-card" onClick={() => openEditActivity(a)}>
                <h3>{a.name || "New Activity"}</h3>
                <p>{a.time ? new Date(a.time).toLocaleString() : "-"}</p>
                <p>{a.location || "-"}</p>
              </div>
            ))}
          </div>

          {showActivityModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>{editingActivity ? "Edit Activity" : "Add Activity"}</h2>

                <div className="modal-field">
                  <label>Name</label>
                  <input
                    value={activityForm.name}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, name: e.target.value })
                    }
                  />
                </div>

                <div className="modal-field">
                  <label>Time</label>
                  <input
                    type="time"
                    value={activityForm.time}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, time: e.target.value })
                    }
                  />
                </div>

                <div className="modal-field">
                  <label>Location</label>
                  <input
                    value={activityForm.location}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, location: e.target.value })
                    }
                  />
                </div>

                <div className="modal-buttons">
                  <button className="confirm-btn" onClick={saveActivity}>
                    {editingActivity ? "SAVE" : "ADD"}
                  </button>

                  {editingActivity && (
                    <button
                      className="delete-btn"
                      onClick={() => deleteActivity(editingActivity._id)}
                    >
                      DELETE
                    </button>
                  )}

                  <button
                    className="cancel-btn"
                    onClick={() => setShowActivityModal(false)}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          )}

          <button className="add-trip-btn" onClick={openAddActivity}>
            + Add Activity
          </button>

          <button
            className="delete-day-btn"
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