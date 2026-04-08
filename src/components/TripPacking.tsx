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
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [itemForm, setItemForm] = useState<PackingItem>({ item: "", packed: false });

  const stored = localStorage.getItem("user_data");
  const ud = stored && stored !== "undefined" ? JSON.parse(stored) : { id: -1 };
  const userId: string = ud.id;

  const buildPath = (route: string) =>
    `https://lampstackprojectgroup9.com/api/${route}`;

  // Fetch packing list
  const fetchItems = async () => {
    try {
      const res = await fetch(buildPath(`get-trip/${tripId}`));
      const data = await res.json();
      setItems(data.trip?.packingList || []);
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to load packing list");
    }
  };

  useEffect(() => {
    fetchItems();
  }, [tripId]);

  // Open modal for new item
  const handleAddClick = () => {
    setEditingIndex(null);
    setItemForm({ item: "", packed: false });
    setShowModal(true);
  };

  // Open modal for editing
  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setItemForm({ ...items[index] });
    setShowModal(true);
  };

  const saveItem = async () => {
    if (!itemForm.item) {
      setMessage("Please enter an item name");
      return;
    }

    const payload = { ...itemForm };

    try {
      const url =
        editingIndex === null
          ? buildPath(`add-to-packing-list/${userId}/${tripId}`)
          : buildPath(`edit-packing-list/${userId}/${tripId}/${items[editingIndex]._id}`);

      await fetch(url, {
        method: editingIndex === null ? "POST" : "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      setShowModal(false);
      fetchItems();
    } catch (err: any) {
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  const deleteItem = async (index: number) => {
    const itemId = items[index]._id;
    if (!itemId) return;

    try {
      await fetch(buildPath(`delete-PackingList/${userId}/${tripId}/${itemId}`), {
        method: "DELETE",
      });
      setShowModal(false);
      fetchItems();
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to delete item");
    }
  };

  return (
    <div className="trip-page">
      <button className="confirm-btn add-floating-btn" onClick={handleAddClick}>
        + Add Item
      </button>

      <div className="trip-grid">
        {items.map((i, idx) => (
          <div key={idx} className="trip-card" onClick={() => handleEditClick(idx)}>
            <p>{i.item}</p>
            <p>Packed: {i.packed ? "Yes" : "No"}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingIndex === null ? "Add Packing Item" : "Edit Packing Item"}</h2>

            <div className="modal-field">
              <label>Item Name</label>
              <input
                placeholder="Item"
                value={itemForm.item}
                onChange={(e) => setItemForm({ ...itemForm, item: e.target.value })}
              />
            </div>

            <div className="modal-field">
              <input
                type="checkbox"
                checked={itemForm.packed || false}
                onChange={(e) => setItemForm({ ...itemForm, packed: e.target.checked })}
              />
              <span>Packed</span>
            </div>

            <div className="modal-buttons">
              <button className="confirm-btn" onClick={saveItem}>
                {editingIndex === null ? "ADD ITEM" : "SAVE"}
              </button>
              {editingIndex !== null && (
                <button className="delete-btn" onClick={() => deleteItem(editingIndex)}>
                  DELETE
                </button>
              )}
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default TripPacking;