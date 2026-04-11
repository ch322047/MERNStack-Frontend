import { useState, useEffect } from 'react';
import '../index.css';
import { useNavigate } from 'react-router-dom';

function Trips() {
  const navigate = useNavigate();

  // Get user from localStorage
  const stored = localStorage.getItem('user_data');
  const user = stored ? JSON.parse(stored) : null;
  const userId = user?.id;

  const [message, setMessage] = useState('');
  const [search, setSearchValue] = useState('');
  const [cards, setCards] = useState<any[]>([]);
  const [showNewTripForm, setShowNewTripForm] = useState(false);

  // Fields for DB
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('planning');

  // Redirect to login if not logged in
  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  // Fetch all trips
  useEffect(() => {
    if (!userId) return;

    async function fetchAllTrips() {
      try {
        const response = await fetch(
          `https://lampstackprojectgroup9.com/api/get-all-trips/${userId}`,{ headers:{ Authorization: 'Bearer ${token}' } }
        );
        const res = await response.json();

        if (res.error) {
          setMessage(res.error);
          setCards([]);
        } else {
          setCards(res.trips || []);
        }
      } catch (error: any) {
        console.error(error);
        setMessage('Failed to fetch trips.');
      }
    }

    fetchAllTrips();
  }, [userId]);

  // Add new trip
  async function handleAddTrip() {
    if (!userId) {
      setMessage('You must be logged in.');
      return;
    }

    if (!name || !destination || !startDate) {
      setMessage('Please fill in Name, Destination, and Start Date');
      return;
    }

    const obj = { name, destination, startDate, endDate, status };

    try {
      const response = await fetch(
        `https://lampstackprojectgroup9.com/api/create-trip/${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ${token}' },
          body: JSON.stringify(obj),
        }
      );
      const res = await response.json();

        if (res.error && res.error.length > 0) {
        setMessage('API Error: ' + res.error);
        } else if (res.tripId) {
        // Trip created successfully
        const newTrip = {
            _id: res.tripId,
            name,
            destination,
            startDate,
            endDate,
            status,
        };

        // Add to current cards so it shows up in the list
        setCards((prev) => [...prev, newTrip]);
        setMessage('Trip added successfully');
        setShowNewTripForm(false);
        setName('');
        setDestination('');
        setStartDate('');
        setEndDate('');
        setStatus('planning');

      } else {
        setMessage('Trip created but no ID returned.');
      }
    } catch (error: any) {
      setMessage(error.toString());
    }
  }

  const filteredCards = search
    ? cards.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : cards;

  function getDaysAway(dateStr: string) {
    const today = new Date();
    const target = new Date(dateStr);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  return (
    <div className="trips-page">

      <input
        className="modal"
        type="text"
        placeholder="Search Trips..."
        value={search}
        onChange={(e) => setSearchValue(e.target.value)}
      />

      <div className="trip-grid">
        {/* Trip Cards */}
        {filteredCards.map((c: any, index: number) => (
          <div
            key={index}
            className="trip-card"
            onClick={() => navigate(`/trip/${c._id}`)}
          >
            <div className="trip-top">
              <h2>{c.name}</h2>
              <span className="trip-time">T-{getDaysAway(c.startDate)}d</span>
            </div>

            <p className="trip-destination">{c.destination}</p>
            <p className="trip-status">{c.status?.toUpperCase() || "PLANNING"}</p>
          </div>
        ))}
      </div>

      {/* Floating Add Trip Button */}
      <button
        className="add-trip-btn"
        onClick={() => setShowNewTripForm(true)}
      >
        + Add New Trip
      </button>

      {/* MODAL */}
      {showNewTripForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create a Trip</h2>
            <div className="modal-field">
              <label>Name</label>
              <input
                placeholder="Trip Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>Destination</label>
              <input
                placeholder="Destination Name"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleAddTrip}>
                CREATE TRIP
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowNewTripForm(false)}
              >
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

export default Trips;
