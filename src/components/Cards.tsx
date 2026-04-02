import { useState, useEffect } from 'react';
import '../index.css';

function Cards()
{
    function buildPath(route:string) : string
    {
        return `https://lampstackprojectgroup9.com/api/${route}`;
    }

    const stored = localStorage.getItem('user_data');
    const ud = stored && stored !== "undefined" ? JSON.parse(stored) : { id: -1 };
    let userId : string = ud.id;

    const [message,setMessage] = useState('');
    const [search,setSearchValue] = useState('');
    const [cards,setCards] = useState<string[]>([]);
    const [editingIndex,setEditingIndex] = useState<number | null>(null);

    // live search
    useEffect(() => {
        async function fetchCards() {
            let obj = {userId:userId,search:search};
            let js = JSON.stringify(obj);

            try {
                const response = await fetch(buildPath('searchcards'),
                {method:'POST',body:js,headers:{'Content-Type':'application/json'}});

                let res = await response.json();
                setCards(res.results || []);
            }
            catch(error:any) {
                console.error(error);
            }
        }

        fetchCards();
    }, [search]);

    function handleSearchTextChange(e:any):void
    {
        setSearchValue(e.target.value);
    }

    async function addCard():Promise<void>
    {
        let obj = {userId:userId,card:'New Trip'};
        let js = JSON.stringify(obj);

        try
        {
            const response = await fetch(buildPath('addcard'),
            {method:'POST',body:js,headers:{'Content-Type':'application/json'}});

            let res = await response.json();

            if(res.error.length > 0)
                setMessage("API Error: " + res.error);
            else
            {
                setMessage('Trip added');
                setSearchValue(''); // refresh
            }
        }
        catch(error:any)
        {
            setMessage(error.toString());
        }
    }

    function updateCardName(index:number,newName:string)
    {
        const updated = [...cards];
        updated[index] = newName;
        setCards(updated);
        setEditingIndex(null);
    }

    return(
        <div className="cards-page">

            <input
                className="search-bar"
                type="text"
                placeholder="Search Trips..."
                value={search}
                onChange={handleSearchTextChange}
            />

            <div className="grid">
                <div className="card add-card" onClick={addCard}>+ Add Trip</div>
                {cards.map((c, index) => (
                    <div key={index} className="card trip-card">
                        {editingIndex === index ? (
                            <input
                                autoFocus
                                defaultValue={c}
                                onBlur={(e)=>updateCardName(index,e.target.value)}
                                onKeyDown={(e)=>{
                                    if(e.key==='Enter'){
                                        updateCardName(index,(e.target as HTMLInputElement).value);
                                    }
                                }}
                            />
                        ) : (
                            <span onClick={()=>setEditingIndex(index)}>
                                {c}
                            </span>
                        )}
                    </div>
                ))}

            </div>

            <p className="message">{message}</p>

        </div>
    );
}

export default Cards;