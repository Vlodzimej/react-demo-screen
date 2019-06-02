import React, { Component } from 'react';

export default class CurrentDate extends Component {
    constructor(props) {
        super(props);
        this.state = { date: new Date() };
    }
    render() {
        const options = {
            month: 'long',
            day: 'numeric',
            weekday: 'long',
        };
        const { date } = this.state;
        return (
            <div style={{ 
              fontSize: '1.8em', textTransform: 'uppercase' }}>
                {date.toLocaleDateString('ru', options)}
            </div>
        );
    }
}
