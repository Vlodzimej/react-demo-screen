import React, { Component } from 'react';
import { Row, Col } from 'antd';

export default class Weather extends Component {
    render() {
        const { weather, main } = this.props;
        const img = weather && weather[0] && `${weather[0].icon}`;
        return (
            <div>
                {weather !== undefined ? (
                    <Row style={{ marginTop: '32px' }}>
                        <Col
                            span={12}
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}>
                            <div name="icon">
                                <img src={`images/weather/${img}.png`} />
                            </div>
                        </Col>
                        <Col
                            span={12}
                            style={{
                                fontSize: '6em',
                                display: 'flex',
                                justifyContent: 'left',
                            }}>
                            <div name="temp">
                                {main && main.temp > 0 && '+'}
                                {main && main.temp}&#176;
                            </div>
                        </Col>
                        <Col
                            span={24}
                            style={{
                                fontSize: '3em',
                                display: 'flex',
                                justifyContent: 'center',
                                textTransform: 'uppercase',
                            }}>
                            <div name="description">
                                {weather &&
                                    weather[0] &&
                                    weather[0].description}
                            </div>
                        </Col>
                    </Row>
                ) : (
                    <img
                        style={{ width: '150px', height: '150px' }}
                        src={`images/loading_planet.gif`}
                        name='loading'
                    />
                )}
            </div>
        );
    }
}
