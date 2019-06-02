import React, { Component } from 'react';
import { Layout, Row, Col } from 'antd';
import Timer from '../components/timer';
import Weather from '../components/weather';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../store/actions';
import CurrentDate from '../components/current-date';
import Player from '../components/player';
import Banner from '../components/banner';
import Events from '../components/events';

class Main extends Component {
    componentDidMount() {
        this.props.initialPlayer();
        this.props.fetchWeather();
        this.props.getLastEvent();

    }

    handleRemoveEvent(eventId) {
        this.props.removeEvent(eventId);
    }

    render() {
        const { weatherData, events, settings } = this.props.globalState;
        return (
            <Layout style={{ height: '100%', flexDirection: 'row' }}>
                <div
                    style={{
                        zIndex: '1',
                        width: '480px',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backgroundColor: '#f2f2f2',
                    }}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '300px',
                        }}>
                        <Timer />
                        <CurrentDate />
                    </div>
                    <div
                        style={{
                            height: '600px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                        <Banner />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            height: '400px',
                        }}>
                        <Weather {...weatherData} />
                    </div>
                </div>
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'black',
                    }}>
                    <Events
                        data={events}
                        onRemoveEvent={eventId => this.handleRemoveEvent(eventId)}
                    />
                    <Row style={{ height: '100%', zIndex: '0' }}>
                        <Col
                            span={24}
                            style={{ height: '100%', width: '100%' }}>
                            <Player streamUrl={settings.streamUrl} />
                        </Col>
                    </Row>
                </div>
            </Layout>
        );
    }
}
const mapStateToProps = state => ({ globalState: state.globalState });

const matchDispatchToProps = dispatch => ({
    initialPlayer: () => dispatch(actions.initialPlayer()),
    fetchWeather: () => dispatch(actions.fetchWeather()),
    getLastEvent: () => dispatch(actions.getLastEvent()),
    removeEvent: (eventId) => dispatch(actions.removeEvent(eventId)),
});

export default connect(
    mapStateToProps,
    matchDispatchToProps
)(Main);
