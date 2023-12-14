class ErrorFromDB extends Error 
{
    constructor(message) 
    {
      super(message);
      this.status = 503;
    }
}
  
module.exports = ErrorFromDB;