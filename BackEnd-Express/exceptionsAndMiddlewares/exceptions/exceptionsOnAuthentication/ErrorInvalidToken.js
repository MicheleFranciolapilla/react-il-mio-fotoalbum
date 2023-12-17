class ErrorInvalidToken extends Error 
{
    constructor(message) 
    {
      super(message);
      this.status = 498;
    }
}
  
module.exports = ErrorInvalidToken;