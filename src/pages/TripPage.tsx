import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import Trips from '../components/Trips';

const TripPage = () =>
{
    return(
        <div>
            <PageTitle />
            <LoggedInName />
            <Trips />
        </div>
    );
}

export default TripPage;
