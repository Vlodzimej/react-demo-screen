import React, { Component } from 'react';
import { Card } from 'antd';
import * as config from '../../config';

const interval = config.EMPLOYEE_CARD_LIFETIME;
const { Meta } = Card;

export default class EmployeeCard extends Component {
    componentDidMount() {
        const { id } = this.props.data ? this.props.data : { id: '' };
        this.setState({
            timer: setInterval(() => {
                this.props.onRemoveEvent(id);
                clearInterval(this.state.timer);
            }, interval),
        });
    }

    render() {
        if (!this.props.data) return (<div></div>);
        const {
            eventStation,
            eventImage,
            eventAbonent,
            eventFaceRect,
        } = this.props.data;

        const faceRect =
            eventFaceRect != undefined ? eventFaceRect : { top: 0, left: 0 };

        const abonent = eventAbonent != undefined ? eventAbonent : { name: '' };

        const imageUrl = `${
            config.ID_SERVER_URL
        }/BioxidServer/photo?stationId=${eventStation}&imageFile=${eventImage}`;

        return (
            <Card
                size={'small'}
                hoverable
                style={{ width: 250, margin: '15px' }}
                cover={
                    <div
                        style={{ width: 250, height: 250, overflow: 'hidden' }}>
                        <img
                            alt={eventImage}
                            src={imageUrl}
                            style={{
                                marginTop: -(faceRect.top - 100),
                                marginLeft: -(faceRect.left - 100),
                            }}
                        />
                    </div>
                }>
                <Meta title={abonent.name} />
            </Card>
        );
    }
}
