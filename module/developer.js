farm.define('Developer',[],function(Person){
	function Developer(){
		this.career = "developer";
	}

	Developer.prototype = {
		init:function(){
			this.name = "HAX";
			this.age = 27;
		},
		growup: function(){
			this.age++;
		}
	}

	return Developer;

});
