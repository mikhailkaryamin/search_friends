import React, { useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { func } from 'prop-types';
import {
  Button,
  FormLayout,
  FormLayoutGroup,
  Select,
  Search,
} from '@vkontakte/vkui';

import { ActionCreator as ActionFriends } from '../actions/friends';

const getAgeList = () => {
  const list = new Array(99).fill(``).map((el, i) => {
    return (
      <option
        key={i}
        value={i + 1}
      >
        {i + 1}
      </option>
    )
  });
  return list;
};

const Filters = ({ setActiveModal }) => {
  const filters = useSelector((state) => state.filters, shallowEqual);

  const [age, setAge] = useState(filters.age);
  const [gender, setGender] = useState(filters.gender);
  const [lastName, setLastName] = useState(filters.lastName);
  const [name, setName] = useState(filters.name);

  const dispatch = useDispatch();

  return (
    <FormLayout>
      <Search
        placeholder="Имя"
        onChange={(evt) => setName(evt.target.value)}
        after={null}
        defaultValue={filters.name}
      />
      <Search
        placeholder="Фамилия"
        onChange={(evt) => setLastName(evt.target.value)}
        after={null}
        defaultValue={filters.lastName}
      />

      <Select
        top="Возраст"
        placeholder="Не выбран"
        onChange={(evt) => setAge(evt.target.value)}
        defaultValue={filters.age}
      >
        {getAgeList()}
      </Select>
      <FormLayoutGroup top="Пол">
        <Select
          onChange={(evt) => setGender(evt.target.value)}
          placeholder="Не выбран"
          defaultValue={filters.gender}
        >
          <option value="1">Женский</option>
          <option value="2">Мужской</option>
        </Select>
      </FormLayoutGroup>
      <Button
        size="xl"
        onClick={() => {
          setActiveModal(null);
          dispatch(ActionFriends.setFilters({
            age,
            gender,
            lastName,
            name,
          }));
        }}
      >
        Отфильтровать
      </Button>
    </FormLayout>
  );
};

Filters.propTypes = {
  setActiveModal: func.isRequired,
};

export default Filters;
