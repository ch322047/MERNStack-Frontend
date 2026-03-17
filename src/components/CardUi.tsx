import { useState } from 'react';

function CardUI()
{
    function buildPath(route:string) : string
    {
        return `http://localhost:5001/${route}`;
    }

    let _ud : any = localStorage.getItem('user_data');
    let ud = _ud ? JSON.parse(_ud) : { id: -1 };
    let userId : string = ud.id;

    const [message,setMessage] = useState('');
    const [searchResults,setResults] = useState('');
    const [cardList,setCardList] = useState('');
    const [search,setSearchValue] = useState('');
    const [card,setCardNameValue] = useState('');

    function handleSearchTextChange(e:any):void
    {
        setSearchValue(e.target.value);
    }

    function handleCardTextChange(e:any):void
    {
        setCardNameValue(e.target.value);
    }

    async function addCard(e:any):Promise<void>
    {
        e.preventDefault();

        let obj = {userId:userId,card:card};
        let js = JSON.stringify(obj);

        try
        {
            const response = await fetch(buildPath('api/addcard'),
            {method:'POST',body:js,headers:{'Content-Type':'application/json'}});

            let res = await response.json();

            if(res.error.length > 0)
                setMessage("API Error: " + res.error);
            else
                setMessage('Card has been added');
        }
        catch(error:any)
        {
            setMessage(error.toString());
        }
    }

    async function searchCard(e:any):Promise<void>
    {
        e.preventDefault();

        let obj = {userId:userId,search:search};
        let js = JSON.stringify(obj);

        try
        {
            const response = await fetch(buildPath('api/searchcards'),
            {method:'POST',body:js,headers:{'Content-Type':'application/json'}});

            let res = await response.json();
            let results = res.results;

            let resultText = results.join(', ');

            setResults('Card(s) retrieved');
            setCardList(resultText);
        }
        catch(error:any)
        {
            setResults(error.toString());
        }
    }

    return(
        <div id="cardUIDiv">

          <br/>

          Search:
          <input type="text" placeholder="Card To Search For" onChange={handleSearchTextChange}/>
          <button onClick={searchCard}>Search Card</button>

          <br/>

          <span>{searchResults}</span>

          <p>{cardList}</p>

          <br/><br/>

          Add:
          <input type="text" placeholder="Card To Add" onChange={handleCardTextChange}/>
          <button onClick={addCard}>Add Card</button>

          <br/>

          <span>{message}</span>

        </div>
    );
}

export default CardUI;