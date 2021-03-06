module.exports = class tlosauthBootstrap{
  constructor(config)
  {
    this.funcs=[
      {
          name:'login', 
          inputs:[
			{
				name:'phone',
				type:'string',
				nullable:false
			}
          ]
      }, 
      {
          name:'verify', 
          inputs:[
			{
				name:'phone',
				type:'string',
				nullable:false
			},
			{
				name:'code',
				type:'string',
				nullable:false
			},
          ]
      }, 
      {
          name:'setPassword', 
          inputs:[
			{
				name:'password',
				type:'string',
				nullable:false
			}, 	
          ]
      },
      {
          name:'checkPassword',  
      },
      {
          name:'loginPass', 
          inputs:[
			{
				name:'phone',
				type:'string',
				nullable:false
			},
			{
				name:'password',
				type:'string',
				nullable:false
			},
          ]
      }, 
	  
	  
	   
    ]
    this.auth=[ 
            'login',
            'verify',
			'loginPass',
			{name:'setPassword',role:'login'},
			{name:'checkPassword',role:'login'},
        ]
  }
}