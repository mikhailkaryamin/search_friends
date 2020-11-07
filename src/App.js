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

import Home from './panels/Home';
import Filters from './panels/Filters';

const ACCESS_TOKEN = '';
const COUNT_FRIENDS = 1500;
const COUNT_REQUEST_EXECUTE = 10;

const timeoutPromise = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

const App = () => {
  const [userId, setUserId] = useState(null);
  const [friendsCurrentUser, setFriendsCurrentUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendsId, setIdFriends] = useState([]);
  const [fetchedUsers, setFetchedUsers] = useState([]);
  const [popout, setPopout] = useState(<ScreenSpinner size='large' />);
  const [activeModal, setActiveModal] = useState(null);

  const getFriends = async (friendsUser, authToken) => {

    const activeFriends = friendsUser.filter((friend) => {
      if (!friend.hasOwnProperty('deactivated')) {
        return friend;
      }
    });

    const friendsId = activeFriends.map((friend) => {
      return friend.id;
    })

    let startSlice = 0;
    let finishSlice = COUNT_REQUEST_EXECUTE;

    const uniqueId = [];
    const uniqueFriends = [];

    while (uniqueId.length < COUNT_FRIENDS) {
      if (finishSlice > friendsId.length) {
        finishSlice = friendsId.length - 1;
      }
      const friendsListString = friendsId.slice(startSlice, finishSlice).join();
      await timeoutPromise(335);
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

      setIdFriends(uniqueId);

      if (startSlice > finishSlice) {
        break;
      }
    }

    return uniqueFriends;
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

        <Filters />

      </ModalPage>
    </ModalRoot>
  )
  useEffect(() => {
    bridge.subscribe(({ detail: { type, data }}) => {
      if (type === 'VKWebAppUpdateConfig') {
        const schemeAttribute = document.createAttribute('scheme');
        schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
        document.body.attributes.setNamedItem(schemeAttribute);
      }
    });
  
    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo');
      setUserId(user.id);
      setFetchedUsers(fetchedUsers.concat([user.id]));
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchFriendsUser() {
      if (userId) {
        const friendsUser = await bridge.send("VKWebAppCallAPIMethod", {
          "method": "friends.get",
          "request_id": "friends_current_user",
          "params": {
            "user_id": userId,
            "v":"5.124", 
            "access_token": ACCESS_TOKEN,
            "fields": "first_name, last_name, sex, bdate, photo_100",
          }
        });
  
        setFriendsCurrentUser(friendsUser)
      }
    }

    fetchFriendsUser()
  }, [userId, friends])


  useEffect(() => {
    async function fetchFriends() {
      const authToken = await bridge.send("VKWebAppGetAuthToken", {
        "app_id": 7652360,
        "scope": ""
      });

      if (friendsCurrentUser) {
        if (friendsCurrentUser.response.items.length) {
          const fetchFriends = await getFriends(friendsCurrentUser.response.items, authToken);
          setFriends(fetchFriends.slice(0, COUNT_FRIENDS));
  
          setPopout(null);
        }
      }
    }

    fetchFriends();
  }, [friendsCurrentUser])

  return (
    <View
      modal={modal}
      popout={popout}
    >
      <Home
        onOpenModal={setActiveModal}
        friends={friends}
      />
    </View>
  );
}

export default App;

