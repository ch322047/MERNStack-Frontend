function LoggedInName()
{
    function getCurrentUserName() {
        var data;
        data = JSON.parse(localStorage.getItem('user_data') || '');
        return data.firstName + ' ' + data.lastName;
    }
    function doLogout(event:any) : void
    {
	    event.preventDefault();
        localStorage.removeItem('user_data');
        window.location.href = '/';
    };    

    return(
      <div id="loggedInDiv">
        <span id="userName">Welcome, {getCurrentUserName()}</span><br />
        <button type="button" id="logoutButton" className="confirm-btn" 
           onClick={doLogout}> Log Out </button>
      </div>
    );
};

export default LoggedInName;