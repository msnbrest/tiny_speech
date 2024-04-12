let _sel, _sels, speaker,

// short list and sort list ok, antispam ok, index of lang ok, +choose lang

bdd={

	tmp: null,
	dispo: true,
	voices_name_to_ind: {},
	voices_arr: [],
	langs: [],
	filter_search: "",
};



const search= {

	txt: null,

	f: _=>{

		search.txt= (val=>{ if(val==""){return " ";}return val.toLowerCase(); })( _sel("#text_search").value );
		for( const elem of _sels("select option")){
			elem.style.display= elem.innerText.toLowerCase().includes(search.txt)? "inline": "none";
		}
	}
},



ind_by_select_or_rand= (isrand,select)=>{

	if( isrand ){ return select.options[ Math.random()*select.options.length|0 ].textContent; }
	return select.selectedOptions[0].textContent;
},



go_read= (opt={})=>{

	if( _sel('#txt_in').value.length<1 || !bdd.dispo ){ return; }
	try{
		// import speaker
		speaker= new SpeechSynthesisUtterance( txt_in.value.trim() );
		speaker.onend= _=>{ bdd.dispo= true; _sel("#btn_go").innerHTML= "Execute"; }
		// set voice
		( selected_name=>{
			if( selected_name==null ){ return; }
			_sel("#voice_is").innerHTML= selected_name;
			speaker.voice= bdd.voices_arr[ bdd.voices_name_to_ind[ selected_name ] ];
		} )( ind_by_select_or_rand( "random" in opt, _sel('#speech_voice') ) );
		// config
		speaker.rate = _sel('#speech_speed').value;
		speaker.pitch = _sel('#speech_pitch').value;
		// speak
		_sel("#btn_go").innerHTML= "speaking";
		bdd.dispo= false; 
		speechSynthesis.speak(speaker);
	}catch(err){ console.info(err); }
},



redraw_select= (tmp,lang)=>{

	(select=>{
		while( select.selectedIndex>-1 ){   select.remove( select.selectedIndex );  }
	})( _sel("#speech_voice") );

	bdd.voices_arr.filter( vv=> vv.lang==lang ).forEach( vv=>{   tmp.push({ lang:vv.lang, name:vv.name });   });

	// sort by text
	tmp.sort( (a,b)=>a.name>b.name );
	list_to_option( _sel('#speech_voice'), tmp, info=>info.name );
},



list_to_option= ( select, list, lambdaname )=>{

	list.forEach( vv=>{
		bdd.tmp= document.createElement('option');
		bdd.tmp.textContent= lambdaname(vv);
		select.appendChild(bdd.tmp);
	});
},



test_init= _=>{

	_sel("#pour_ff").innerHTML+= ".";
	bdd.voices_arr= speechSynthesis.getVoices();

	if( bdd.voices_arr.length<1 ){
		setTimeout( test_init, 250 );
		return;
	}

	_sel("#pour_ff").innerHTML= "";

	bdd.voices_arr.forEach( (voice,kk)=>{
		bdd.voices_name_to_ind[voice.name]= kk;
		bdd.langs.includes(voice.lang) ||( bdd.langs.push(voice.lang) );
	});

	// sort by text
	bdd.langs.sort( (a,b)=>a>b );
	list_to_option( _sel('#speech_lang'), bdd.langs, info=>info );

	redraw_select( [], "fr-FR" );

	_sel('#btn_go').onclick= _=>{ go_read(); };

	_sel('#rand_go').onclick= _=>{ go_read({random:true}); };

	_sel("#speech_lang").onchange= _=>{
		redraw_select( [], _sel("#speech_lang").selectedOptions[0].textContent );
	},

	_sel("#speech_voice").onclick= _=>{
		if( bdd.voices_arr.length<1 ){ _sel("#pour_ff").innerHTML= "Pas de voix? sur firefox il suffit de F5"; return; }
		if( _sel("#text_search").value!=bdd.filter_search ){
			search.f();
			bdd.filter_search= _sel("#text_search").value;
		}
	};
},



init= _=>{

	_sel= sel=> document.querySelector(sel);
	_sels= sel=> document.querySelectorAll(sel);

	_sel("#pour_ff").innerHTML= "Chargement des voix<br>..";
	test_init();
};



window.addEventListener('load', init, false);
