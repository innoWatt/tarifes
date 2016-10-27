/*
	TARIFA 3 (espanya)
	Implementació de la tarifa 3.0
	Autor: Lluís Bosch
*/

function tarifa3(input)
{
	//desempaqueta la variable input en "temps", "blocs" i "potència"
	var temps=input[0];
	var blocs=input[1];
	var poten=input[2];

	//calcularem 3 grans coses: "term_potencia" + "term_energia" + "compl_reactiva"

	//1. TERM POTENCIA
		//potConP{1,2,3} és la potència contractada en kW per cada bloc. Son variables globals.
		var potCon = new Array();
		potCon[1]=potConP1; potCon[2]=potConP2; potCon[3]=potConP3;

		//array on anirem guardant la potència màxima per cada bloc
		var maxim = new Array(3);
		maxim[1] = new Array();
		maxim[2] = new Array();
		maxim[3] = new Array();

		//emplena els arrays de zeros per començar
		for(var i=0; i<temps.length; i++)
		{
			maxim[1][i]=0;
			maxim[2][i]=0;
			maxim[3][i]=0;
		}

		for(var i=0; i<temps.length; i++)
		{
			//primer abans de res posa el valor anterior màxim trobat
			maxim[1][i] = Math.max.apply(null,maxim[1]);
			maxim[2][i] = Math.max.apply(null,maxim[2]);
			maxim[3][i] = Math.max.apply(null,maxim[3]);
			//i ara actualitza el valor del màxim si la potència actual és més gran 

			//bloc actual
			var b = blocs[i];

			//si el bloc actual és més gran de 3 és que no es tracta d'una tarifa 3
			if(b>3) { alert("Error. (Tarifa errònia?)"); return; }

			//maxim actual
			var maxim_i = Math.max.apply(null,maxim[b]);

			//sobreescriu el valor, o deixa el màxim trobat
			if (poten[i] > maxim_i)
				maxim[b][i]=poten[i];
			else
				maxim[b][i]=maxim_i;
		}

		//preus eurkW
		var preus = new Array(); //per p1,p2 i p3
		preus[1]=eurKWP1; preus[2]=eurKWP2; preus[3]=eurKWP3;

		//calculem el cost (eur de la potencia en cada instant
		var term_poten = new Array();

		//recorrem el temps
		for(var i=0; i<temps.length; i++)
		{
			//inicialitza a 0
			term_poten[i] = 0;

			//recorre tots els blocs tarifaris
			for(var j=1; j<4; j++)
			{
				//si la potencia demandada es mes petita al 85% de la contractada...
				if(maxim[j][i] <= 0.85*potCon[j])
				{
					//cobra el 85% de la contractada 
					term_poten[i] += 0.85*potCon[j]*preus[j]; 
				}
				else 
				{
					//si la potencia demandada es mes petita al 105% de la contractada...
					if(maxim[j][i] <= 1.05*potCon[j])
					{
						//cobra la potència màxima demandada 
						term_poten[i] += maxim[j][i]*preus[j];
					}
					else 
					{
						//si la potencia demandada es mes gran al 105% de la potència contractada,
						//cobra la maxima registrada + dues vegades la diferència amb el 105% de la contractada
						var dif = maxim[j][i]-1.05*potCon[j];		// diferència
						var pr = parseFloat(maxim[j][i])+parseFloat(2)*dif; 	// potència registrada
						term_poten[i] += parseFloat(preus[j])*parseFloat(pr);
					}
				}
			}

			//dividir per 12
			term_poten[i]/=12;
		}

	//2. TERM ENERGIA
		//calculem energia (kWh) consumida a partir de potència (kW)

		//energia consumida (kWh)
		var energia = new Array(); 

		//energia consumida a cada bloc (1,2,3)
		energia[1] = new Array();
		energia[2] = new Array();
		energia[3] = new Array();

		//omplim de zeros
		for (var i=0; i<temps.length; i++)
		{
			energia[1][i] = 0;
			energia[2][i] = 0;
			energia[3][i] = 0;
		}

		//valor inicial (energia consumida el primer quart d'hora ò hora (depenent de "tint") )
		energia[blocs[0]][0] = 0 + poten[0]*tint;;

		//recorrem el temps i anem acumulant l'energia consumida multiplicant la potència pel timestep en hores (~integral)
		for(var i=1;i<temps.length;i++)
		{
			//primer posa l'energia i igual a l'anterior (que per força serà el màxim)
			energia[1][i] = Math.max.apply(null,energia[1]); 
			energia[2][i] = Math.max.apply(null,energia[2]); 
			energia[3][i] = Math.max.apply(null,energia[3]); 

			//actualitza només pel bloc actual
			var b = blocs[i];
			energia[b][i] = energia[b][i-1] + poten[i] * tint;  //integral
		}

		//Ara calculem el cost (eur de l'energia consumida
		var preus = new Array(); //per p1,p2 i p3
		preus[1]=eurKWhP1; preus[2]=eurKWhP2; preus[3]=eurKWhP3;

		//ara anem sumant dia a dia el que costa l'energia activa (eur
		var term_energ = new Array();
		term_energ[0] = 0 + energia[blocs[0]][0] * preus[blocs[0]];     //valor inicial

		//recorrem el temps
		for(i=1;i<temps.length;i++)
		{
			term_energ[i] = term_energ[i-1];
			term_energ[i] += (energia[1][i] - energia[1][i-1]) * preus[1];
			term_energ[i] += (energia[2][i] - energia[2][i-1]) * preus[2];
			term_energ[i] += (energia[3][i] - energia[3][i-1]) * preus[3];
		}

	//3. COMPL REACTIVA TODO
		//energia reactiva (kVArh)
		var energia_reactiva = new Array();

		//energia reactiva per cada bloc (1,2)
		energia_reactiva[1] = new Array();
		energia_reactiva[2] = new Array();

		//incialitza tot a zero: esperar tenir dades
		for (var i=0; i<temps.length; i++)
		{
			energia_reactiva[1][i] = 0;
			energia_reactiva[2][i] = 0;
		}

		//euros d'energia reactiva
		var compl_reactiva = new Array();

		//Variables necessàries per calcular l'energia reactiva
		var exces = new Array();
			exces[1] = new Array();
			exces[2] = new Array();
		var cosPhi = new Array();
			cosPhi[1] = new Array();
			cosPhi[2] = new Array();
		var preu = new Array();
			preu[1] = new Array();
			preu[2] = new Array();

		for(var i=0; i<temps.length; i++)
		{
			for(var b=1; b<3; b++)
			{
				//calcula excés
				if (energia_reactiva[b][i] > 0.33 * energia[b][i] )
					exces[b][i] = energia_reactiva[b][i] - 0.33*energia[b][i];		
				else
					exces[b][i] = 0;

				cosPhi[b][i] = Math.cos( Math.atan( energia_reactiva[b][i] / energia[b][i] ) );

				//calcula el preu de l'energia reactiva en funcio de cosinus de phi
				if(cosPhi[b][i] >= 0.95)
					preu[b][i] = 0;
				else if(cosPhi[b][i] >= 0.80)
					preu[b][i] = 0.041554;
				else
					preu[b][i] = 0.062332;
			}
		}

		//calcula el cost de l'energia reactiva
		compl_reactiva[0] = exces[1][0] * preu[1][0] + exces[2][0] * preu[2][0]; //valor inicial
		for(var i=1; i<temps.length; i++)
		{
			compl_reactiva[i] = compl_reactiva[i-1];
			compl_reactiva[i] += exces[1][i] * preu[1][i];
			compl_reactiva[i] += exces[2][i] * preu[2][i];
		}

	//5. COSTOS TOTALS
		//suma dels costos (eur energia + potència + energia reactiva
		var suma_termes = new Array();

		for (var i=0; i<temps.length; i++)
			suma_termes[i] = term_energ[i] + term_poten[i] + compl_reactiva[i];

		//total sense iva i amb iva
		var total_amb_iva = new Array();
		var total_sense_iva = new Array();
		for (var i=0; i<temps.length; i++)
		{
			total_sense_iva[i] = suma_termes[i] + suma_termes[i]*tax_im1*tax_im2 + tax_alq;
			total_amb_iva[i] = total_sense_iva[i] * (parseFloat(1)+parseFloat(tax_iva));
		}

	//aquí ja hem acabat


	//mostra per cada instant de temps el preu a pagar total
	/*
	for(var i=0;i<temps.length;i++)
	{
		console.log(temps[i].toUTCString()+"  P"+blocs[i]+"  "+poten[i]+" kW  "+total_amb_iva[i].toFixed(2)+"  eur");
	}
	desactivat*/

	var fi = temps.length-1; //index final

	//RESUM
	console.log("[+] RESUM");
	console.log("  Màxim potència        [kW]: "+maxim[1][fi]+"    "+maxim[2][fi]+"    "+maxim[3][fi]);
	console.log("  Term poten           [eur]: "+term_poten[fi]);
	console.log("  Term energ var       [eur]: "+term_energ[fi]);
	console.log("  Compl reactiva       [eur]: "+compl_reactiva[fi]);
	console.log("  Total sense IVA      [eur]: "+total_sense_iva[fi]+"\n");
	console.log("  TOTAL + IVA          [eur]: "+total_amb_iva[fi]+"\n");

	//TODO empaquetar els resultats en un objecte de return
	var resultat = {
		maxP1:maxim[1][fi],
		maxP2:maxim[2][fi],
		maxP3:maxim[3][fi],
		poten:term_poten[fi],
		energ:term_energ[fi],
		react:compl_reactiva[fi],
		total:total_amb_iva[fi],
	}

	return resultat;
}
