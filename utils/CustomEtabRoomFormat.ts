function getEtabRoom(room: string = ''): { building: string, room: string, other: string | null } | undefined {
  // lettre suivie de 2 ou 3 chiffres
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
