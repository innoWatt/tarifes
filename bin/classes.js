/* 
	CLASSES
	Propietats i comportaments de diferents conceptes dins el càlcul d'una factura elèctrica
	Autor: Lluís Bosch
*/

function Tipus(h0,h1,h2,h3,h4,h5,h6,h7,h8,h9,h10,h11,h12,h13,h14,h15,h16,h17,h18,h19,h20,h21,h22,h23)
//un Tipus és una sequencia de 24 blocs, un per cada hora del dia
{
    this.h=new Array(24);
    this.h[0]=h0; 
    this.h[1]=h1; 
    this.h[2]=h2; 
    this.h[3]=h3; 
    this.h[4]=h4; 
    this.h[5]=h5; 
    this.h[6]=h6; 
    this.h[7]=h7; 
    this.h[8]=h8; 
    this.h[9]=h9; 
    this.h[10]=h10; 
    this.h[11]=h11; 
    this.h[12]=h12; 
    this.h[13]=h13; 
    this.h[14]=h14; 
    this.h[15]=h15; 
    this.h[16]=h16; 
    this.h[17]=h17; 
    this.h[18]=h18; 
    this.h[19]=h19; 
    this.h[20]=h20; 
    this.h[21]=h21; 
    this.h[22]=h22; 
    this.h[23]=h23;
}

function Periode(tipus,data_inici,data_final)
//un Periode és un tipus que s'aplica entre dues dates durant els dies laborals
{
	//tipus associat als dies laborables del Període (nombre enter)
	this.tipus = tipus;

	//les dates d'inici i final han de ser UTC per evitar problemes de canvis d'hora: new Date(Date.UTC(any,mes,dia))
	this.data_inici = data_inici;
	this.data_final = data_final;
}

function DiaFestiu(data,nom)
//un dia festiu. Definit per una data (objecte Date) i un nom (string)
{
	this.data = data;
	this.nom = nom;
}

function CanviHorari(dataInici,dataFinal)
//Defineix un període de temps on la hora és GMT+1 (una hora més). Definit per data inici i final (objectes Date)
{
	this.dataInici = dataInici;
	this.dataFinal = dataFinal;
}
