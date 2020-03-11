var uuid=require("uuid");
module.exports = class tlosauthIndex
{
	constructor(config,dist)
	{
		this.config=config.statics
		this.context=this.config.context 
        this.bootstrap=require('./bootstrap.js')
        this.enums=require('./struct.js') 
        this.tempConfig=require('./config.js')
		//global.acc=new accountManager(dist)
	}
	async login(msg,func,self)
	{
		var dt=msg.data; 
        await global.web.post(self.config.url+'registrations',{smsNumber:dt.phone},{'x-api-key':self.config.key});
		return func(null,{});
	}
	async verify(msg,func,self)
	{
		var dt=msg.data; 
        var data =   await global.web.post(self.config.url+'accounts',{
            smsNumber:dt.phone,
            "smsOtp": dt.code,
            "telosAccount": "vahidtest",
            "ownerKey": "EOS6YK2nm32KPtojJ8YziNMhU3Tmk3wt3czXTbehtrUyEiyUvub4Y",
            "activeKey": "EOS6YK2nm32KPtojJ8YziNMhU3Tmk3wt3czXTbehtrUyEiyUvub4Y"
            
            },{'x-api-key':self.config.key});
        console.log(data)    
		return func(null,{});
	}
}