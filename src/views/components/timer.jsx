import React, { Component } from 'react';

export default class Timer extends Component {
    constructor(props) {
        super(props);
        this.state = { date: new Date() };
    }

    componentDidMount() {
        setInterval(() => this.setState({ date: new Date() }), 1000);
    }

    render() {
        const { date } = this.state;
        return (
            <div style={{ fontSize: '9em' }}>
                {date !== undefined &&
                    date.toLocaleTimeString().slice(0, 5)}
            </div>
        );
    }
}
