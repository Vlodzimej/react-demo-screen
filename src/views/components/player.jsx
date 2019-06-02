import React, { Component } from 'react';
import $ from 'jquery';
import '../../external/m7-player/js/m7-player';
import * as config from '../../config';

export default class Player extends Component {
    constructor(props) {
        super(props);
        this.state = { playerLoaded: false };
    }
    componentDidMount() {
        this.initPlayer();
    }
    componentDidUpdate() {
        this.initPlayer();
    }

    initPlayer() {
        const { streamUrl } = this.props;
        if (streamUrl == '') return;
        if (!this.state.playerLoaded) {
            console.log('INIT PLAYER', streamUrl);
            this.$element = $(this.element);
            const that = this;
            this.$element.m7Player({
                analytics: false,
                autoplay: true,
                delayControl: 0.8,
                controls: false,
                retryOnError: true,
                baseRetryDelay: 5,
                watchdogTimeout: 10000,
                retryCallback: function() {
                    that.$element.m7Player('src', {
                        src: streamUrl,
                        mime: 'algont/mse',
                    });
                },
                src: {
                    src: streamUrl,
                    mime: 'algont/mse',
                },
            });
            $('.m7PlayerHtml5').outerHeight('100%');
            this.setState({ playerLoaded: true });
        }
    }

    render() {
        return (
            <div
                style={{ width: '100%', height: '100%' }}
                ref={element => (this.element = element)}
            />
        );
    }
}
