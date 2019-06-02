// current-date.spec.js
import React from 'react';
import renderer from 'react-test-renderer';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CurrentDate from './current-date';
import * as config from '../../config';

jest.useFakeTimers();

configure({ adapter: new Adapter() });

describe('Render CurrentDate', () => {
    const mockedDate = new Date('2019-05-15T16:38:20')
    const originalDate = Date

    global.Date = jest.fn(() => mockedDate)
    global.Date.setDate = originalDate.setDate
    it('render correctly', () => {
        const wrapper = renderer.create(<CurrentDate />).toJSON();
        expect(wrapper).toMatchSnapshot();
    });

    it('check render elements', () => {
        const options = {
            month: 'long',
            day: 'numeric',
            weekday: 'long',
        };
        const date = new Date('2019-05-15T16:38:20').toLocaleDateString('ru', options);
        const wrapper = shallow(<CurrentDate />);
        const element = wrapper.find('div');
        expect(element).toHaveLength(1);
        expect(element.text()).toEqual(date);
    });
});
