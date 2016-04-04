/* 
	VARIABLES GLOBALS 
	Variables accessibles des de qualsevol lloc del programa
	Autor: Lluís Bosch
*/
	//tipus de tarifa: 3, 6 ò 'california'
	var tarifa;

	//potències contractades (kW) (només per cas espanyol)
	var potConP1, potConP2, potConP3, potConP4, potConP5, potConP6;

	//preus per kWh per cada període (p1,p2,...,p6)
	var eurKWhP1, eurKWhP2, eurKWhP3, eurKWhP4, eurKWhP5, eurKWhP6;

	//preus per kW per cada període (p1,p2,...,p6)
	var eurKWP1, eurKWP2, eurKWP3, eurKWP4, eurKWP5, eurKWP6;

	//IMPOSTOS (només per espanya)
	var tax_alq, tax_im1, tax_im2, tax_iva;

	//ARRAYS ON GUARDEM TOTA LA INFORMACIÓ DE LA TARIFA
	var tipus = new Array();    		//array d'objectes Tipus
	var periodes = new Array(); 		//array d'objectes Periode
	var festius = new Array();  		//array d'objectes DiaFestiu
	var canvisHoraris = new Array();	//array d'objectes CanviHorari
	var energy;                 		//array de floats (potència (kW))
	var eReact;                 		//array de floats (energia reactiva (kVArh))

	//ALTRES variables importants
	var tint;					//time interval (en hores, per exemple: 0.25)
	var weekmod;				//nº del tipus dels caps de setmana i festius

	//utilitats:
	//mesos passats a numeros per definir periodes i no confondre amb el dia
	var gen=0, feb=1, mar=2, abr=3, mai=4, jun=5, jul=6, ago=7, set=8, oct=9, nov=10, des=11;
/* fi VARIABLES GLOBALS */

/* FUNCIONS */

function calcula()
//funcio "wrapper" que calcula el preu de la factura una vegada estan tots els 11 inputs necessaris definits (veure exemple gener.js)
{
	//genera arrays de temps i blocs per tots els períodes i guarda'ls a la variable global "temps_blocs"
	var temps_blocs = generaBlocs();

	//ara necessitem separar la variable anterior per mesos i guarda-ho a la variable global "estructura"
	var estructura = separaPerMesos(temps_blocs);

	//calcula la tarifa
	var cost = aplicaTarifa(estructura); //retorna un array de costos per mesos

	return cost
}

