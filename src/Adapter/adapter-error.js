 class AdapterError extends Error {
  constructor(message, code, fileName, lineNumber) {
    super(message, fileName, lineNumber);
    this._code = code;

    this.code = () => {
      return this._code;
    }
  }
}

export default AdapterError;