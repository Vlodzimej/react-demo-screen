// banner.spec.js
import React from 'react';
import renderer from 'react-test-renderer';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Banner from './banner';
import * as config from '../../config';
configure({ adapter: new Adapter() });

jest.useFakeTimers();

describe('Render Banner', () => {
    it('render correctly', () => {
        const wrapper = renderer.create(<Banner />).toJSON();
        expect(wrapper).toMatchSnapshot();
    });

    it('check render elements', () => {
        const wrapper = shallow(<Banner />);
        expect(wrapper.find('div')).toHaveLength(1);
        expect(wrapper.find('img')).toHaveLength(1);
    });

    it('check banner switching', () => {
        const wrapper = shallow(<Banner />);
        expect(wrapper.state().count).toEqual(1);
        jest.advanceTimersByTime(config.BANNER_INTERVAL*2);
        expect(wrapper.state().count).toEqual(3);
    });

    it('check banner count controling', () => {
        const wrapper = shallow(<Banner />);
        wrapper.setState({ count: 1, amount: 5 });
        expect(wrapper.state().count).toEqual(1);
        jest.advanceTimersByTime(config.BANNER_INTERVAL*5);
        expect(wrapper.state().count).toEqual(1);
    });    
});
