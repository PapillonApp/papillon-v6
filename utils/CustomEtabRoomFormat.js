function getEtabRoom(room = '') {
  // letter followed by 2 or 3 digits
  const regex = /(?:[A-Z]) ?(?:\d{2,3})/;
  const match = regex.exec(room.split(' ')[0]);
  if (match) {
    return {
      building: match[0][0],
      room: match[0].slice(1).trim(),
      other: room.split(' ')[1] || null
    };
  }
}

export default getEtabRoom;