function generaBlocs()
//Llegeix les variables globals "tipus" i "periodes" i genera el scheduling de tarifa elèctrica
//retorna un array de blocs per cada hora de tots els periodes
{
	//comprova que el weekmod està ben definit
	if (weekmod >= tipus.length){console.log("ERROR. El weekmod fa referència a un tipus que no existeix");return;}

    //calcula quants elements tindrà la taula, donat "tint" i els dies d'inici i final
	//passa els milisegons a hores i llavors divideix per "tint" que està en hores. ha de ser un nombre enter
    var dia_inici = periodes[0].data_inici;
	var dia_final = periodes[periodes.length-1].data_final;
	var nombre_de_timesteps = (dia_final - dia_inici)/3600000/tint + 1; 

	//recorre els canvis horaris per sumar o restar timesteps
	for(var j=0; j<canvisHoraris.length; j++)
	{
		var d_inici = canvisHoraris[j].dataInici 
		var d_final = canvisHoraris[j].dataFinal 

		//si el dia d'inici esta en GMT+1 (com ara maig o octubre)
		if (d_inici <= dia_inici && dia_inici < d_final)
		{
			//RESTAR UNA HORA AL DIA D'INICI: exemple: 1 de juny 00:00 ESP és realment 29 abril 23:00 UTC
			var dia_inici = new Date(periodes[0].data_inici.getTime() - 1*60*60*1000)

			//I si el dia final està en horari d'hivern, suma al nombre de timesteps 1/tint (exemple: 1/.25 = 4)
			//com ara octubre
			if (dia_final < d_inici || d_final < dia_final)
				nombre_de_timesteps += 1/tint;
		}
		else //vol dir que el dia inicial no està en horari d'estiu, com ara març o gener
		{
			//si el dia final està en horari d'estiu resta 1 timestep
			//com ara març
			if (d_inici <= dia_final && dia_final < d_final)
				nombre_de_timesteps -= 1/tint;
		}
	}

	//comprova que el nombre_de_timesteps és igual o més petit al nombre de dades de consum energètic
	//restem 1 perquè la data final no la fem servir
    if(nombre_de_timesteps-1 != energy.length)
    {
    	console.log("ERROR: El nombre de dades ("+energy.length+") no coincideix exactament amb el nombre de timesteps ("+(nombre_de_timesteps-1)+")");
    	return;
    }

    /* CONSTRUCCIÓ DE LA VARIABLE DE RETORN */ 
	var temps = new Array();        //contindrà cada instant de temps en objectes de la classe Date()
	var blocs = new Array();        //contindrà cada bloc corresponent (nombres enters 1,2,3,4,5 ò 6)
	var numer = new Array();        //contindrà la dada número n (~id)

    //itera cada timestep per trobar el bloc correcte
    for(var i=0; i<nombre_de_timesteps; i++)
    {
        //calcula en quin instant de temps estem. Sintaxi: new Date(milisegons)
        var dia_i = new Date(dia_inici.getTime() + i * tint * 3600 * 1000);

		/*
			TENIR EN COMPTE EL CANVI D'HORA:
			si el dia_i està dins l'interval que marca el canvi d'hora, posa la propietat "esHorariEstiu" a l'objecte Date() actual
		*/
       	for(var j=0; j<canvisHoraris.length; j++)
       	{
       		var d_inici = canvisHoraris[j].dataInici 
			var d_final = canvisHoraris[j].dataFinal 
       		if (d_inici <= dia_i && dia_i < d_final)
       		{
				dia_i.esHorariEstiu = 1;
				break;
       		}
       		dia_i.esHorariEstiu = 0;
       	}


		//CLONA L'OBJECTE DIA_I PER CONSIDERAR CANVIS HORARIS I ASSIGNAR BÉ EL PERÍODE I EL BLOC
		var instant_i = new Date(dia_i.getTime());
		//suma 1 a la hora
		if(dia_i.esHorariEstiu) instant_i.setUTCHours(instant_i.getUTCHours()+1);

		//afegim l'instant_i a l'array temps
		temps.push(instant_i);
		//afegim el número i a l'array "numer"
		numer.push(i);

        //recorre tots els periodes per veure en quin període cau l'instant_i
        var periode_actual=0;
        for(var j=0 ; j<periodes.length; j++)
        {
            if (instant_i >= periodes[j].data_inici && instant_i < periodes[j].data_final)
            {
                periode_actual=j;
                break;
            }
            if (j >= periodes.length )
            {
                console.log('error, el dia '+dia_i+' no està dins cap període');
                return;
            }
        }

		//comprova si el dia_i és festiu accedint a la variable global "festius"
        var esFestiu = false;
        for(var j=0; j<festius.length; j++)
        {
        	//Agafa dia, mes i any tant del dia D com del festiu F
        	var dD = instant_i.getUTCDate();
        	var mD = instant_i.getUTCMonth();
        	var aD = instant_i.getUTCFullYear();
        	var dF = festius[j].data.getUTCDate();
        	var mF = festius[j].data.getUTCMonth();
        	var aF = festius[j].data.getUTCFullYear();

        	if(dD==dF && mD==mF && aD==aF)
        	{
        		esFestiu=true;
        		break;
        	}
        };

        //comprova si el dia_i cau en cap de setmana o en FESTIU
		var tipus_actual=0;
        if(instant_i.getUTCDay()==0 || instant_i.getUTCDay()==6 || esFestiu)
            tipus_actual = weekmod;
        else
            tipus_actual = periodes[periode_actual].tipus;

        //comprova hora actual i, finalment, el que ens interessa: el bloc actual
        var hora_actual = instant_i.getUTCHours();
        var bloc_actual = tipus[tipus_actual].h[hora_actual];

        //afegeix el bloc actual a la variable de retorn blocs_totals
        blocs.push(bloc_actual);
    }

    //finalment retornem la variable temps i blocs agrupada en un array de 3 arrays
	var temps_blocs = new Array();
    temps_blocs.push(temps);	//objectes Date()
    temps_blocs.push(blocs);	//enters (1 a 6)
	temps_blocs.push(numer);	//enters (id)
	return temps_blocs;
}

