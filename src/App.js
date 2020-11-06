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

const ACCESS_TOKEN = '3a37ccad3a37ccad3a37ccada43a4308a533a373a37ccad6593f773c884d7889fcbfb66';
const COUNT_FRIENDS = 10000;
const COUNT_REQUEST_EXECUTE = 25;

const App = () => {
  const [userId, setUserId] = useState(null);
  const [fetchedFriends, setFetchedFriends] = useState(null);
  const [fetchedFriendsId, setFetchedFriendsId] = useState(null);
  const [popout, setPopout] = useState(<ScreenSpinner size='large' />);
  const [activeModal, setActiveModal] = useState(null);

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
      setPopout(null);
    }

    fetchData();
  }, []);


  useEffect(() => {
    async function fetchFriends() {
        if (userId) {
          const authToken = await bridge.send("VKWebAppGetAuthToken", {
            "app_id": 7652360,
            "scope": ""
          });

          const friendsUser = await bridge.send("VKWebAppCallAPIMethod", {
            "method": "friends.get",
            "request_id": "friends_current_user",
            "params": {
              "user_id": userId,
              "v":"5.124", 
              "access_token": ACCESS_TOKEN,
              "fields": "first_name, last_name, sex, bdate, photo_100",
            }
          })

          setFetchedFriends(friendsUser.response.items);

        // Превышен лимит execute
        
        //   const isNotEmptyFriendsList = friendsUser.response.items.length;

        //   if (isNotEmptyFriendsList) {
        //     const friendsList = friendsUser.response.items;
        //     const friendsListString = friendsList.slice(0, COUNT_REQUEST_EXECUTE).join();
        //     console.log(friendsListString)
        //     const friendsFetched = await bridge.send("VKWebAppCallAPIMethod", {
        //       "method": "execute",
        //       "request_id": "friends",
        //       "params": {
        //         "code":  `var friends = [${friendsListString}];
        //                   var fetchedFriends = [];
        //                   var count = 0;
        //                   while (count < 25) {
        //                     var fetchedFriend = API.friends.get({
        //                       "user_id": friends[count],
        //                       "fields": "first_name, last_name, sex, bdate, photo_100",
        //                     });
                        
        //                     count = count + 1;
        //                     fetchedFriends.push(fetchedFriend.items);
        //                   };
        //                   return fetchedFriends;`,
        //         "v":"5.124", 
        //         "access_token": authToken.access_token,
        //   }});

        //   console.log(friendsFetched)
        // }
      }
    }

    fetchFriends();
  }, [userId])

  return (
    <View
      modal={modal}
      popout={popout}
    >
      <Home
        onOpenModal={setActiveModal}
        fetchedFriends={fetchedFriends}
      />
    </View>
  );
}

export default App;

