import { ActionType } from '../actions/friends';

const YEARS_FROM_1970 = 50;
const DAYS_IN_YEAR = 365.24;
const MS_IN_DAY = 86400000;

const getAge = (date) => {
  if (!date) {
    return `не определен`;
  }

  const dateArr = date.split(`.`);
  const formatDate = dateArr.reverse().join(`-`);

  if (dateArr.length <= 2) {
    return `не определен`;
  } else {
    let dateCon = Math.floor((+(Date.parse(formatDate)) / MS_IN_DAY) / DAYS_IN_YEAR);

    if (dateCon < 0) {
      dateCon = YEARS_FROM_1970 + (-dateCon);
    }

    return dateCon;
  }
};

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
  })

  return filteredFriends;
}

const getGender = (gender) => {
  if (gender === 1 || gender === 2) {
    return gender;
  } else {
    return `Не определен`
  }
};

const initialState = {
  friends: [],
  friendsFiltered: [],
  idFriends: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.PUSH_FRIENDS:
      const formatFriends = action.payload.map((friend) => {
        return ({
          avatar: friend[`photo_100`],
          age: getAge(friend[`bdate`]),
          gender: getGender(friend[`sex`]),
          id: friend.id,
          lastName: friend[`last_name`],
          name: friend[`first_name`],
        })
      });
      return {
        ...state,
        friends: state['friends'].concat(formatFriends),
        friendsFiltered: state['friendsFiltered'].concat(formatFriends),
      }

    case ActionType.PUSH_FRIENDS_ID:
      return {
        ...state,
        idFriends: state['idFriends'].concat(action.payload)
      }

    case ActionType.SET_FILTERS:
            getFilteredFriendsList(state.friends, action.payload)
      return {
        ...state,
        friendsFiltered: getFilteredFriendsList(state.friends, action.payload),
      }

    default:
      return state;
  }
}

export {
  reducer,
};