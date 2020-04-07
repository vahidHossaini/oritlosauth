module.exports = class tlosauthConfig
{
    constructor(config)
    { 
         
    }
    getPackages()
    {
       return [
	   {name:'uuid'},
	   {name:'crypto'},
	   ]
    }
    getMessage()
	{
		return{
			default001:"user not exist", 
		}
	}
    getVersionedPackages()
    { 
      return []
    }
    getDefaultConfig()
    {
      return {
		url:"",   
		key:"",   
		 
      }
    }
}