import React from 'react';
import { arrayOf, shape, string, func } from 'prop-types';

import Avatar from '@vkontakte/vkui/dist/components/Avatar/Avatar';
import Cell from '@vkontakte/vkui/dist/components/Cell/Cell';
import Group from '@vkontakte/vkui/dist/components/Group/Group';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeaderButton from '@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';

import Icon24Filter from '@vkontakte/icons/dist/24/filter';

const Home = ({ friends, onOpenModal }) => {
  return (
    <Panel>
      <PanelHeader>
        Friends
      </PanelHeader>
      <PanelHeaderButton onClick={() => onOpenModal("filters")}>
        <Icon24Filter />
      </PanelHeaderButton>
      {friends && (
        <Group title="Friends list">
          {
            friends.map((friend, i) => {
              return (
                <Cell
                  key={`${i}-${friend.id}`}
                  before={friend['photo_100'] ? <Avatar src={friend['photo_100']}/> : null}
                >
                  {`${friend['first_name']} ${friend['last_name']}`}
                </Cell>
              )
            })
          }
        </Group>
      )}
  </Panel>
  )
};

Home.propTypes = {
  friends: arrayOf(shape({
    photo_100: string,
    first_name: string,
    last_name: string,
  })),
  onOpenModal: func.isRequired,
};

export default Home;
