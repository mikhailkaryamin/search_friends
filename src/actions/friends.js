const ActionType = {
  PUSH_FRIENDS: 'PUSH_FRIENDS',
  PUSH_FRIENDS_ID: 'PUSH_FRIENDS_ID',
  SET_FILTERS: 'SET_FILTERS',
};

const ActionCreator = {
  pushFriends: (friends) => ({
    type: ActionType.PUSH_FRIENDS,
    payload: friends,
  }),

  pushFriendsId: (friendsId) => ({
    type: ActionType.PUSH_FRIENDS_ID,
    payload: friendsId,
  }),

  setFilters: (settings) => ({
    type: ActionType.SET_FILTERS,
    payload: settings,
  })
};

export {
  ActionCreator,
  ActionType,
}