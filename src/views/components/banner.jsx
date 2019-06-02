import React, { Component } from 'react';
import * as config from '../../config';

const interval = config.BANNER_INTERVAL;
export default class Banner extends Component {
    constructor(props) {
        super(props);
        this.state = { count: 1, amount: config.BANNER_AMOUNT };
    }

    componentDidMount() {
        this.startTimer();
    }

    startTimer() {
        setInterval(() => {
            this.checkNextImage();
            this.setState({
                count:
                    this.state.count < this.state.amount
                        ? this.state.count + 1
                        : 1,
            });
        }, interval);
    }

    checkNextImage() {
        var img = new Image();
        var that = this;
        img.src = `images/banners/image${this.state.count + 1}.png`;
        img.onerror = function() {
            that.setState({
                count: 1,
                amount: that.state.count,
            });
        };
    }

    render() {
        return (
            <div className="banner">
                <img
                    width={'480px'}
                    src={`images/banners/image${this.state.count}.png`}
                />
            </div>
        );
    }
}
