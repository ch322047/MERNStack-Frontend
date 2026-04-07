import { useState, useEffect } from 'react';
import '../index.css';
import { useNavigate } from 'react-router-dom';

function Trips() {
  const navigate = useNavigate();
  function buildPath(route: string): string {
    return `https://lampstackprojectgroup9.com/api/${route}`;
  }

  const stored = localStorage.getItem('user_data');
  const ud = stored && stored !== "undefined" ? JSON.parse(stored) : { id: -1 };
  const userId: string = ud.id;

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

  // live search
  useEffect(() => {
    async function fetchCards() {
      const obj = { userId, search };
      const js = JSON.stringify(obj);
      try {
        const response = await fetch(buildPath('searchcards'), {
          method: 'POST',
          body: js,
          headers: { 'Content-Type': 'application/json' },
        });
        const res = await response.json();
        setCards(res.results || []);
      } catch (error: any) {
        console.error(error);
      }
    }
    fetchCards();
  }, [search]);

  async function handleAddTrip() {
    if (!name || !destination || !startDate) {
      setMessage('Please fill in Name, Destination, and Start Date');
      return;
    }

    const obj = { userId, name, destination, startDate, endDate, status };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('addcard'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' },
      });
      const res = await response.json();

      if (res.error && res.error.length > 0) {
        setMessage('API Error: ' + res.error);
      } else {
        setMessage('Trip added');
        setShowNewTripForm(false);
        setName('');
        setDestination('');
        setStartDate('');
        setEndDate('');
        setStatus('planning');
        // redirect to trip details page using returned tripId
        navigate(`/trip/${res.tripId}`);
      }
    } catch (error: any) {
      setMessage(error.toString());
    }
  }

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

        {cards.map((c: any, index: number) => (
            <div
            key={index}
            className="trip-card"
            onClick={() => navigate(`/trip/${c.id}`)}
            >
            <strong>{c.name}</strong>
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
            <button className="add-btn" onClick={handleAddTrip}>Create Trip</button>
            <button className="add-btn" onClick={() => setShowNewTripForm(false)}>Cancel</button>
            </div>
        </div>
        )}

        <p className="message">{message}</p>
    </div>
    );
}

export default Trips;