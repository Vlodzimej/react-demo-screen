import React, { Component } from 'react';
import EmployeeCard from './employee-card';
import * as config from '../../config';

export default class Events extends Component {
    handleRemoveEvent(eventId) {
        console.log('REMOVE_EVENT', eventId);
        this.props.onRemoveEvent(eventId);
    }
    render() {
        const { data } = this.props;
        const employeeCards =
            data && data.length > 0
                ? data.map((e, i) => {
                      return e &&
                    /*
                          e.eventMsg == config.EVENT_CODE &&
                          e.eventObject &&  
                    */
                          e.eventObject.id == config.MEDIA_CHANNEL_ID &&
                          e.eventAbonent ? (
                          <EmployeeCard onRemoveEvent={(eventId) => this.handleRemoveEvent(eventId)} data={e} key={i}/>
                      ) : (
                          ''
                      );
                  })
                : '';
        return (
            <div
                style={{
                    width: '100%',
                    position: 'absolute',
                    zIndex: '2',
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-start',
                    alignItems: 'baseline',
                    alignContent: 'flex-end',
                }}>
                {employeeCards}
            </div>
        );
    }
}
