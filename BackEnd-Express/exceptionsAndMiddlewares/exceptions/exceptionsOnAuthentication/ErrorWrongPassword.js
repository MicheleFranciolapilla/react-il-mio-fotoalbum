class ErrorWrongPassword extends Error 
{
    constructor(message) 
    {
      super(message);
      this.status = 401;
    }
}
  
module.exports = ErrorWrongPassword;