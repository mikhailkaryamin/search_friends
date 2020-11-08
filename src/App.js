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

import Home from './panels/Home';
import Filters from './panels/Filters';

const ACCESS_TOKEN = '';
const COUNT_FRIENDS = 1000;
const COUNT_REQUEST_EXECUTE = 25;

const checkActiveFriend = (friend) => {
  if (!friend.hasOwnProperty('deactivated') && !friend['is_closed']) {
    return true;
  }

  return false;
};

const timeoutPromise = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

const App = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [friendsUser, setFriendsUser] = useState(null);
  const [popout, setPopout] = useState(<ScreenSpinner size='large' />);
  const [userId, setUserId] = useState(null);

  const dispatch = useDispatch();

  const friends = useSelector((state) => state.friends, shallowEqual);
  const friendsFiltered = useSelector((state) => state.friendsFiltered, shallowEqual);
  const idFriends = useSelector((state) => state.idFriends, shallowEqual);

  const getFriendsFriends = async (friendsUser, authToken) => {
    const filterFriends = friendsUser.filter((friend) => {
      return checkActiveFriend(friend);
    });


    const activeFriendsId = filterFriends.map((friend) => {
      return friend.id;
    })

    let startSlice = 0;
    let finishSlice = COUNT_REQUEST_EXECUTE;

    const uniqueId = idFriends.slice();
    const uniqueFriends = [];

    while (uniqueId.length < COUNT_FRIENDS) {
      if (finishSlice > activeFriendsId.length) {
        finishSlice = activeFriendsId.length - 1;
      }

      const friendsListString = activeFriendsId.slice(startSlice, finishSlice).join();

      if (uniqueId.length !== 1) {
        await timeoutPromise(335)
      };

      startSlice += COUNT_REQUEST_EXECUTE;
      finishSlice += COUNT_REQUEST_EXECUTE;

      const friendsFetched = await bridge.send("VKWebAppCallAPIMethod", {
        "method": "execute",
        "request_id": "friends",
        "params": {
          "code":  `var friends = [${friendsListString}];
                    var fetchedFriends = [];
                    var count = 0;
                    while (count < 25) {
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

      friendsFetched.response.flat().forEach((friend) => {
        if(!uniqueId.includes(friend.id)) {
          uniqueId.push(friend.id);
          uniqueFriends.push(friend);
        }
      })

      if (startSlice > finishSlice) {
        break;
      }
    }

    dispatch(ActionFriends.pushFriendsId(uniqueId))

    return uniqueFriends;
  }

  const getFriendsUser = async (id) => {
    if (id) {
      const friendsUser = await bridge.send("VKWebAppCallAPIMethod", {
        "method": "friends.get",
        "request_id": "friends_current_user",
        "params": {
          "user_id": id,
          "v":"5.124", 
          "access_token": ACCESS_TOKEN,
          "fields": "first_name, last_name, sex, bdate, photo_100",
        }
      });

      setFriendsUser(friendsUser)
    }
  }

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
  )
  
  useEffect(() => {
    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo');
      setUserId(user.id);
      dispatch(ActionFriends.pushFriendsId([user.id]))
    }

    fetchData();
  }, []);

  useEffect(() => {
    function fetchFriendsUser() {
      if (userId) {
        getFriendsUser(userId);
      }
    }

    fetchFriendsUser()
  }, [userId])

  useEffect(() => {
    async function setNextUser() {
      if (friends.length < COUNT_FRIENDS) {
          setUserId((prevUserId) => {
            const indexPrevUser = friends.findIndex((friend) => friend.id === prevUserId);

            const nextId = friends.findIndex((friend, i) => {
              return (
                checkActiveFriend(friend) && indexPrevUser < i
              )
            })

            if (nextId > friends.length || nextId === -1) {
              return prevUserId;
            } else {
              return friends[nextId].id;
            }
          });
      }

      await timeoutPromise(350);
    }

    setNextUser()
  }, [friends])

  useEffect(() => {
    async function fetchFriends() {
      if (friendsUser) {
        const authToken = await bridge.send("VKWebAppGetAuthToken", {
          "app_id": 7652360,
          "scope": ""
        });

        if (friendsUser.response.items.length) {
          const fetch = await getFriendsFriends(friendsUser.response.items, authToken);

          const renderFriends = fetch.slice(0, COUNT_FRIENDS - friends.length);
          dispatch(ActionFriends.pushFriends(renderFriends));
          setPopout(null);
        }
      }
    }

    fetchFriends();
  }, [friendsUser])


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
}

export default App;

