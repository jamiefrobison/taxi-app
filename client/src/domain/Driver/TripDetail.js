import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';

import * as ROLES from 'constants/roles';
import {
  withAuthorization,
  withTripValidator,
} from 'components/Session';
import { withWebSocket } from 'components/WebSocket';
import { withServerConsumer } from 'services/server';

const TripDetail = ({ access, serverAPI, location, match, ws }) => {
  const { id } = match.params;
  const [trip, setTrip] = React.useState(location?.state);

  React.useEffect(() => {
    if (!trip) {
      serverAPI
        .dofetchTrip(id, access)
        .then((resp) => {
          setTrip(resp.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [access, serverAPI, id, trip]);

  const handlePickUp = (event) => {
    ws.next({
      type: 'accept.pickup',
      data: {
        id: trip.id,
      },
    });

    event.preventDefault();
  };

  return (
    <>
      <div className="card col-sm-6">
        <h5 className="card-header">Requested Trip</h5>
        <div className="card-body">
          <ul className="list-group list-group-flush">
            <li className="list-group-item" key={trip?.id}>
              <h5 className="card-title">{trip?.rider.fullname}</h5>
              <p className="card-text">
                Pick up Address:&nbsp;
                {trip?.pick_up_address}
              </p>
              <p className="card-text">
                Drop off Address:&nbsp;
                {trip?.drop_off_address}
              </p>
              <p className="card-text">{trip?.status}</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePickUp}
              >
                Drive To Pick Up
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

TripDetail.propTypes = {
  access: PropTypes.string,
  serverAPI: PropTypes.shape({
    dofetchTrip: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    state: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  ws: PropTypes.objectOf(
    PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.array,
      PropTypes.object,
    ]),
  ),
};

TripDetail.defaultProps = {
  access: null,
  ws: null,
};

const mapStateToProps = (state) => ({
  access: state.sessionState.authUser.access,
});

const roleValidator = (userrole) => userrole === ROLES.DRIVER;

const tripValidator = (currenttrip) => !!currenttrip;

export default compose(
  withAuthorization(roleValidator),
  withTripValidator(tripValidator),
  withWebSocket,
  withServerConsumer,
  connect(mapStateToProps),
)(TripDetail);
