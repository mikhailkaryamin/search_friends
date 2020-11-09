import React from 'react';
import {
  arrayOf,
  shape,
  string,
  func,
  number
} from 'prop-types';

import {
  Avatar,
  Cell,
  Group,
  List,
  Panel,
  PanelHeaderButton,
  PanelHeader,
} from '@vkontakte/vkui';

import Icon24Filter from '@vkontakte/icons/dist/24/filter';

const formatGender = (gender) => {
  switch (gender) {
    case 1:
      return `жен`;
    case 2:
      return `муж`;
    default:
      return `не определен`;
  }
};

const Home = ({ friendsFiltered, setActiveModal }) => {

  return (
    <Panel>
      <PanelHeader
        left={
          <PanelHeaderButton onClick={() => setActiveModal('filters')}>
            <Icon24Filter />
          </PanelHeaderButton>
        }
      >
        Friends
      </PanelHeader>
      {friendsFiltered && (
        <Group title="Friends list">
          <List>
            {
              friendsFiltered.map((friend, i) => {
                return (
                  <Cell
                    asideContent={`Возраст: ${friend.age}`}
                    before={friend.avatar ? <Avatar src={friend.avatar}/> : null}
                    description={`Пол: ${formatGender(friend.gender)}`}
                    key={`${i}-${friend.id}`}
                    multiline={true}
                  >
                    {`${friend.name} ${friend.lastName}`}
                  </Cell>
                );
              })
            }
          </List>
        </Group>
      )}
    </Panel>
  );
};

Home.propTypes = {
  friendsFiltered: arrayOf(shape({
    age: string | number,
    avatar: string,
    name: string,
    lastName: string,
    id: number,
  })),
  setActiveModal: func.isRequired,
};

export default Home;
