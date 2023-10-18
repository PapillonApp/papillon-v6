export class SkolengoBase {
  static BASE_URL = 'https://api.skolengo.com/api/v1/bff-sko-app';

  static OID_CLIENT_ID_HIDDEN = [
    83, 107, 111, 65, 112, 112, 46, 80, 114, 111, 100, 46, 48, 100, 51, 52, 57,
    50, 49, 55, 45, 57, 97, 52, 101, 45, 52, 49, 101, 99, 45, 57, 97, 102, 57,
    45, 100, 102, 57, 101, 54, 57, 101, 48, 57, 52, 57, 52,
  ];

  static OID_CLIENT_SECRET_HIDDEN = [
    55, 99, 98, 52, 100, 57, 97, 56, 45, 50, 53, 56, 48, 45, 52, 48, 52, 49, 45,
    57, 97, 101, 56, 45, 100, 53, 56, 48, 51, 56, 54, 57, 49, 56, 51, 102,
  ];

  static OID_CLIENT_ID = this.OID_CLIENT_ID_HIDDEN.map((e) =>
    String.fromCharCode(e)
  ).join('');

  static OID_CLIENT_SECRET = this.OID_CLIENT_SECRET_HIDDEN.map((e) =>
    String.fromCharCode(e)
  ).join('');

  static searchParamsSerialiser = (arr, prekey = '', notroot = false) => {
    const result = Object.entries(arr).reduce(
      (acc, [key, value]) =>
        value === null || value === undefined || value === '' || value === false
          ? acc
          : typeof value === 'object'
          ? {
              ...acc,
              ...this.searchParamsSerialiser(
                value,
                notroot ? `${prekey}[${key}]` : `${key}`,
                true
              ),
            }
          : { ...acc, [notroot ? `${prekey}[${key}]` : key]: value },
      {}
    );
    if (notroot) return result;
    return this.objToUrlParams(result);
  };

  static objToUrlParams = (obj) => {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([key, value]) => {
      params.append(key, value);
    });
    if (params.size === 0) return '';
    return `?${params.toString()}`;
  };

  static dateParser = (date) =>
    Number.isNaN(new Date(date).getTime())
      ? undefined
      : new Date(date).toISOString().split('T')[0];

  static dateVerifier = (...dates) =>
    dates.every((date) => {
      const d = new Date(date);
      return d instanceof Date && !Number.isNaN(d.getTime());
    });
}
