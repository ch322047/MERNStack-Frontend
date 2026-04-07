import { useState, useEffect } from "react";

interface TripPackingProps {
  tripId: string;
}

function TripPacking({ tripId }: TripPackingProps) {
  const [items, setItems] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchPackingList() {
      try {
        const res = await fetch(`https://lampstackprojectgroup9.com/api/gettrip?tripId=${tripId}`);
        const data = await res.json();
        setItems(data.packingList || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchPackingList();
  }, [tripId]);

  const addItem = async () => {
    const newItem = { tripId, item: "", packed: false };
    setItems([...items, newItem]);
  };

  const updateItem = async (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
    try {
      await fetch("https://lampstackprojectgroup9.com/api/updatepackingitem", {
        method: "POST",
        body: JSON.stringify(updated[index]),
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="tab-section">
      <button onClick={addItem}>+ Add Item</button>
      {items.map((i, idx) => (
        <div key={idx} className="packing-item">
          <input
            placeholder="Item"
            value={i.item}
            onChange={(e) => updateItem(idx, "item", e.target.value)}
          />
          <label>
            <input
              type="checkbox"
              checked={i.packed || false}
              onChange={(e) => updateItem(idx, "packed", e.target.checked)}
            />
            Packed
          </label>
        </div>
      ))}
      <p>{message}</p>
    </div>
  );
}

export default TripPacking;