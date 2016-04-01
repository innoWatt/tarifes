/*
	TARIFA 6 (espanya)
	Implementació de la tarifa 6
	Autor: Lluís Bosch
*/

function tarifa6(input)
{
	//desempaqueta la variable input en "temps", "blocs" i "potència"
	var temps = input[0]; 	//array d'objectes Date()
	var blocs = input[1]; 	//array d'enters (1,2,3,4,5 ò 6)
	var poten = input[2]; 	//array de floats (potencia kW)

	//necessitem calcular "term_potencia" + "term_energia" + "compl_reactiva":

	//1. TERM POTENCIA: hi ha un terme fix i penalitzacions
		//potConP{1,2,3,4,5,6} és la potència contractada en kW per cada bloc. Son variables globals.
		var potCon = new Array();
		potCon[1]=potConP1; potCon[2]=potConP2; potCon[3]=potConP3; potCon[4]=potConP4; potCon[5]=potConP5; potCon[6]=potConP6;

		/* EXCESSOS */
		//"exces": nou array d'arrays de booleans on anirem guardant si en l'instant i hi ha o no un excés de potència (1 ò 0) pel bloc p
		// exemple: exces[p][i]==true (bloc p, instant i)
		var exces = new Array(); for (var p=1; p<7; p++) exces[p] = new Array();
		//emplena els arrays amb trues o falses
		for(var i=0; i<temps.length; i++)
			for (var p=1; p<7; p++)
				exces[p][i] = parseFloat(poten[i]) > parseFloat(potCon[p]); // Aquesta expressió valdrà true o false

		//preus per kW per cada període (p1,p2,...,p6)
		var preus = new Array();
		preus[1] = eurKWP1; preus[2] = eurKWP2; preus[3] = eurKWP3; preus[4] = eurKWP4; preus[5] = eurKWP5; preus[6] = eurKWP6;

		//calculem el cost (€) de la potencia
		var term_poten = new Array();

		//terme exces de potència PENALITZACIONS. term_exces[p][i] (bloc p, dada i)
		var term_exces = new Array(); for(var p=1; p<7; p++) term_exces[p] = new Array();
		var excessos = new Array(); //suma dels euros d'excessos pels 6 blocs

		//les Ac i les k estan explicades al boe com calcular-les: BOE 1164/2001: 
		//hi ha una Ac per cada bloc 
		var Ac = new Array(); for(var p=1; p<7; p++) Ac[p] = new Array() 
		var k = new Array(); k[1]=1.00; k[2]=0.50; k[3]=0.37; k[4]=0.37; k[5]=0.37; k[6]=0.17; 

		//recorrem el temps per calcular term_poten i term_exces
		for(var i=0; i<temps.length; i++)
		{
			//inicialitza a 0
			term_poten[i] = 0;

			//recorre tots els blocs tarifaris
			for(var p=1; p<7; p++)
			{
				// PART FIXA en la 6.1, es factura sempre la potència contractada multiplicat pel preu /12
				term_poten[i] += (potCon[p]*preus[p])/12;
			}

			//suma les penalitzacions (terme exces de la potència)
			excessos[i]=0;
			for(var p=1; p<7; p++) 
			{
				// EXCESSOS. inicialitza'l a 0
				term_exces[p][i] = 0;

				//suma de totes les potències que es passen de la potència contractada
				var suma_Pdj_menys_Pci_al_quadrat = 0;

				//aplica penalitzacions: tots els moments que s'ha superat la potència contractada fins a l'instant i
				for(var j=0; j<=i; j++)
					if(exces[p][j] && blocs[j]==p)
						suma_Pdj_menys_Pci_al_quadrat += Math.pow(poten[j]-potCon[p],2);
					
				//calcula Ac
				Ac[p][i] = Math.sqrt(suma_Pdj_menys_Pci_al_quadrat);

				//el 1.40596 és el 234 que surt el boe. 234 és en pessetes, i aquest valor és en euros
				term_exces[p][i] += k[p] * 1.40596 * Ac[p][i];	
				excessos[i] += term_exces[p][i];
			}
		}
		
	//----------------------------------------------------------------------
	//2. TERM ENERGIA
	//----------------------------------------------------------------------
		//calculem energia (kWh) consumida a partir de potència (kW) (fent la integral)

		//energia consumida (kWh) a cada bloc p (acumulada). energia[p][i]
		//energia consumida a cada bloc (1,2,3,4,5,6)
		var energia = new Array(); for(var p=1; p<7; p++) energia[p] = new Array();

		//omplim de zeros el vector d'energia. dada i, periode p
		for(var i=0; i<temps.length; i++)
			for(var p=1; p<7; p++)
				energia[p][i] = 0;

		//valor inicial de la integral de la potència (energia en kWh)
		energia[blocs[0]][0] = 0 + poten[0]*tint;;

		//recorrem el temps i anem acumulant l'energia consumida multiplicant la potència pel timestep en hores (~integral)
		for(var i=1;i<temps.length;i++)
		{
			//primer posa l'energia i igual a l'anterior (que per força serà el màxim)
			for(var p=1; p<7; p++)
				energia[p][i] = Math.max.apply(null,energia[p]); 

			//actualitza l'energia només pel bloc actual, i suma el valor anterior perquè sigui l'acumulada
			var b = blocs[i];
			energia[b][i] = energia[b][i-1] + poten[i] * tint;  //integral
		}

		//Calculem el cost (€) de l'energia consumida. 
		var preus = new Array(); //per p1,p2,p3,p4,p5 i p6
		preus[1] = eurKWhP1; preus[2] = eurKWhP2; preus[3] = eurKWhP3; preus[4] = eurKWhP4; preus[5] = eurKWhP5; preus[6] = eurKWhP6;

		//ara anem sumant dia a dia el que costa l'energia activa (€)
		var term_energ = new Array();

		//valor inicial
		term_energ[0] = 0 + energia[blocs[0]][0] * preus[blocs[0]];

		//recorrem el temps
		for(i=1; i<temps.length; i++)
		{
			term_energ[i] = term_energ[i-1];
			//recorrem cada bloc i li sumem l'energia consumida aquest instant de temps multiplicat pel preu
			for(var p=1; p<7; p++)
				term_energ[i] += (energia[p][i] - energia[p][i-1]) * preus[p];
		}
	//----------------------------------------------------------------------
	//3. COMPL REACTIVA
	//----------------------------------------------------------------------
		//energia reactiva (kVArh). energia_reactiva[p][i] (bloc p, dada i)
		var energia_reactiva = new Array();
		for(var p=1; p<6; p++)
			energia_reactiva[p] = new Array();

		//TODO incialitza tot a zero: esperar tenir dades
		for(var i=0; i<temps.length; i++)
			for(var p=1; p<6; p++)
				energia_reactiva[p][i] = 0;

		//array de cost (euros) d'energia reactiva
		var compl_reactiva = new Array();

		//variables necessàries per calcular l'energia reactiva: exces, cosinus de phi, preu
		var exces = new Array();
		for(var p=1; p<6; p++) exces[p] = new Array();

		var cosPhi = new Array();
		for(var p=1; p<6; p++) cosPhi[p] = new Array();

		var preu = new Array(); 		//el preu va en funció del cosinus de phi
		for(var p=1; p<6; p++) preu[p] = new Array();

		for(var i=0; i<temps.length; i++)
		{
			for(var b=1; b<6; b++)
			{
				//calcula excés
				if (energia_reactiva[b][i] > 0.33*energia[b][i] )
					exces[b][i] = energia_reactiva[b][i] - 0.33*energia[b][i];		
				else
					exces[b][i] = 0;

				//calcula el cosinus de phi
				cosPhi[b][i] = Math.cos( Math.atan( energia_reactiva[b][i] / energia[b][i] ) );

				//calcula el preu de l'energia reactiva en funcio de cosinus de phi
				if(cosPhi[b][i] >= 0.95)		preu[b][i] = 0
				else if(cosPhi[b][i] >= 0.80)	preu[b][i] = 0.041554
				else 							preu[b][i] = 0.062332
			}
		}

		//calcula el cost de l'energia reactiva

		//valor inicial per cada bloc
		compl_reactiva[0] = 0;
		for(var p=1; p<6; p++)
			compl_reactiva[0] += exces[p][0] * preu[p][0];

		for(var i=1; i<temps.length; i++)
		{
			compl_reactiva[i] = compl_reactiva[i-1];
			for(var p=1; p<6; p++)
				compl_reactiva[i] += exces[p][i] * preu[p][i];
		}
	//----------------------------------------------------------------------
	//4. COSTOS TOTALS
	//----------------------------------------------------------------------
		//suma dels costos (€) energia + potència (fix i penalitzacions) + energia reactiva
		var suma_termes = new Array();

		for (var i=0; i<temps.length; i++)
		{
			//suma els costos de: energia, el terme fix de potència i energia reactiva
			suma_termes[i] = term_energ[i] + term_poten[i] + excessos[i] + compl_reactiva[i];
		}

		//total sense iva i amb iva
		var total_sense_iva = new Array();
		var total_amb_iva = new Array();
		for (var i=0; i<temps.length; i++)
		{
			total_sense_iva[i] = suma_termes[i] + suma_termes[i]*tax_im1*tax_im2 + tax_alq;
			total_amb_iva[i] = total_sense_iva[i] * (parseFloat(1)+parseFloat(tax_iva));
		}
	
	//aquí ja hauria acabat la funció. Ara mostrem per pantalla els resultats:

	//mostra per cada instant de temps el preu a pagar total
	/*
	for (var i=0; i<temps.length; i++)
	{
		console.log(temps[i].toUTCString()+"\t\tP"+blocs[i]+"\t\t"+poten[i]+" kW\t\t"+Math.round(100*total_amb_iva[i])/100+" €");
	}
	*/

	var fi = temps.length-1; //index final

	//RESUM
	//console.log("[+] RESUM");
	//console.log("	Potència contractada	   [kW]: "+potConP1+"		"+potConP2+"		"+potConP3+"		"+potConP4+"		"+potConP5+"		"+potConP6);
	//console.log("	Preus Energia	 	[€/kWh]: "+eurKWhP1+"	"+eurKWhP2+"	"+eurKWhP3+"	"+eurKWhP4+"	"+eurKWhP5+"	"+eurKWhP6);
	//console.log("	Preus Potència	 	 [€/kW]: "+eurKWP1+"	" +eurKWP2+"	" +eurKWP3+"	" +eurKWP4+"	" +eurKWP5+"	" +eurKWP6);
	//console.log("	------------------------------------------------------------------------------------------------------------------------");
	//console.log("	Term energ var		    [€]: "+term_energ[fi]);
	//console.log("	Compl reac		    [€]: "+compl_reactiva[fi]);
	//for(var p=1;p<7;p++) console.log(term_exces[p][fi])
	//console.log("	Term poten		    [€]: "+term_poten[fi]);
	//console.log("	Term exces		    [€]: "+excessos[fi]);
	//console.log("	TOTAL + IVA		  [eur]: "+total_amb_iva[fi]);

	return total_amb_iva[fi];
}