function separaPerMesos(temps_blocs)
//separa l'array de temps, blocs i potència (energy) per mesos en nous arrays
{
	//desempaqueta l'array temps_blocs
	//t: array d'objectes Date(). b: array de nombres enters 1,2,ò 3. n: array de ids (enters)
	var t = temps_blocs[0];
	var b = temps_blocs[1];
	var n = temps_blocs[2];

	//nous arrays d'arrays buits. El primer índex es el mes, i el segon, la dada corresponent. Exemple: mesos[8][3] és l'instant 3 del mes 8
	var mesos = new Array();    //array de arrays de objectes Date()
	var blocs = new Array();    //array de arrays de enters (1,2 ò 3)
	var poten = new Array();    //array de arrays de floats (potència kW)
	var numer = new Array();    //array de arrays de enters (1,2,3,4...)

	//separa per mesos (omple arrays de "mesos")
	mesos[0] = new Array();

	//comptador de mesos
	var j=0;

	//recorre tot el temps t
	for(var i=1; i<t.length; i++) 
	{
		//Afegeix la data (i-1) al vector mesos[j]
		mesos[j].push(t[i-1]);

		//per tenir en compte canvis d'hora: clona l'objecte t[i-1] i t[i] 
		var current_t = new Date(t[i-1].getTime());
		var seguent_t = new Date(t[i  ].getTime());

		//si el mes de la dada i-1 és més petit que la dada següent, augmenta el mes
		if ( current_t.getUTCMonth() < seguent_t.getUTCMonth() || current_t.getUTCFullYear() < seguent_t.getUTCFullYear() )
			mesos[++j] = new Array();
	}

	//si l'ultim mes no te dades, elimina'l
	if(mesos[j].length==0) mesos.pop();

	//Ara cal tenir un vector d'energia i de blocs per cada mes
	blocs[0] = new Array();
	poten[0] = new Array();
	numer[0] = new Array();

	//ara omplim la resta de variables que tindran la mateixa estructura que mesos
	//comptadors de mesos i ids
	var i=0, j=0; 

	mesos.forEach(function(mes)
	{
		mes.forEach(function(moment)
		{
			blocs[i].push(b[j]);
			poten[i].push(energy[j]);  //energy és la variable global carregada des del fitxer (array de floats)
			numer[i].push(j);			//posa el numero j a l'array i incrementa 1
			j++;
		});
		poten[++i] = new Array();
		blocs[i] = new Array();
		numer[i] = new Array();
	});

	//agrupa els arrays en un array de retorn
	var estructura = new Array();
	estructura.push(mesos);
	estructura.push(blocs);
	estructura.push(poten);
	estructura.push(numer);
	return estructura
}

function aplicaTarifa(estructura)
//aplica tarifa 3 ò 6 a tots els mesos
{
	//estructura es un array de 3 elements: mesos, blocs i potencia
	var mesos = estructura[0];
	var blocs = estructura[1];
	var poten = estructura[2];

	//array amb els costos per cada mes
	var cost = new Array();
	
	//crida tarifa per cada mes
	for(var i=0; i<mesos.length; i++)
	{
		var input = new Array();
		input.push(mesos[i]);
		input.push(blocs[i]);
		input.push(poten[i]);
		switch(tarifa)
		{
			case 6:
				cost[i] = tarifa6(input); break;
			case 3:
				cost[i] = tarifa3(input); break;
			case 'california':
				cost[i] = tarifaCalifornia(input); break;
			default:
				console.log('error. tarifa no definida'); return; break;
		}
	}

	//retorna l'array de costos
	return cost;
}

/* UTILS */

function round(number)
//arrodoneix a 2 decimals
{
	return number.toFixed(2);
}
