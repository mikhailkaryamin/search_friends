import React from 'react';

import FormLayout from '@vkontakte/vkui/dist/components/FormLayout/FormLayout';
import FormLayoutGroup from '@vkontakte/vkui/dist/components/FormLayoutGroup/FormLayoutGroup';
import Radio from '@vkontakte/vkui/dist/components/Radio/Radio';
import Search from '@vkontakte/vkui/dist/components/Search/Search';
import SelectMimicry from '@vkontakte/vkui/dist/components/SelectMimicry/SelectMimicry';

const Filters = () => {
    return (
      <FormLayout>
        <Search
          placeholder="First name"
          onChange={() => {}}
          after={null}
        />
        <Search
          placeholder="Last name"
          onChange={() => {}}
          after={null}
        />
        <SelectMimicry
          top="Выберите возраст"
          placeholder="Не выбран"
        />

        <FormLayoutGroup top="Пол">
          <Radio name="sex" value="male" defaultChecked>Любой</Radio>
          <Radio name="sex" value="male">Мужской</Radio>
          <Radio name="sex" value="female">Женский</Radio>
        </FormLayoutGroup>
      </FormLayout>
    )
};

export default Filters;