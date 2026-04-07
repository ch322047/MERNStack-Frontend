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
          `https://lampstackprojectgroup9.com/api/get-all-trips/${userId}`
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(obj),
        }
      );
      const res = await response.json();

        if (res.error && res.error.length > 0) {
        setMessage('API Error: ' + res.error);
        } else if (res.tripId) {
        // Trip created successfully
        const newTrip = {
            id: res.tripId,
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

  return (
    <div className="trip-create-container">
      <input
        className="trip-search"
        type="text"
        placeholder="Search Trips..."
        value={search}
        onChange={(e) => setSearchValue(e.target.value)}
      />

      <div className="trip-grid">
        <div className="trip-card add-card" onClick={() => setShowNewTripForm(true)}>
          + Add Trip
        </div>

        {filteredCards.map((c: any, index: number) => (
          <div
            key={index}
            className="trip-card"
            onClick={() => navigate(`/trips/${c.id}`)}
          >
            <strong>{c.name}</strong>
            <br />
            {c.id}
            <br />
            {c.destination}
            <br />
            {c.startDate} {c.endDate ? `- ${c.endDate}` : ''}
          </div>
        ))}
      </div>

      {showNewTripForm && (
        <div className="trip-section-container">
          <input
            type="text"
            placeholder="Trip Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="trip-search"
          />
          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="trip-search"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="trip-search"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="trip-search"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="trip-search"
          >
            <option value="planning">Planning</option>
            <option value="ready">Ready</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button className="add-btn" onClick={handleAddTrip}>
              Create Trip
            </button>
            <button className="add-btn" onClick={() => setShowNewTripForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <p className="message">{message}</p>
    </div>
  );
}

export default Trips;