/**
	PLANTILLA EXEMPLE per calcular una factura
	per executar l'arxiu, executar "node arxiu.js"
**/

//incloure arxius necessaris
	var fs = require("fs");
	function read(f){return fs.readFileSync(f).toString();}
	function include(f){eval.apply(global,[read(f)]);}
	include('bin/classes.js'); include('bin/funcions.js'); 
	include('bin/tarifa3.js');
	include('bin/tarifa6.js');
//fi inclou arxius necessaris

/*
	PASSOS: PER CALCULAR UNA FACTURA CAL DEFINIR 12 INPUTS:
		01. tarifa	
		02. tipus (distribució cada 24 hores)
		03. weekmod (tipus del cap de setmana i festius)
		04. tint (time interval, normalment és 0.25 hores o 1 hora)
		05. festius (en els quals s'aplica el tipus weekmod)
		06. canvisHoraris 
		07. periode (mes o mesos que volem calcular la factura)
		08. impostos
		09. potContractades
		10. preus energia (euros/kWh)
		11. preus potencia (euros/kW)
		12. vector de potència (KW)
*/
	// 1. tarifa. Pot ser "3", "6" o "california" (en aquest cas és la 6)
	tarifa = 6

	// 2. tipus: variable global (funcions.js). Determina quins preus s'apliquen a cada hora del dia
	//hora:              0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23
	tipus.push(new Tipus(6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2 )) //tipus 0
	tipus.push(new Tipus(6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 4, 4 )) //tipus 1
	tipus.push(new Tipus(6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5 )) //tipus 2
	tipus.push(new Tipus(6, 6, 6, 6, 6, 6, 6, 6, 4, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4 )) //tipus 3
	tipus.push(new Tipus(6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2 )) //tipus 4
	tipus.push(new Tipus(6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6 )) //tipus 5 (weekmod)

	// 3. weekmod: número enter. tipus que defineix els caps de setmana i festius (en aquest cas el tipus 5) 
	weekmod = 5

	// 4. tint: 60 minuts (en hores=1. Si és 15 minuts serà 0.25). Això vol dir que disposem d'una dada de potència (kW) cada quart d'hora
	tint = 0.25

	// 5. festius: variable global (funcions.js). És un array d'objectes de la classe DiaFestiu (classes.js)
	festius.push(new DiaFestiu(new Date(Date.UTC(2013,gen,01)), "Any Nou"					  ))
	festius.push(new DiaFestiu(new Date(Date.UTC(2013,mar,29)), "Divendres Sant"			  ))
	festius.push(new DiaFestiu(new Date(Date.UTC(2013,abr,01)), "Dilluns de Pasqua"			  ))
	festius.push(new DiaFestiu(new Date(Date.UTC(2013,mai,01)), "Dia del Treball"			  ))
	festius.push(new DiaFestiu(new Date(Date.UTC(2013,jun,24)), "Sant Joan"					  ))
	festius.push(new DiaFestiu(new Date(Date.UTC(2013,jul,25)), "Sant Jaume (Girona)"		  ))
	festius.push(new DiaFestiu(new Date(Date.UTC(2013,sep,11)), "Diada Nacional de Catalunya" ))
	festius.push(new DiaFestiu(new Date(Date.UTC(2013,oct,12)), "El Pilar"					  ))
	festius.push(new DiaFestiu(new Date(Date.UTC(2013,oct,29)), "Sant Narcís (Girona)"        ))
	festius.push(new DiaFestiu(new Date(Date.UTC(2013,nov,01)), "Tots Sants"				  ))
	festius.push(new DiaFestiu(new Date(Date.UTC(2013,des,06)), "Dia de la Constitució"		  ))
	festius.push(new DiaFestiu(new Date(Date.UTC(2013,des,25)), "Nadal"						  ))
	festius.push(new DiaFestiu(new Date(Date.UTC(2013,des,26)), "Sant Esteve"				  ))

	// 6. canvisHoraris: interval on s'aplica GMT+1. variable global. És array d'objectes de la classe CanviHorari
	canvisHoraris.push(new CanviHorari(new Date(Date.UTC(2013,gen,01,02,00)), new Date(Date.UTC(2013,gen,02,02,00) )))

	// 7. periodes: periode estudiat. variable global. Array d'objectes de la classe Periode
	// Un període es defineix pel seu tipus, data inicial i data final de la forma "new Periode(tipus,data inicial,data final)"
	periodes.push(new Periode( 0, 	new Date(Date.UTC(2013,gen,01)), 	new Date(Date.UTC(2013,feb,01)) ))

	// 8. impostos. Són directament números
	tax_alq = 0			//lloguer
	tax_im1 = 0.04864	//impostos 1
	tax_im2 = 1.05113	//impostos 2
	tax_iva = 0.21		//iva

	// 9. potències contractades (kW). Variables globals. Són directament números
	potConP1 = 200
	potConP2 = 200
	potConP3 = 200
	potConP4 = 200
	potConP5 = 200
	potConP6 = 451

	// 10. preus per kWh per cada període (p1,p2,...,p6). Variables globals. Són directament números
	eurKWhP1 = 0.11871
	eurKWhP2 = 0.098119
	eurKWhP3 = 0.091493
	eurKWhP4 = 0.078088
	eurKWhP5 = 0.075207
	eurKWhP6 = 0.063844

	// 11. preus per kW per cada període (p1,p2,...,p6). Variables globals. Són directament números
	eurKWP1 = 38.102134
	eurKWP2 = 19.067559
	eurKWP3 = 13.954286
	eurKWP4 = 13.954286
	eurKWP5 = 13.954286
	eurKWP6 = 6.366846

	// 12. vectorPotencia: energy (kW). Variable global. array de números. Una dada cada "tint" hores
	energy=[
		408,
		424,
		448,
		440,
		420,
		480,
		460,
		//[... 2976 dades més en un mes]
	];
// FI INPUTS

/*
	Un cop tenim els 12 inputs definits, cridem la funcio calcula() i guardem el resultat a una nova variable que anomenem "cost"
*/

var cost = calcula()[0]
console.log(cost+" euros");
