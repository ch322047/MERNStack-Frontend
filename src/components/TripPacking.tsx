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

  //const stored = localStorage.getItem("user_data");
  //const ud = stored && stored !== "undefined" ? JSON.parse(stored) : { id: -1 };
  //const userId: string = ud.id;
  const token = localStorage.getItem('token');

  const buildPath = (route: string) =>
    `https://lampstackprojectgroup9.com/api/${route}`;

  // Fetch packing list
  const fetchItems = async () => {
    try {
      const res = await fetch(buildPath(`get-trip/${tripId}`),{ headers:{ Authorization: `Bearer ${token}` } });
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
    //setShowModal(true);
    
  };

  // Check an item.
  const handleCheckItem = async (index: number, checked: boolean) => {
    setEditingIndex(index);
    setItemForm({ ...items[index] });
    //setShowModal(false);

    // update item in array
    items[index].packed = checked;
    //const payload = { items[index] };
    
    // save changes
    try {
      const url = buildPath(`edit-packing-list/${tripId}/${items[index]._id}`);

      await fetch(url, {
        method: "PUT",
        body: JSON.stringify(items[index]),
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      setShowModal(false);
      fetchItems();
    } catch (err: any) {
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  // Change an item's name
  const handleRenameItem = async (index: number, name: string) => {
    setEditingIndex(index);
    setItemForm({ ...items[index] });

    // update item in array
    items[index].item = name;
    
    // save changes
    try {
      const url = buildPath(`edit-packing-list/${tripId}/${items[index]._id}`);

      await fetch(url, {
        method: "PUT",
        body: JSON.stringify(items[index]),
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      //setEditingIndex(null);
      fetchItems();
    } catch (err: any) {
      setMessage(err instanceof Error ? err.message : String(err));
    }
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
          ? buildPath(`add-to-packing-list/${tripId}`)
          : buildPath(`edit-packing-list/${tripId}/${items[editingIndex]._id}`);

      await fetch(url, {
        method: editingIndex === null ? "POST" : "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      await fetch(buildPath(`delete-PackingList/${tripId}/${itemId}`), {
        method: "DELETE",
        headers:{ Authorization: `Bearer ${token}` },
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
      <div className="trip-list" id="itemsListDiv">
        {items.map((i, idx) => (
          <div key={idx} className="trip-entry" onClick={() => handleEditClick(idx)}>
            <input
              type="checkbox"
              checked={items[idx].packed}
              onChange={(e) => handleCheckItem(idx, e.target.checked)}
            />
            {editingIndex !== idx && (
              <p>{i.item}</p>
            )}
            {editingIndex === idx && (
              <input autoFocus
                placeholder="Item"
                value={items[idx].item}
                onBlur={(e) => handleRenameItem(idx, e.target.value)}
              />
            )}
            {editingIndex === idx && (
              <button className="delete-btn" onClick={() => deleteItem(idx)}>
                DELETE
              </button>
            )}
          </div>
        ))}
        <button className="add-item-btn" onClick={handleAddClick}>
          + Add Item
        </button>
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

            <div className="modal-field booked-field">
              <label>Packed</label>
                <input
                  type="checkbox"
                  checked={itemForm.packed}
                  onChange={(e) => setItemForm({ ...itemForm, packed: e.target.checked })}
                />
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
