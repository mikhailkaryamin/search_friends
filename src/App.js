import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';

import Icon24Cancel from '@vkontakte/icons/dist/24/cancel';
import ModalPage from '@vkontakte/vkui/dist/components/ModalPage/ModalPage';
import ModalPageHeader from '@vkontakte/vkui/dist/components/ModalPageHeader/ModalPageHeader';
import ModalRoot from '@vkontakte/vkui/dist/components/ModalRoot/ModalRoot';
import PanelHeaderButton from '@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import View from '@vkontakte/vkui/dist/components/View/View';
import '@vkontakte/vkui/dist/vkui.css';
import {
  useDispatch,
  useSelector,
  shallowEqual
} from "react-redux";
import { ActionCreator as ActionFriends } from './actions/friends';
import { getFilteredFriends } from './reducer/selector';

import Home from './panels/Home';
import Filters from './panels/Filters';

const APP_ID = 7652360;
const ACCESS_TOKEN = '';
const COUNT_FRIENDS = 1000;
const COUNT_REQUEST_EXECUTE = 25;

const checkActiveFriend = (friend) => {
  if (friend.hasOwnProperty('deactivated') || friend['is_closed']) {
    return false;
  }

  return true;
};

const timeoutPromise = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

const App = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [friendsUser, setFriendsUser] = useState(null);
  const [popout, setPopout] = useState(<ScreenSpinner size='large' />);
  const [userId, setUserId] = useState(null);

  const dispatch = useDispatch();

  const friends = useSelector((state) => state.friends, shallowEqual);
  const friendsFiltered = useSelector((state) => getFilteredFriends(state), shallowEqual);
  const idFriends = useSelector((state) => state.idFriends, shallowEqual);

  const getFriendsFriends = async () => {
    const authToken = await bridge.send("VKWebAppGetAuthToken", {
      "app_id": APP_ID,
      "scope": ""
    });

    const activeFriends = friendsUser.response.items.filter((friend) => {
      return checkActiveFriend(friend);
    });

    const activeFriendsId = activeFriends.map((friend) => {
      return friend.id;
    });

    let startSlice = 0;
    let finishSlice = COUNT_REQUEST_EXECUTE;

    const uniqueIds = idFriends.slice();
    const uniqueFriends = [];

    while (uniqueIds.length <= COUNT_FRIENDS) {
      if (finishSlice > activeFriendsId.length) {
        finishSlice = activeFriendsId.length - 1;
      }

      const friendsListIdString = activeFriendsId.slice(startSlice, finishSlice).join();

      if (uniqueIds.length !== 1) {
        await timeoutPromise(335);
      }

      startSlice += COUNT_REQUEST_EXECUTE;
      finishSlice += COUNT_REQUEST_EXECUTE;

      const fetchedFriends = await bridge.send("VKWebAppCallAPIMethod", {
        "method": "execute",
        "request_id": "friends",
        "params": {
          "code":  `var friends = [${friendsListIdString}];
                    var fetchedFriends = [];
                    var count = 0;
                    while (count < ${COUNT_REQUEST_EXECUTE}) {
                      var fetchedFriend = API.friends.get({
                        "user_id": friends[count],
                        "fields": "first_name, last_name, sex, bdate, photo_100",
                      });
                  
                      count = count + 1;
                      fetchedFriends.push(fetchedFriend.items);
                    };
                    return fetchedFriends;`,
          "v":"5.124",
          "access_token": authToken.access_token,
        }});

      fetchedFriends.response.flat().forEach((friend) => {
        if (!uniqueIds.includes(friend.id) && checkActiveFriend(friend)) {
          uniqueIds.push(friend.id);
          uniqueFriends.push(friend);
        }
      });

      if (startSlice > finishSlice) {
        break;
      }
    }

    return {
      uniqueFriends,
      uniqueIds,
    };
  };

  const modal = (
    <ModalRoot activeModal={activeModal}>
      <ModalPage
        id="filters"
        onClose={() => {}}
        header={
          <ModalPageHeader
            left={<PanelHeaderButton onClick={() => setActiveModal(null)}>
              <Icon24Cancel />
            </PanelHeaderButton>}
          >
            Фильтры
          </ModalPageHeader>
        }
      >

        <Filters
          setActiveModal={setActiveModal}
        />

      </ModalPage>
    </ModalRoot>
  );

  useEffect(() => {
    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo');
      setUserId(user.id);
      dispatch(ActionFriends.pushFriendsId([user.id]));
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchFriendsUser() {
      if (userId) {
        const currentFriends = await bridge.send("VKWebAppCallAPIMethod", {
          "method": "friends.get",
          "request_id": "friends_current_user",
          "params": {
            "user_id": userId,
            "v":"5.124",
            "access_token": ACCESS_TOKEN,
            "fields": "first_name, last_name, sex, bdate, photo_100",
          }
        });

        setFriendsUser(currentFriends);
      }
    }

    fetchFriendsUser();
  }, [userId]);

  useEffect(() => {
    async function setNextUser() {
      if (friends.length < COUNT_FRIENDS) {
        setUserId((prevUserId) => {
          const indexPrevUser = friends.findIndex((friend) => friend.id === prevUserId);

          const nextId = friends.findIndex((friend, i) => {
            return indexPrevUser < i;
          });

          if (nextId === -1) {
            return prevUserId;
          } else {
            return friends[nextId].id;
          }
        });
      }

      await timeoutPromise(350);
    }

    setNextUser();
  }, [friends]);

  useEffect(() => {
    async function fetchFriends() {
      if (friendsUser) {
        if (friendsUser.response.items.length) {
          const finishSlice = COUNT_FRIENDS - friends.length + 1;
          const fetch = await getFriendsFriends();
          const renderFriends = fetch[`uniqueFriends`].slice(0, finishSlice);
          const ids = fetch[`uniqueIds`].slice(0, finishSlice);
          dispatch(ActionFriends.pushFriends(renderFriends));
          dispatch(ActionFriends.pushFriendsId(ids));
          setPopout(null);
        }
      }
    }

    fetchFriends();
  }, [friendsUser]);


  return (
    <View
      modal={modal}
      popout={popout}
    >
      <Home
        setActiveModal={setActiveModal}
        friendsFiltered={friendsFiltered}
      />
    </View>
  );
};

export default App;
