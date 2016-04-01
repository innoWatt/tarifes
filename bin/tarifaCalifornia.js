/*
	TARIFA California, implementació
	Autor: Lluís Bosch
*/

function tarifaCalifornia(input)
{
	//desempaqueta la variable input en "temps", "blocs" i "potència"
	var temps = input[0]; 	//temps es un array d'objectes Date()
	var blocs = input[1]; 	//blocs es un array d'enters (1,2,3,4,5 ò 6)
	var poten = input[2]; 	//poten es un array de floats (potencia kW)

	// Definició de blocs pel cas americà. definim:
	/*
		P1:  on-peak summer
		P2:	mid-peak summer
		P3: off-peak summer
		P4: mid-peak winter
		P5: off-peak winter
	*/

	//"maxim" es un array on anirem guardant la potència màxima per cada bloc. maxim[p][i] (bloc p, dada i)
	var maxim = new Array();
	for (var p=1; p<6; p++)
		maxim[p] = new Array();

	//emplena els maxims de zeros per començar
	for(var i=0; i<temps.length; i++)
		for (var p=1; p<6; p++)
			maxim[p][i]=0;

	//troba els valors de potència maxima a cada instant i
	for(var i=0; i<temps.length; i++)
	{
		//primer abans de res posa el valor anterior màxim trobat
		for (var p=1; p<6; p++)
			maxim[p][i] = Math.max.apply(null,maxim[p]);

		//ara actualitza el valor del màxim si la potència actual és més gran 
		//bloc actual
		var b = blocs[i];

		//maxim actual
		var maxim_i = Math.max.apply(null,maxim[b]);

		//sobreescriu el valor
		if (poten[i] > maxim_i)
			maxim[b][i] = poten[i];
		else
			maxim[b][i] = maxim_i;
	}

	//preus per kW per cada període (p1,p2,...,p6)
	var preus = new Array();
	preus[1] = eurKWP1; preus[2] = eurKWP2; preus[3] = eurKWP3; preus[4] = eurKWP4; preus[5] = eurKWP5;

	//calculem el cost (€) de la potencia
	var term_poten = new Array();

	//recorrem el temps per calcular term_poten
	for(var i=0; i<temps.length; i++)
	{
		//inicialitza a 0
		term_poten[i] = 0;

		//recorre tots els blocs tarifaris
		for(var p=1; p<6; p++)
		{
			// en el cas america, es factura la màxima multiplicat pel preu
			term_poten[i] += parseFloat(maxim[p][i]) * parseFloat(preus[p]);
		}
	}
		
	//----------------------------------------------------------------------
	//2. TERM ENERGIA
	//----------------------------------------------------------------------
	//calculem energia (kWh) consumida a partir de potència (kW) (fent la integral)

	//energia consumida (kWh) a cada bloc p (acumulada). energia[p][i]
	var energia = new Array(); 

	//energia consumida a cada bloc (1,2,3,4,5,6)
	for(var p=1; p<6; p++)
		energia[p] = new Array();

	//omplim de zeros el vector d'energia. dada i, periode p
	for(var i=0; i<temps.length; i++)
		for(var p=1; p<6; p++)
			energia[p][i] = 0;

	//valor inicial de la integral de la potència (energia en kWh)
	energia[blocs[0]][0] = 0 + poten[0]*tint;;

	//recorrem el temps i anem acumulant l'energia consumida multiplicant la potència pel timestep en hores (~integral)
	for(var i=1;i<temps.length;i++)
	{
		//primer posa l'energia i igual a l'anterior (que per força serà el màxim)
		for(var p=1; p<6; p++)
			energia[p][i] = Math.max.apply(null,energia[p]); 

		//actualitza l'energia només pel bloc actual, i suma el valor anterior perquè sigui l'acumulada
		var b = blocs[i];
		energia[b][i] = energia[b][i-1] + poten[i] * tint;  //integral
	}

	//Calculem el cost (€) de l'energia consumida. Llegim els preus de la pàgina
	var preus = new Array(); //per p1,p2,p3,p4 i p5
	preus[1] = eurKWhP1; preus[2] = eurKWhP2; preus[3] = eurKWhP3; preus[4] = eurKWhP4; preus[5] = eurKWhP5;

	//ara anem sumant dia a dia el que costa l'energia activa (€)
	var term_energ = new Array();

	//valor inicial
	term_energ[0] = 0 + energia[blocs[0]][0] * preus[blocs[0]];

	//recorrem el temps
	for(i=1; i<temps.length; i++)
	{
		term_energ[i] = term_energ[i-1];

		//recorrem cada bloc i li sumem l'energia consumida aquest instant de temps multiplicat pel preu
		for(var p=1; p<6; p++)
			term_energ[i] += (energia[p][i] - energia[p][i-1]) * preus[p];
	}

	//----------------------------------------------------------------------
	//4. COSTOS TOTALS
	//----------------------------------------------------------------------
		//suma dels costos (€) energia + potència (fix i penalitzacions)
		var suma_termes = new Array()

		//customer charges: se sumen al final de tot TODO
		var customer_charges = 312.31

		for (var i=0; i<temps.length; i++)
		{
			//suma els costos de: energia, el terme fix de potència i energia reactiva
			suma_termes[i] = term_energ[i] + term_poten[i] + customer_charges
		}
	
	//aquí ja hauria acabat la funció. Ara mostrem per pantalla els resultats:

	//mostra per cada instant de temps el preu a pagar total
	/*
	for (var i=0; i<temps.length; i++)
	{
		console.log(temps[i].toUTCString()+"		"+poten[i]+" kW, 	total: "+suma_termes[i]+" €");
	}
	*/

	var fi = temps.length-1; //index final

	//RESUM
	console.log("\n[+] RESUM				 P1 (on-ps)	P2 (m-ps)	P3 (off-ps)	P4 (m-pw)	P5 (o-pw)");
	console.log("	Preus Energia	 	[$/kWh]: "+eurKWhP1+"	"+eurKWhP2+"	"+eurKWhP3+"	"+eurKWhP4+"	"+eurKWhP5);
	console.log("	Preus Potència	 	 [$/kW]: "+eurKWP1+"	" +eurKWP2+"	" +eurKWP3+"	" +eurKWP4+"	" +eurKWP5);
	console.log("	Max Potència		   [kW]: "+maxim[1][fi]+"	"+maxim[2][fi]+"	"+maxim[3][fi]+"	"+maxim[4][fi]+"	"+maxim[5][fi]);
	console.log("	-----------------------------------------------------------------------------------------------------");
	console.log("	Term energ var		    [$]: "+term_energ[fi]);
	console.log("	Term poten		    [$]: "+term_poten[fi]);
	console.log("	TOTAL 		            [$]: "+suma_termes[fi]+"\n");

	return suma_termes[fi];
}
