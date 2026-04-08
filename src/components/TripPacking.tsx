import { useState, useEffect } from "react";
import "../index.css";

interface PackingItem {
  _id?: string;
  item: string;
  packed: boolean;
}

interface TripPackingProps {
  tripId: string;
}

function TripPacking({ tripId }: TripPackingProps) {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [message, setMessage] = useState("");

  const stored = localStorage.getItem("user_data");
  const ud = stored && stored !== "undefined" ? JSON.parse(stored) : { id: -1 };
  const userId: string = ud.id;

  const buildPath = (route: string) =>
    `https://lampstackprojectgroup9.com/api/${route}`;

  // Fetch packing list
  useEffect(() => {
    async function fetchPackingList() {
      try {
        const res = await fetch(buildPath(`get-trip/${tripId}`));
        const data = await res.json();
        setItems(data.trip?.packingList || []);
      } catch (err: any) {
        console.error(err);
        setMessage("Failed to load packing list");
      }
    }
    fetchPackingList();
  }, [tripId]);

  // Add item
  const addItem = async () => {
    const newItem: PackingItem = { item: "", packed: false };
    try {
      const res = await fetch(buildPath(`add-to-packing-list/${userId}/${tripId}`), {
        method: "POST",
        body: JSON.stringify(newItem),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) setMessage(data.error);
      else setItems([...items, data.item]);
    } catch (err: any) {
      setMessage("Network error");
    }
  };

  // Update item
  const updateItem = async (index: number, field: keyof PackingItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);

    const itemId = updated[index]._id;
    if (!itemId) return;

    try {
      const res = await fetch(
        buildPath(`edit-packing-list/${userId}/${tripId}/${itemId}`),
        {
          method: "PUT",
          body: JSON.stringify({ [field]: value }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (data.error) setMessage(data.error);
    } catch (err: any) {
      setMessage("Network error");
    }
  };

  // Delete item
  const deleteItem = async (index: number) => {
    const updated = [...items];
    const itemId = updated[index]._id;
    if (!itemId) return;

    try {
      const res = await fetch(
        buildPath(`delete-packing-list/${userId}/${tripId}/${itemId}`),
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!data.error) {
        updated.splice(index, 1);
        setItems(updated);
      } else setMessage(data.error);
    } catch (err: any) {
      setMessage("Network error");
    }
  };

  return (
    <div className="tab-section">
      <button className="add-trip-btn" onClick={addItem}>
        + Add Item
      </button>

      <div className="packing-list">
        {items.map((i, idx) => (
          <div key={idx} className="packing-item">
            <input
              placeholder="Item"
              value={i.item}
              onChange={(e) => updateItem(idx, "item", e.target.value)}
            />
            <label className="packed-label">
              <input
                type="checkbox"
                checked={i.packed || false}
                onChange={(e) => updateItem(idx, "packed", e.target.checked)}
              />
              Packed
            </label>
            <button className="delete-btn" onClick={() => deleteItem(idx)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default TripPacking;