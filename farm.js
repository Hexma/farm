(function(global, doc, _, undefined){
	var farm = function(){},
		moduleMap = {},
		pathMap = {},
		noop = function(){},
		readyFunctions = [];

	var addListener = doc.addEventListener || doc.attachEvent, 
		removeListener = doc.removeEventListener || doc.detachEvent;

	var eventName = doc.addEventListener ? "DOMContentLoaded" : "onreadystatechange";

	addListener.call(doc, eventName, function () {
		for (var i = readyFunctions.length - 1; i >= 0; i--) {
			if (readyFunctions[i]) {
				for (var j = 0; j < readyFunctions[i].length; j++) {
					readyFunctions[i][j]();
				}
			}
		}
	}, false);
	
	_.extend(farm, {
		base:'',
		config: function(o){
			var configurableAttrs = ['base'];
			for(var p in o){
				if(!this[p] || (configurableAttrs.indexOf(p) < 0)) return;
				this[p] = o[p];
			}
		},
		define: function(name, requirements, factory){
			if(!moduleMap[name]){
				var module = {
					name:name,
					requirements: requirements,
					factory: factory
				}
				moduleMap[name] = module;
			}
			return moduleMap[name];
		},
		use: function(name) {
			var module = moduleMap[name];
			if(!module.fn){
				var args = [];
				for(var i=0,req=module.requirements;i<req.length;i++){
					args.push(req[i].fn || this.use(req[i]));
				}
				module.fn = module.factory.apply(noop, args);
			}
			return module.fn;
		},
		require: function(paths, callback){
			var self=this;
			for(var i=0;i<paths.length;i++){
				loadFile(paths[i]);
			}
			function loadFile(file){
				if(!pathMap[file]){
					var head = document.getElementsByTagName('head')[0],
						script = document.createElement('script');
					script.type = 'text/javascript';
					script.async = true;
					script.src = self.base + file + '.js';
					script.onload = script.onreadystatechange = function(){
						if(!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete'){
							pathMap[file] = true;
							head.removeChild(script);
							startExec();
						}
					}
					head.appendChild(script);
				}
			}
			
			function startExec(){
				for(var i=0;i<paths.length;i++){
					if(!pathMap[paths[i]]){
						return false;
					}
				}
				callback();
			}
		},
		ready: function (handler, priority) {
			priority = priority || 0;

			if (!readyFunctions[priority]) {
				readyFunctions[priority] = [];
			}
			readyFunctions[priority].push(handler);

		}
		
	});

	var Events = {
		on: function (eventType, handler) {
			if (!this.eventMap) {
				this.eventMap = {};
			}

			//multiple event listener
			if (!this.eventMap[eventType]) {
				this.eventMap[eventType] = [];
			}
			this.eventMap[eventType].push(handler);
		},

		off: function (eventType, handler) {
			for (var i = 0; i < this.eventMap[eventType].length; i++) {
				if (this.eventMap[eventType][i] === handler) {
					this.eventMap[eventType].splice(i, 1);
					break;
				}
			}
		},

		fire: function (event) {
			var eventType = event.type;
			if (this.eventMap && this.eventMap[eventType]) {
				for (var i = 0; i < this.eventMap[eventType].length; i++) {
					this.eventMap[eventType][i](event);
				}
			}
		}
	};
	
	_.extend(farm, Events);

	
	farm.define('_',[],function(){return _});

	farm.define('Events', [], function(){return Events;});

	farm.ready(function(){
		farm.require(["core/dom-binding"], function () {
			var binding = farm.use("DOMBinding");
			binding.parse(doc.body);
		});
	});



	global.farm = farm;
})(this, document,  _);


/*
 *DOME
farm.require(m1,m2,function(){
	var s1 = farm.use('m1')

	new s1();
});


farm.define(m3,[m1,m2],function(m1,m2){

});


 */
