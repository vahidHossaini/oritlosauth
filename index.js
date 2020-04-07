var uuid=require("uuid");
var crypto = require('crypto');
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
	async loginPass(msg,func,self)
	{
		var dt=msg.data; 
		console.log('---->',dt)
		var user = await global.db.SearchOne(self.context,'tlosauth_users', {where:{_id:dt.phone}});
		
		if(!user)
			return func({m:"tlos003"})	
		if(user.wrongTime && user.wrongTime>3)
		{
			if(!user.wrongDate)
			{
				user.wrongDate=(new Date()).getTime()+1000*60*3;
				await global.db.Save(self.context,'tlosauth_users',["_id"],{_id:dt.phone,wrongDate:user.wrongDate});
			}
			if(user.wrongDate>(new Date()).getTime())
				return func({m:"tlos004"})	
			
			await global.db.Save(self.context,'tlosauth_users',["_id"],{_id:dt.phone,wrongDate:0,wrongTime:0});
			user.wrongTime=0;
		}
		var hash = crypto.createHash('sha256').update(dt.password).digest('hex');
		console.log(hash)
		console.log(dt.password)
		console.log(user.password)
		if(user.password != hash)
		{
			if(!user.wrongTime)
				user.wrongTime=0;
			user.wrongTime++;
			await global.db.Save(self.context,'tlosauth_users',["_id"],{_id:dt.phone,wrongTime:user.wrongTime});
			return func({m:"tlos003"})	
		}
		return func (null,{session:[
				{name:'userid',value:user.userid},
				{name:'type',value:'smsAuth'},
				{name:'roles',value:user.role},
			] 
		  }) 
	}
	async setPassword(msg,func,self)
	{
		var dt=msg.data; 
		var session =msg.session;
		var user = await global.db.SearchOne(self.context,'tlosauth_users',{where:{userid:session.userid}});
		var hash = crypto.createHash('sha256').update(dt.password).digest('hex');
		if(!user)
		{
			if(!session.phone)
				return func({m:"tlos001"})
			var acc = await global.acc.existAccount({$filter:"phones/number eq '"+session.phone+"'"});
			if(!acc)
				return func({m:"tlos001"})
			user={
				_id:session.phone,
				userid:session.userid,
				password:hash,
				role:acc.value[0].roles
			}
			await global.db.Save(self.context,'tlosauth_users',["_id"],user);
			return func(null,{})
		}
		else
		{
			await global.db.Save(self.context,'tlosauth_users',["_id"],{_id:user._id,password:hash});
			return func(null,{})
		}
		
	}
	async checkPassword(msg,func,self)
	{
		console.log('---------------')
		console.log(msg.session)
		var dt=msg.data; 
		var session =msg.session;
		var user = await global.db.SearchOne(self.context,'tlosauth_users',{where:{userid:session.userid}});
		if(!user)
			return func({m:"tlos001"})
		if(user.password)
			return func(null,{})
		return func({m:"tlos002"})
	}
	async login(msg,func,self)
	{
		var dt=msg.data; 
        var a = await global.web.post(self.config.url+'registrations',{smsNumber:dt.phone},{'x-api-key':self.config.key});
		console.log('>>>',a)
		console.log('>>>',self.config.key)
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
        console.log(data.message)
		if(data.message.indexOf("The OTP provided does not match")>-1)
		{
			return func({m:"001"})
		}
        var acc = await global.acc.existAccount({$filter:"phones/number eq '"+dt.phone+"'"});
		if(!acc)
		{
			if(dt.phone.substr(0,2)=="98")
				acc= await global.acc.existAccount({$filter:"phones/number eq '"+dt.phone.substr(2)+"'"});
		}
		var userid = uuid.v4();
		var roles=await global.db.SearchOne(self.context,'global_options',{where:{name:'smsauth_role'}});
		if(!roles)
			roles={role:0}
		if(acc.value.length)
		{
			userid=acc.value[0].id
			var r=acc.value[0].roles
			roles.role=r|roles.role; 
			await global.acc.update(userid,'roles',roles.role);
		}
		else
		{ 
			await global.acc.create(userid,roles.role);
			await global.acc.update(userid,'phones',[{number:dt.phone}]);
		}
		await global.db.Save(self.context,'tlosauth_users',["_id"],{_id:dt.phone,userid:userid,role:roles.role});
		return func (null,{session:[
				{name:'userid',value:userid},
				{name:'type',value:'smsAuth'},
				{name:'roles',value:roles.role},
			] 
		  }) 
	}
}