let SkolengoNotImplementedWarn = false;
export class SkolengoDataProvider {
  constructor() {
    if (!SkolengoNotImplementedWarn) {
      console.warn('SkolengoDataProvider is not implemented');
      SkolengoNotImplementedWarn = true;
    }
  }
}
