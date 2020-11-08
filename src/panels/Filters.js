import React, { useState } from 'react';
import { useDispatch } from "react-redux";
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
}

const Filters = ({ setActiveModal }) => {
    const [age, setAge] = useState(null);
    const [gender, setGender] = useState(null);
    const [lastName, setLastName] = useState(null);
    const [name, setName] = useState(null);

    const dispatch = useDispatch();

    return (
      <FormLayout>
        <Search
          placeholder="Имя"
          onChange={(evt) => setName(evt.target.value)}
          after={null}
        />
        <Search
          placeholder="Фамилия"
          onChange={(evt) => setLastName(evt.target.value)}
          after={null}
        />

        <Select
          top="Возраст"
          placeholder="Не выбран"
          onChange={(evt) => setAge(evt.target.value)}
        >
          {getAgeList()}
        </Select>
        <FormLayoutGroup top="Пол">
          <Select
            onChange={(evt) => setGender(evt.target.value)}
            placeholder="Не выбран"
          >
            <option value="1">Женский</option>
            <option value="2">Мужской</option>
          </Select>
        </FormLayoutGroup>
        <Button
          size="xl"
          onClick={(evt) => {
            setActiveModal(null)
            dispatch(ActionFriends.setFilters({
              age,
              gender,
              lastName,
              name,
            }))
          }}
        >
          Отфильтровать
        </Button>
      </FormLayout>
    )
};

Filters.propTypes = {
  setActiveModal: func.isRequired,
}

export default Filters;