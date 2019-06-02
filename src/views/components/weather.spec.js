// weather.spec.js
import React from 'react';
import renderer from 'react-test-renderer';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Weather from './weather';
import * as config from '../../config';

configure({ adapter: new Adapter() });

describe('Render Weather', () => {

    it('render correctly', () => {
        const wrapper = renderer.create(<Weather {...weatherData}/>).toJSON();
        expect(wrapper).toMatchSnapshot();
    });

    it('render without props', () => {
        const wrapper = renderer.create(<Weather />).toJSON();
        expect(wrapper).toMatchSnapshot();
    });

    it('check elements', () => {
        const wrapper = shallow(<Weather {...weatherData}/>);

        const icon = wrapper.find("[name='icon']");
        const temp = wrapper.find("[name='temp']");
        const description = wrapper.find("[name='description']");

        expect(icon).toHaveLength(1);
        expect(temp).toHaveLength(1);
        expect(description).toHaveLength(1);

        const tempText = `+${weatherData.main.temp}°`;
        expect(temp.text()).toEqual(tempText);

        const descriptionText = weatherData.weather[0].description;
        expect(description.text()).toEqual(descriptionText);
    })

    it('check elements without props', () => {
        const wrapper = shallow(<Weather />);
        expect(wrapper.find("img[name='loading']")).toHaveLength(1);
    });
});

const weatherData = {
    coord: { lon: 36.28, lat: 54.53 },
    weather: [
        { id: 500, main: 'Rain', description: 'легкий дождь', icon: '10d' },
    ],
    base: 'stations',
    main: {
        temp: 16,
        pressure: 1018,
        humidity: 93,
        temp_min: 16,
        temp_max: 16,
    },
    visibility: 10000,
    wind: { speed: 2, deg: 330 },
    clouds: { all: 90 },
    dt: 1557918000,
    sys: {
        type: 1,
        id: 9017,
        message: 0.0054,
        country: 'RU',
        sunrise: 1557883822,
        sunset: 1557941534,
    },
    id: 553915,
    name: 'Kaluga',
    cod: 200,
};
