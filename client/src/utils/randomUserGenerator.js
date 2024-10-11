function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomUsers(numUsers) {
  const names = [
    "John Doe",
    "Jane Smith",
    "Michael Brown",
    "Emily Davis",
    "Chris Johnson",
  ];
  const messages = [
    "Hi there! How are you?",
    "Hello, good to see you.",
    "What’s up?",
    "Long time no see!",
    "Can we meet tomorrow?",
  ];
  const statuses = ["sent", "delivered", "seen", ""];
  const profilePicUrls = [
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
  ];

  const randomUsers = [];

  for (let i = 1; i <= numUsers; i++) {
    const user = {
      _id: i,
      profile: getRandomElement(profilePicUrls),
      name: getRandomElement(names),
      msgStatus: getRandomElement(statuses),
      recentMsg: getRandomElement(messages),
      lastSeen: `${Math.floor(Math.random() * 60)}m`,
      msgCount: Math.floor(Math.random() * 100),
    };

    randomUsers.push(user);
  }

  return randomUsers;
}

export default generateRandomUsers;
