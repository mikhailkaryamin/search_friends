import { createSelector } from 'reselect';

const getFilteredFriendsList = (friends, setting) => {
  const {
    age,
    gender,
    lastName,
    name,
  } = setting;

  const filteredFriends = friends.filter((friend) => {
    const isMatch = [true, true, true, true]

    if (age) {
      isMatch[0] = friend.age === +age;
    }

    if (gender) {
      isMatch[1] = friend.gender === +gender;
    }

    if (lastName) {
      isMatch[2] = friend.lastName === lastName;
    }

    if (name) {
      isMatch[3] = friend.name === name;
    }

    return !isMatch.includes(false);
  });

  return filteredFriends;
};

const filtersSelector = (state) => state.filters;
const friendsSelector = (state) => state.friends;

const getFilteredFriends = createSelector(
    friendsSelector,
    filtersSelector,

    (friends, filters) => {
      return getFilteredFriendsList(friends, filters);
    }
);
export {
  getFilteredFriends,
};
