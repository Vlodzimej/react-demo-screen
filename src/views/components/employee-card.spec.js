// employee-card.spec.js
import React from 'react';
import renderer from 'react-test-renderer';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import EmployeeCard from './employee-card';
import * as config from '../../config';

configure({ adapter: new Adapter() });

describe('Render EmployeeCard', () => {
    it('render correctly', () => {
        const wrapper = renderer.create(<EmployeeCard />).toJSON();
        expect(wrapper).toMatchSnapshot();
    });

    it('check render elements', () => {
        //const wrapper = shallow(<EmployeeCard />);
    });
});
